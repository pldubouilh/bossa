const fs = require('fs-extra')
const path = require('path')
const he = require('he')
const url = require('url')

const css = fs.readFileSync(path.join(__dirname, '/style.css'), 'utf8')
const jsTag = fs.readFileSync(path.join(__dirname, '/jsTag.js'), 'utf8')

function sizeToString (bytes) {
  if (isNaN(bytes)) return '0'

  const units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
  let u = -1
  do {
    bytes /= 1024
    u += 1
  } while (bytes >= 1024)

  return bytes.toFixed(1) + units[u]
}

const writeRow = (name, file, parsed) => {
  let href = `${parsed.pathname.replace(/\/$/, '')}/${encodeURIComponent(name)}`
  let displayName = he.encode(name)
  displayName += file.isDirectory() ? '/' : ''

  const ext = name.split('.').pop()
  const iconClass = file.isDirectory() ? 'folder' : ext.toLowerCase()
  const sizeString = file.isDirectory() ? '0' : sizeToString(file.size)

  return `<tr>
            <td><i class="btn icon icon-${iconClass} icon-blank"></i></td>
            <td class="file-size"><code>${sizeString}</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="${href}">${displayName}</a></td>
          </tr>`
}

function reply (res, status, what) {
  res.setHeader('content-type', 'text/html')
  res.writeHead(status, { 'Content-Type': 'text/html' })
  res.end(what)
}

module.exports = async function resolve (rootFolder, req, res) {
  try {
    const parsed = url.parse(req.url)
    const pathname = decodeURIComponent(parsed.pathname)
    const dir = path.normalize(path.join(rootFolder, path.relative('/', pathname)))

    await fs.stat(dir)

    let _files = await fs.readdir(dir)
    _files = _files.filter(f => f.slice(0, 1) !== '.')

    const head = `<!doctype html><html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>${he.encode(pathname)}</title>
      <title>${he.encode(pathname)}</title>
      <script>window.onload = function(){${jsTag}}</script>
      <style type="text/css">${css}</style>
    </head>
    <body>
      <div onclick="window.mkdir()" id="newFolder"></div>
      <div onclick="window.picsToggle()" id="picsToggle"></div>
      <div id="pics" style="display:none;"> <div onclick="window.picsToggle()" id="picsToggleCinema"></div> <img  onclick="window.picsNav()" id="picsHolder"/> <span id="picsLabel"></span> </div>
      <div id="drop-grid"> Drop here to upload </div>
      <div id="progressBars"></div>
      <h1>.${he.encode(pathname)}</h1>
      <table>`

    let dirs = ''
    let files = ''

    if (pathname !== '/') {
      const s = await fs.stat(path.join(dir, '..'))
      dirs += writeRow('..', s, parsed)
    }

    for (let fname of _files) {
      const s = await fs.stat(path.join(dir, fname))
      if (s && s.isDirectory()) {
        dirs += writeRow(fname, s, parsed)
      } else if (s && s.isFile()) {
        files += writeRow(fname, s, parsed)
      }
    }

    let body = head + dirs + files + `</table>
          <br><address>Node.js ${process.version} / <a href="https://github.com/pldubouilh/bossa">Bossa  🎶</a></address>
          </body></html>`
    reply(res, 200, body)
  } catch (e) {
    console.error(e)
    reply(res, 500, ':(')
  }
}
