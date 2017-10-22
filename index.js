#!/usr/bin/env node
const argv = require('yargs').argv
const express = require('express')
const app = express()
const Busboy = require('busboy')
const fs = require('fs-extra')
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

function resolveFolder (req) {
  const currentUrl = decodeURIComponent(req.headers.referer)
  return servingFolder + currentUrl.split(req.headers.host).pop()
}

function mkdir (req, res) {
  const name = resolveFolder(req) + req.params[0].replace('/mkdir/', '')
  fs.mkdirp(name, err => {
    if (err) return console.error(err)
    res.writeHead(200, { 'Connection': 'close' })
    res.end('done')
  })
}

function postFile (req, res) {
  const extraPath = req.params[0].replace('/post/', '')
  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const where = resolveFolder(req) + extraPath
    file.pipe(fs.createWriteStream(where))
  })

  busboy.on('finish', () => {
    res.writeHead(200, { 'Connection': 'close' })
    res.end('done')
  })

  return req.pipe(busboy)
}

app.post('*', (req, res) => {
  if (req.params[0].startsWith('/mkdir/')) {
    mkdir(req, res)
  } else if (req.params[0].startsWith('/post/')) {
    postFile(req, res)
  }
})

app.use(express.static(servingFolder))

app.listen(port, host, (err) => {
  if (err) die(err, 1)
  console.log(`Serving : ${servingFolder} at http://${host || '127.0.0.1'}:${port}`)
})
