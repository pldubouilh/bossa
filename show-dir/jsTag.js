function cancelDefault (e) {
  e.preventDefault()
  e.stopPropagation()
}

const allA = Array.from(document.querySelectorAll('a'))

const checkDupes = test => allA.find(a => a.innerText.replace('/', '') === test)

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
  xhr.onload = () => window.location.reload()
  xhr.send()
}

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
  if (isPicMode()) { return }
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

let totalUploads = 0
let totalDone = 0

function getASelected () {
  const dest = document.querySelectorAll('i.arrow-selected')[0]
  return !dest ? false : dest.parentElement.parentElement.querySelectorAll('a')[0]
}

function clearArrowSelected () {
  const arr = document.querySelectorAll('.arrow-selected')[0]
  if (!arr) { return }
  arr.classList.remove('arrow-selected')
}

function restoreCursorPos () {
  clearArrowSelected()
  const hrefSelected = window.localStorage.getItem('last-selected' + window.location.href)
  const a = allA.find(el => el.href === hrefSelected)
  if (!a) { return }
  const icon = a.parentElement.parentElement.querySelectorAll('.arrow-icon')[0]
  icon.classList.add('arrow-selected')
}

const storeLastArrowSrc = src => window.localStorage.setItem('last-selected' + window.location.href, src)

function arrow (down) {
  const all = Array.from(document.querySelectorAll('i.arrow-icon'))
  let i = all.findIndex(el => el.classList.contains('arrow-selected'))

  clearArrowSelected()

  if (down) {
    i = all[i + 1] ? i + 1 : 0
  } else {
    i = all[i - 1] ? i - 1 : all.length - 1
  }

  all[i].classList.add('arrow-selected')
  storeLastArrowSrc(getASelected().href)

  const itemPos = all[i].getBoundingClientRect()

  if (i === 0) {
    window.scrollTo(0, 0)
  } else if (i === all.length - 1) {
    window.scrollTo(0, document.documentElement.scrollHeight)
  } else if (itemPos.top < 0) {
    window.scrollBy(0, -150)
  } else if (itemPos.bottom > window.innerHeight) {
    window.scrollBy(0, 150)
  }
}

function setCursorToClosest () {
  const a = allA.find(el => el.innerText.toLocaleLowerCase().startsWith(path))
  if (!a) { return }
  storeLastArrowSrc(a.href)
  restoreCursorPos()
}

function next () {
  if (getASelected().href) {
    window.location.href = getASelected().href
  }
}

function prev () {
  if (window.location.origin === window.location.href.slice(0, -1)) { return }
  const path = window.location.pathname.split('/').slice(0, -2)
  window.location.href = window.location.origin + path.join('/')
}

function cpPath () {
  var t = document.createElement('textarea')
  t.value = getASelected().href
  document.body.appendChild(t)
  t.select()
  document.execCommand('copy')
  document.body.removeChild(t)
}

const pics = document.getElementById('pics')
const picsHolder = document.getElementById('picsHolder')
const picsLabel = document.getElementById('picsLabel')

const picTypes = ['.jpg', '.jpeg', '.png', '.gif']
const isPic = src => src && picTypes.find(type => src.toLocaleLowerCase().includes(type))

const isPicMode = () => pics.style.display === 'flex'

let imgsIndex = 0
const allImgs = allA.map(el => el.href).filter(isPic)
if (allImgs.length === 0) {
  document.getElementById('picsToggle').style.display = 'none'
}

function setImage (src) {
  src = src || allImgs[imgsIndex]
  picsLabel.innerText = src.split('/').pop()
  picsHolder.src = src
  storeLastArrowSrc(src)
}

function picsOn (ifImgSelected) {
  const href = getASelected().href

  if (isPicMode()) {
    return false
  } else if (ifImgSelected && !isPic(href)) {
    return false
  }

  if (isPic(href)) {
    imgsIndex = allImgs.findIndex(el => el === href)
    setImage()
  } else {
    setImage(picsHolder.src)
  }

  pics.style.display = 'flex'
  return true
}

function picsToggle () {
  if (!isPicMode()) {
    picsOn()
  } else {
    pics.style.display = 'none'
    restoreCursorPos()
  }
}

function picsNav (down) {
  if (!isPicMode()) { return false }

  if (down) {
    imgsIndex = allImgs[imgsIndex + 1] ? imgsIndex + 1 : 0
  } else {
    imgsIndex = allImgs[imgsIndex - 1] ? imgsIndex - 1 : allImgs.length - 1
  }

  setImage()
  return true
}

let path = ''
let clearPathToken = null

document.body.addEventListener('keydown', e => {
  switch (e.code) {
    case 'Tab':
    case 'ArrowDown':
      e.preventDefault()
      return picsNav(true) || arrow(true)

    case 'ArrowUp':
      e.preventDefault()
      return picsNav(false) || arrow(false)

    case 'ArrowRight':
      e.preventDefault()
      return picsOn(true) || picsNav(true) || next()

    case 'ArrowLeft':
      e.preventDefault()
      return picsNav(false) || prev()

    case 'Escape':
      if (isPicMode) {
        e.preventDefault()
        return picsToggle()
      }
  }

  // Ctrl keys
  if (e.ctrlKey || e.metaKey) {
    switch (e.code) {
      case 'KeyD':
        e.preventDefault()
        return isPicMode() || mkdir()

      case 'KeyC':
        e.preventDefault()
        return isPicMode() || cpPath()
    }
  }

  // Any other key, for text search
  if (e.code.includes('Key')) {
    path += e.code.replace('Key', '').toLocaleLowerCase()
    window.clearTimeout(clearPathToken)
    clearPathToken = setTimeout(() => { path = '' }, 1000)
    setCursorToClosest()
  }
}, false)

window.picsToggle = picsToggle
window.picsNav = () => picsNav(true)
window.mkdir = mkdir

restoreCursorPos()
console.log('File upload set')
