#!/usr/bin/env node
const argv = require('yargs').argv
const express = require('express')
const app = express()
const Busboy = require('busboy')
const fs = require('fs-extra')
const path = require('path')
const bodyParser = require('body-parser')
const dirHandler = require('./show-dir')

function die (msg, code) {
  console.log(msg)
  process.exit(code)
}

if (argv.h || argv.help) {
  die(`🎶 Bossa 🎶
Because bossa-nova is so much better than samba

-h  displays this message
-p  sets the port to listen to  - default 8080
-l  sets the host to listen to  - default to any

e.g. bossa ~/Documents
     bossa -p 9090 ~/Documents

More at https://github.com/pldubouilh/bossa`, 0)
}

const host = argv.l
const port = argv.p || 8080
const servingFolder = argv._[0] || __dirname

app.get('*', (req, res, next) => {
  if (req.url.endsWith('/')) {
    dirHandler(servingFolder, req, res)
  } else {
    next()
  }
})

function isValidPath (p) {
  p = servingFolder + '/' + p
  if (path.normalize(p).startsWith(servingFolder)) {
    return p
  } else {
    throw new Error('Invalid path')
  }
}

function isValidRpc (call) {
  if (call.includes('move') || call.includes('remove') || call.includes('mkdirp')) {
    return call
  } else {
    throw new Error('Invalid instruction')
  }
}

const jsonParser = bodyParser.json()

app.post('/rpc/', jsonParser, async (req, res) => {
  let err
  try {
    const call = isValidRpc(req.body.call)
    const args = req.body.args.map(isValidPath)
    args[1] ? await fs[call](args[0], args[1]) : await fs[call](args[0])
  } catch (e) { err = e }

  res.writeHead(200, { 'Connection': 'close' })
  res.end(err ? err.message : 'done')
})

app.post('/post/*', (req, res) => {
  const extraPath = req.params[0].replace('/post/', '')
  const busboy = new Busboy({ headers: req.headers })
  let err

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    try {
      const pwd = decodeURIComponent(req.headers.referer).split(req.headers.host).pop()
      const p = isValidPath(pwd + extraPath)
      file.pipe(fs.createWriteStream(p))
    } catch (e) { err = e }
  })

  busboy.on('finish', () => {
    res.writeHead(200, { 'Connection': 'close' })
    res.end(err ? err.message : 'done')
  })

  return req.pipe(busboy)
})

app.use(express.static(servingFolder))

app.listen(port, host, (err) => {
  if (err) die(err, 1)
  console.log(`Serving : ${servingFolder} at http://${host || '127.0.0.1'}:${port}`)
})
