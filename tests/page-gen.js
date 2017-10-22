const test = require('tape')
const request = require('request')

const defaultBody = `<body>
    <div onclick="window.mkdir()" id="newFolder"></div>
    <div id="drop-grid"> Drop here to upload </div>
    <div id="progressBars"></div>
    <h1>./</h1>
    <table>
  <tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/another-subdir/">another-subdir/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/compress/">compress/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/curimit%40gmail.com%20(40%25)/">curimit@gmail.com (40%)/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/gzip/">gzip/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/show-dir%24%24href_encoding%24%24/">show-dir$$href_encoding$$/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/subdir/">subdir/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/subdir_with%20space/">subdir_with space/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-folder icon-blank"></i></td>
              <td class="file-size"><code>0</code></td>
              <td class="display-name"><a href="/%E4%B8%AD%E6%96%87/">&#x4E2D;&#x6587;/</a></td>
            </tr><tr>
              <td><i class="btn icon icon-html icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/404.html">404.html</a></td>
            </tr><tr>
              <td><i class="btn icon icon-gz icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/404.html.gz">404.html.gz</a></td>
            </tr><tr>
              <td><i class="btn icon icon-txt icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/a.txt">a.txt</a></td>
            </tr><tr>
              <td><i class="btn icon icon-txt icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/b.txt">b.txt</a></td>
            </tr><tr>
              <td><i class="btn icon icon-js icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/c.js">c.js</a></td>
            </tr><tr>
              <td><i class="btn icon icon-opml icon-blank"></i></td>
              <td class="file-size"><code>0.9k</code></td>
              <td class="display-name"><a href="/custom_mime_type.opml">custom_mime_type.opml</a></td>
            </tr><tr>
              <td><i class="btn icon icon-types icon-blank"></i></td>
              <td class="file-size"><code>0.2k</code></td>
              <td class="display-name"><a href="/custom_mime_type.types">custom_mime_type.types</a></td>
            </tr><tr>
              <td><i class="btn icon icon-f_f icon-blank"></i></td>
              <td class="file-size"><code>0.0k</code></td>
              <td class="display-name"><a href="/f_f">f_f</a></td>
            </tr></table>`

test('HTTP GET to http://127.0.0.1:9991', function (t) {
  t.plan(1)

  request('http://127.0.0.1:9991', (e, resp, body) => {
    if (e) { return t.fail(e) }

    if (body.includes(defaultBody)) {
      t.pass('HTTP GET provides test folder')
    } else {
      t.fail('Fail')
    }
  })
})
