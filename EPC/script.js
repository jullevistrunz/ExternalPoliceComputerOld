const mapZoom = 1.5

document.querySelector('.mapPage input').value = mapZoom
document.querySelector('.mapPage input').addEventListener('input', function () {
  document
    .querySelector('.mapPage iframe')
    .contentDocument.querySelector('img').style.zoom =
    this.value <= 2.5 && this.value >= 0.2 ? this.value : 1.5
})

let lastPage = localStorage.getItem('lastPage')
if (!lastPage) {
  localStorage.setItem('lastPage', 'map')
  lastPage = 'map'
}

let mapScroll = JSON.parse(localStorage.getItem('mapScroll'))
if (!mapScroll) {
  localStorage.setItem('mapScroll', JSON.stringify({ x: 0, y: 0 }))
  mapScroll = { x: 0, y: 0 }
}

goToPage(lastPage)
document.querySelectorAll('.header button').forEach((btn) => {
  btn.addEventListener('click', function () {
    goToPage(this.classList[0])
  })
})

document.querySelector('.mapPage iframe').addEventListener('load', function () {
  this.contentWindow.scrollTo(mapScroll.x, mapScroll.y)
  this.contentDocument.querySelector('img').style.zoom = mapZoom
  this.contentDocument.head.innerHTML +=
    '<style>body::-webkit-scrollbar{display:none;}</style>'
})

document
  .querySelector('.mapPage iframe')
  .contentWindow.addEventListener('scroll', function () {
    if (!document.querySelector('.mapPage').classList.contains('hidden')) {
      localStorage.setItem(
        'mapScroll',
        JSON.stringify({ x: this.scrollX, y: this.scrollY })
      )
    }
  })

document
  .querySelector('.searchPedPage .pedBtn')
  .addEventListener('click', renderPedSearch)
document
  .querySelector('.searchPedPage .pedInp')
  .addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      renderPedSearch()
    }
  })

document
  .querySelector('.searchCarPage .carBtn')
  .addEventListener('click', renderCarSearch)
document
  .querySelector('.searchCarPage .carInp')
  .addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      renderCarSearch()
    }
  })

//funcs
function goToPage(name) {
  document.querySelectorAll('.content > *').forEach((page) => {
    page.classList.add('hidden')
  })
  document.querySelectorAll('.header button').forEach((page) => {
    page.classList.remove('selected')
  })
  document.querySelector(`.content .${name}Page`).classList.remove('hidden')
  document.querySelector(`.header .${name}`).classList.add('selected')
  localStorage.setItem('lastPage', name)

  if (name == 'map') {
    mapScroll = JSON.parse(localStorage.getItem('mapScroll'))
    document
      .querySelector('.mapPage iframe')
      .contentWindow.scrollTo(mapScroll.x, mapScroll.y)
  } else if (name == 'searchPed') {
    document.querySelector('.searchPedPage .pedInp').focus()
    document.querySelector('.searchPedPage .pedInp').select()
  } else if (name == 'searchCar') {
    document.querySelector('.searchCarPage .carInp').focus()
    document.querySelector('.searchCarPage .carInp').select()
  }
}

async function searchForPed(pedName) {
  const pedData = await (await fetch('/data/peds')).json()
  for (ped of pedData) {
    if (ped.name.toLowerCase() == pedName.toLowerCase()) {
      return ped
    }
  }
  return null
}

async function searchForCar(licensePlate) {
  const carData = await (await fetch('/data/cars')).json()
  for (car of carData) {
    if (car.licensePlate.toLowerCase() == licensePlate.toLowerCase()) {
      return car
    }
  }
  return null
}

function createLabelElement(key, value, onClick = null) {
  const labelEl = document.createElement('div')
  labelEl.classList.add('label')
  const keyEl = document.createElement('div')
  keyEl.classList.add('key')
  keyEl.innerHTML = key
  const valueEl = document.createElement('div')
  valueEl.classList.add('value')
  valueEl.innerHTML = value
  labelEl.appendChild(keyEl)
  labelEl.appendChild(valueEl)
  if (typeof onClick == 'function') {
    labelEl.id = Math.random().toString(36).replace(/^0\./, '_')
    labelEl.addEventListener('click', onClick)
    labelEl.style.cursor = 'pointer'
    labelEl.style.transition = '50ms linear'
    const style = document.createElement('style')
    style.innerHTML = `#${labelEl.id} { border: 2px solid transparent; } #${labelEl.id}:hover { border-color: var(--second-accent-color);  }`
    document.body.appendChild(style)
  }
  return labelEl
}

async function renderPedSearch() {
  const ped = await searchForPed(
    document.querySelector('.searchPedPage .pedInp').value
  )

  const lc = document.querySelector(
    '.searchPedPage .resultContainer .labelContainer'
  )
  lc.innerHTML = ''

  const cac = document.querySelector(
    '.searchPedPage .resultContainer .citationArrestContainer'
  )
  cac.innerHTML = ''

  if (!ped) {
    return (document.querySelector(
      '.searchPedPage .resultContainer .name'
    ).innerHTML = 'Ped Not Found')
  }
  document.querySelector('.searchPedPage .resultContainer .name').innerHTML =
    ped.name

  lc.appendChild(createLabelElement('Date Of Birth', ped.birthday))
  lc.appendChild(createLabelElement('Sex', ped.gender))
  lc.appendChild(createLabelElement('License Status', ped.licenseStatus))
  lc.appendChild(
    createLabelElement(
      'Outstanding Warrant',
      ped.isWanted == 'True' ? ped.warrantText : 'None'
    )
  )

  const citations = ped.citations.length ? ped.citations : ['None']
  for (let i in citations) {
    citations[i] = `• ${citations[i]}`
  }
  const arrests = ped.arrests.length ? ped.arrests : ['None']
  for (let i in arrests) {
    arrests[i] = `• ${arrests[i]}`
  }
  cac.appendChild(
    createLabelElement('Citations', citations.join('<br>'), () => {
      openCitationReport()
    })
  )
  cac.appendChild(
    createLabelElement('Arrests', arrests.join('<br>'), () => {
      openArrestReport()
    })
  )
}

