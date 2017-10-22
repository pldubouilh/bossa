function cancelDefault (e) {
  e.preventDefault()
  e.stopPropagation()
}

const parseDirRowTxt = el => {
  const parsed = el.innerText.split('0	')[1] // eslint-disable-line
  return parsed ? parsed.replace('/', '') : ''
}

const checkDupes = test => {
  const table = Array.from(document.querySelectorAll('tbody')[0].rows)
  return table.find(el => {
    let parsed = el.children[2].innerText
    return parsed.replace && (parsed.replace('/', '') === test)
  })
}

const invalidName = f => f.includes('/') || f.includes('\\') || f.includes('.')

function mkdir () {
  const folder = window.prompt('New folder name', '')

  if (!folder) {
    return
  } else if (invalidName(folder)) {
    return window.alert('Invalid foldername')
  } else if (checkDupes(folder)) {
    return window.alert('Name already already exists')
  }

  const xhr = new window.XMLHttpRequest()
  xhr.open('POST', window.location.origin + '/mkdir/' + folder)
  xhr.onload = () => {
    const table = document.querySelectorAll('tbody')[0]
    const index = 1 + Array.from(table.rows).findIndex(el => folder > parseDirRowTxt(el))
    table.insertRow(index || 1).innerHTML = `
      <tr>
        <td><i class="icon icon-folder"></i></td>
        <td class="file-size"><code>0</code></td>
        <td class="display-name"><a href="${window.location.pathname + folder}/">${folder}/</a></td>
      </tr>`
  }

  xhr.send()
}

window.mkdir = mkdir

function warning (e) {
  return 'Leaving will interrupt transfer\nAre you sure you want to leave?'
}

function newBar (name) {
  const id = Math.random().toString(36).substring(7)

  document.getElementById('progressBars').innerHTML += `
    <div id="${id}" class="barBackground">
      <span> ${name.split('/').pop()} <span>
      <div class="barForeground">1%</div>
    </div>
  `
  return id
}

function updatePercent (id, percent) {
  const el = document.getElementById(id).querySelectorAll('div.barForeground')[0]
  const width = Math.floor(100 * percent).toString() + '%'
  el.innerText = width
  el.style.width = width
}

function shouldRefresh () {
  totalDone += 1

  if (totalUploads === totalDone) {
    window.onbeforeunload = null
    window.location.reload()
  }
}

function postFile (file, path) {
  totalUploads += 1
  window.onbeforeunload = warning

  const xhr = new window.XMLHttpRequest()
  xhr.open('POST', window.location.origin + '/post' + path)
  xhr.upload.id = newBar(path + '/' + file.name)

  const formData = new window.FormData()
  formData.append(file.name, file)

  xhr.upload.addEventListener('progress', a => {
    updatePercent(a.target.id, a.loaded / a.total)
  })

  xhr.upload.addEventListener('load', shouldRefresh)

  xhr.send(formData)
}

const parseDomFolder = f => {
  f.createReader().readEntries(e => e.forEach(i => parseDomItem(i)))
}

function parseDomItem (domFile, shoudCheckDupes) {
  if (shoudCheckDupes && checkDupes(domFile.name)) {
    return window.alert(domFile.name + ' already exists !')
  }

  if (domFile.isFile) {
    return domFile.file(f => postFile(f, domFile.fullPath || domFile.name))
  }

  const xhr = new window.XMLHttpRequest()
  xhr.open('POST', window.location.origin + '/mkdir/' + domFile.fullPath)
  xhr.send()
  xhr.onload = () => parseDomFolder(domFile)
}

function pushEntry (entry) {
  if (!entry.webkitGetAsEntry && !entry.getAsEntry) {
    return window.alert('Unsupported browser ! Please update to chrome/firefox.')
  } else {
    entry = entry.webkitGetAsEntry() || entry.getAsEntry()
  }

  parseDomItem(entry, true)
}

const upGrid = document.getElementById('drop-grid')

document.ondragenter = (e) => {
  cancelDefault(e)
  e.dataTransfer.dropEffect = 'copy'
  upGrid.style.display = 'flex'
}

upGrid.ondragleave = (e) => {
  cancelDefault(e)
  upGrid.style.display = 'none'
}

document.ondragover = (e) => {
  cancelDefault(e)
  return false
}

document.ondrop = (e) => {
  cancelDefault(e)
  upGrid.style.display = 'none'

  Array.from(e.dataTransfer.items).forEach(pushEntry)
  return false
}

function arrow (down) {
  const all = Array.from(document.querySelectorAll('i.arrow-icon'))
  let i = all.findIndex(el => el.classList.contains('arrow-selected'))

  if (all[i] && all[i].classList) {
    all[i].classList.remove('arrow-selected')
  }

  if (down) {
    i = all[i + 1] ? i + 1 : 0
  } else {
    i = all[i - 1] ? i - 1 : all.length - 1
  }

  window.localStorage.setItem('last-selected' + window.location.href, i.toString())
  all[i].classList.add('arrow-selected')
}

document.body.onkeydown = e => {
  if (e.code.includes('ArrowDown') || e.code.includes('Tab')) {
    e.preventDefault()
    arrow(true)
  } else if (e.code.includes('ArrowUp')) {
    arrow(false)
  } else if (e.code.includes('Enter') || e.code.includes('ArrowRight')) {
    const dest = document.querySelectorAll('i.arrow-selected')[0]
    const a = dest.parentElement.parentElement.querySelectorAll('a')[0]
    window.location.href = a.href
  } else if (e.code.includes('ArrowLeft')) {
    if (window.location.origin === window.location.href.slice(0, -1)) { return }
    const path = window.location.pathname.split('/')
    path.pop()
    path.pop()
    window.location.href = window.location.origin + path.join('/')
  }
}

function init () {
  const all = Array.from(document.querySelectorAll('i.arrow-icon'))
  const i = window.localStorage.getItem('last-selected' + window.location.href)
  all[i].classList.add('arrow-selected')

  console.log('File upload set')
}

let totalUploads = 0
let totalDone = 0
init()
