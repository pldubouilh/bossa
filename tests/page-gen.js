const test = require('tape')
const request = require('request-promise-native')
const fs = require('fs-extra')
const path = require('path')

const trimSpaces = e => e.replace(/\r?\n|\r/g, '').replace(/\s{2,}/g, ' ')

const defaultBody = trimSpaces(`   <body>
      <div onclick="window.mkdir()" id="newFolder"></div>
      <div onclick="window.picsToggle()" id="picsToggle"></div>
      <div id="pics" style="display:none;"> <div onclick="window.picsToggle()" id="picsToggleCinema"></div> <img  onclick="window.picsNav()" id="picsHolder"/> <span id="picsLabel"></span> </div>
      <div id="drop-grid"> Drop here to upload </div>
      <div id="progressBars"></div>
      <h1>./</h1>
      <table><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/compress">compress/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/curimit%40gmail.com%20(40%25)">curimit@gmail.com (40%)/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/gzip">gzip/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/hols">hols/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/show-dir%24%24href_encoding%24%24">show-dir$$href_encoding$$/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/subdir">subdir/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/subdir_with%20space">subdir_with space/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-folder icon-blank"></i></td>
            <td class="file-size"><code>0</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/%E4%B8%AD%E6%96%87">&#x4E2D;&#x6587;/</a></td>
          </tr><tr>
            <td><i class="btn icon icon-html icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/404.html">404.html</a></td>
          </tr><tr>
            <td><i class="btn icon icon-gz icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/404.html.gz">404.html.gz</a></td>
          </tr><tr>
            <td><i class="btn icon icon-txt icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/a.txt">a.txt</a></td>
          </tr><tr>
            <td><i class="btn icon icon-txt icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/b.txt">b.txt</a></td>
          </tr><tr>
            <td><i class="btn icon icon-js icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/c.js">c.js</a></td>
          </tr><tr>
            <td><i class="btn icon icon-opml icon-blank"></i></td>
            <td class="file-size"><code>0.9k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/custom_mime_type.opml">custom_mime_type.opml</a></td>
          </tr><tr>
            <td><i class="btn icon icon-types icon-blank"></i></td>
            <td class="file-size"><code>0.2k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/custom_mime_type.types">custom_mime_type.types</a></td>
          </tr><tr>
            <td><i class="btn icon icon-f_f icon-blank"></i></td>
            <td class="file-size"><code>0.0k</code></td>
            <td class="arrow"><i class="arrow-icon"></i></td>
            <td class="display-name"><a href="/f_f">f_f</a></td>
          </tr`)

const headers = { Referer: 'http://127.0.0.1:9991/' }
const formData = { file: fs.createReadStream(path.join(__dirname, '/page-gen.js')) }

test('HTTP GET list', async function (t) {
  t.plan(1)
  try {
    const body = await request('http://127.0.0.1:9991')
    if (trimSpaces(body).includes(defaultBody)) { t.pass('') }
  } catch (error) { t.fail(error) }
})

test('HTTP GET file', async function (t) {
  t.plan(1)
  try {
    const body = await request('http://127.0.0.1:9991/subdir_with%20space/index.html')
    if (trimSpaces(body) === 'index :)') { t.pass('') }
  } catch (error) { t.fail(error) }
})

test('HTTP GET utf8 file', async function (t) {
  t.plan(1)
  try {
    const body = await request('http://127.0.0.1:9991/%E4%B8%AD%E6%96%87/%E6%AA%94%E6%A1%88.html')
    if (trimSpaces(body) === '<b>file!!</b>') { t.pass('') }
  } catch (error) { t.fail(error) }
})

test('HTTP POST Mkdir', async function (t) {
  t.plan(2)
  try {
    const body = await request.post({ url: 'http://127.0.0.1:9991/mkdir/a', headers })
    if (body === 'done') { t.pass('') }

    const s = await fs.stat(path.join(__dirname, '/fixture/a'))
    if (s.isDirectory()) { t.pass('') }
  } catch (error) { t.fail(error) }
})

test('HTTP POST File', async function (t) {
  t.plan(2)
  try {
    const body = await request.post({ url: 'http://127.0.0.1:9991/post/testfile.js', headers, formData })
    if (body === 'done') { t.pass('') }

    const s = await fs.stat(path.join(__dirname, '/fixture/testfile.js'))
    if (s.isFile()) { t.pass('') }
  } catch (error) { t.fail(error) }
})