async function renderCarSearch() {
  const car = await searchForCar(
    document.querySelector('.searchCarPage .carInp').value
  )
  const lc = document.querySelector(
    '.searchCarPage .resultContainer .labelContainer'
  )
  lc.innerHTML = ''

  if (!car) {
    return (document.querySelector(
      '.searchCarPage .resultContainer .name'
    ).innerHTML = 'Vehicle Not Found')
  }
  document.querySelector('.searchCarPage .resultContainer .name').innerHTML =
    car.licensePlate

  lc.appendChild(createLabelElement('Model', car.model))
  lc.appendChild(createLabelElement('License Plate Status', car.plateStatus))
  lc.appendChild(createLabelElement('Registration', car.registration))
  lc.appendChild(createLabelElement('Insurance', car.insurance))
  lc.appendChild(createLabelElement('Stolen', car.stolen))
  lc.appendChild(
    createLabelElement('Owner', car.owner, () => {
      openPedInSearchPedPage(car.owner)
    })
  )
}

function openPedInSearchPedPage(name) {
  goToPage('searchPed')
  document.querySelector('.searchPedPage .pedInp').value = name
  document.querySelector('.searchPedPage .pedBtn').click()
}

async function openCitationReport() {
  document
    .querySelector('.searchPedPage .citationReport')
    .classList.remove('hidden')
  const options = document.querySelector(
    '.searchPedPage .citationReport .options'
  )
  options.innerHTML = ''

  const citationOptions = await (await fetch('/data/citationOptions')).json()

  document
    .querySelectorAll('.searchPedPage .citationReport .result .btn')
    .forEach((oldBtn) => {
      oldBtn.remove()
    })

  for (group of citationOptions) {
    const details = document.createElement('details')
    const summary = document.createElement('summary')
    summary.innerHTML = group.name
    details.appendChild(summary)
    for (charge of group.charges) {
      const btn = document.createElement('button')
      btn.innerHTML = charge
      btn.addEventListener('click', function () {
        this.blur()
        addCitation(this.innerHTML)
      })
      details.appendChild(btn)
    }
    options.appendChild(details)
  }
}

async function openArrestReport() {
  document
    .querySelector('.searchPedPage .arrestReport')
    .classList.remove('hidden')
  const options = document.querySelector(
    '.searchPedPage .arrestReport .options'
  )
  options.innerHTML = ''

  const arrestOptions = await (await fetch('/data/arrestOptions')).json()

  document
    .querySelectorAll('.searchPedPage .arrestReport .result .btn')
    .forEach((oldBtn) => {
      oldBtn.remove()
    })

  for (group of arrestOptions) {
    const details = document.createElement('details')
    const summary = document.createElement('summary')
    summary.innerHTML = group.name
    details.appendChild(summary)
    for (charge of group.charges) {
      const btn = document.createElement('button')
      btn.innerHTML = charge
      btn.addEventListener('click', function () {
        this.blur()
        addArrest(this.innerHTML)
      })
      details.appendChild(btn)
    }
    options.appendChild(details)
  }
}

function addCitation(charge) {
  const resultEl = document.querySelector(
    '.searchPedPage .citationReport .result'
  )
  const btn = document.createElement('button')
  btn.innerHTML = charge
  btn.classList.add('btn')
  btn.addEventListener('click', function () {
    this.remove()
  })
  resultEl.append(btn)
}

function addArrest(charge) {
  const resultEl = document.querySelector(
    '.searchPedPage .arrestReport .result'
  )
  const btn = document.createElement('button')
  btn.innerHTML = charge
  btn.classList.add('btn')
  btn.addEventListener('click', function () {
    this.remove()
  })
  resultEl.append(btn)
}

function submitCitations() {
  const currentPed = document.querySelector(
    '.searchPedPage .resultContainer .name'
  ).innerHTML
  const citations = []
  for (el of document.querySelectorAll(
    '.searchPedPage .citationReport .result .btn'
  )) {
    citations.push(el.innerHTML)
  }
  fetch('/post/addCitations', {
    method: 'post',
    body: JSON.stringify({
      name: currentPed,
      citations: citations,
    }),
  })
  closeCitations()
  openPedInSearchPedPage(currentPed)
}

function closeCitations() {
  document
    .querySelector('.searchPedPage .citationReport')
    .classList.add('hidden')
}

function submitArrests() {
  const currentPed = document.querySelector(
    '.searchPedPage .resultContainer .name'
  ).innerHTML
  const arrests = []
  for (el of document.querySelectorAll(
    '.searchPedPage .arrestReport .result .btn'
  )) {
    arrests.push(el.innerHTML)
  }
  fetch('/post/addArrests', {
    method: 'post',
    body: JSON.stringify({
      name: currentPed,
      arrests: arrests,
    }),
  })
  closeArrests()
  openPedInSearchPedPage(currentPed)
}

function closeArrests() {
  document.querySelector('.searchPedPage .arrestReport').classList.add('hidden')
}
