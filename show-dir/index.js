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

function render (parsed, pathname, dirs, files) {
  let html = `<!doctype html><html>
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
    <table>
  `

  const writeRow = file => {
    // render a row given a [name, stat] tuple
    const isDir = file[1].isDirectory && file[1].isDirectory()
    let href = `${parsed.pathname.replace(/\/$/, '')}/${encodeURIComponent(file[0])}`

    // append trailing slash and query for dir entry
    if (isDir) {
      href += `/${he.encode((parsed.search) ? parsed.search : '')}`
    }

    let displayName = he.encode(file[0])
    displayName += isDir ? '/' : ''

    const ext = file[0].split('.').pop()
    const iconClass = isDir ? 'folder' : ext.toLowerCase()
    const sizeString = isDir ? '0' : sizeToString(file[1].size)

    html += `<tr>
              <td><i class="btn icon icon-${iconClass} icon-blank"></i></td>
              <td class="file-size"><code>${sizeString}</code></td>
              <td class="arrow"><i class="arrow-icon"></i></td>
              <td class="display-name"><a href="${href}">${displayName}</a></td>
            </tr>`
  }

  dirs.sort((a, b) => a[0].toString().localeCompare(b[0].toString())).forEach(writeRow)
  files.sort((a, b) => a.toString().localeCompare(b.toString())).forEach(writeRow)

  html += `</table>
          <br><address>Node.js ${process.version} / <a href="https://github.com/pldubouilh/bossa">Bossa  🎶</a></address>
          </body></html>`

  return html
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
    const files = []
    const dirs = []

    let _files = await fs.readdir(dir)
    _files = _files.filter(f => f.slice(0, 1) !== '.')

    for (let file of _files) {
      const s = await fs.stat(path.join(dir, file))
      if (s && s.isDirectory()) {
        dirs.push([file, s])
      } else if (s && s.isFile()) {
        files.push([file, s])
      }
    }

    if (pathname !== '/') {
      const s = await fs.stat(path.join(dir, '..'))
      dirs.unshift(['..', s])
    }

    reply(res, 200, render(parsed, pathname, dirs, files))
  } catch (e) {
    console.error(e)
    reply(res, 500, ':(')
  }
}
