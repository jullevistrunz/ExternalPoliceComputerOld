const http = require('http')
const fs = require('fs')
const url = require('url')
const port = 80

clearGeneratedData()
generatePeds()
generateCars()

const server = http.createServer(function (req, res) {
  const path = url.parse(req.url, true).pathname
  if (path == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('index.html'))
    res.end()
  } else if (path == '/styles') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    res.write(fs.readFileSync('styles.css'))
    res.end()
  } else if (path == '/script') {
    res.writeHead(200, { 'Content-Type': 'text/js' })
    res.write(fs.readFileSync('script.js'))
    res.end()
  } else if (path == '/map') {
    res.writeHead(200, { 'Content-Type': 'image/jpeg' })
    res.write(fs.readFileSync('map.jpeg'))
    res.end()
  } else if (path.startsWith('/data/')) {
    const dataPath = path.slice('/data/'.length)
    if (dataPath == 'peds') {
      const pedData = generatePeds()
      res.writeHead(200, { 'Content-Type': 'text/json' })
      res.write(JSON.stringify(pedData))
      res.end()
    } else if (dataPath == 'cars') {
      generatePeds()
      const carData = generateCars()
      res.writeHead(200, { 'Content-Type': 'text/json' })
      res.write(JSON.stringify(carData))
      res.end()
    } else if (dataPath == 'citationOptions') {
      res.writeHead(200, { 'Content-Type': 'text/json' })
      res.write(fs.readFileSync('citationOptions.json'))
      res.end()
    } else if (dataPath == 'arrestOptions') {
      res.writeHead(200, { 'Content-Type': 'text/json' })
      res.write(fs.readFileSync('arrestOptions.json'))
      res.end()
    } else {
      res.writeHead(404)
      res.end()
    }
  } else if (path.startsWith('/post/')) {
    const dataPath = path.slice('/post/'.length)
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      if (dataPath == 'addCitations') {
        let data = JSON.parse(fs.readFileSync('peds.json'))
        const newData = JSON.parse(body)
        for (const i in data) {
          if (data[i].name == newData.name) {
            for (const citation of newData.citations) {
              data[i].citations.push(citation)
            }
          }
        }
        fs.writeFileSync('peds.json', JSON.stringify(data))
        res.writeHead(200)
        res.end()
      } else if (dataPath == 'addArrests') {
        let data = JSON.parse(fs.readFileSync('peds.json'))
        const newData = JSON.parse(body)
        for (const i in data) {
          if (data[i].name == newData.name) {
            for (const arrest of newData.arrests) {
              data[i].arrests.push(arrest)
            }
          }
        }
        fs.writeFileSync('peds.json', JSON.stringify(data))
        res.writeHead(200)
        res.end()
      } else {
        res.writeHead(404)
        res.end()
      }
    })
  } else {
    res.writeHead(404)
    res.end()
  }
})
server.listen(port, function (error) {
  if (error) {
    console.log('Something went wrong' + error)
  } else {
    console.log('Listening on port ' + port)
  }
})

//funcs
function generatePeds() {
  const worldPedDataRaw = fs.readFileSync('worldPeds.data', 'utf-8')
  const worldPedDataArr = worldPedDataRaw.split(',')
  const worldPedData = []

  worldPedDataArr.forEach((ped) => {
    let params = new URLSearchParams(ped)
    worldPedData.push(paramsToObject(params.entries()))
  })

  let pedData = new Array()
  try {
    pedData = JSON.parse(fs.readFileSync('peds.json'))
  } catch {
    fs.writeFileSync('peds.json', '[]')
  }

  let pedNameArr = new Array()
  for (ped of pedData) {
    pedNameArr.push(ped.name)
  }

  for (worldPed of worldPedData) {
    if (pedNameArr.includes(worldPed.name)) {
      continue
    }
    const allCharges = getAllArrestOptions()
    const allCitations = getAllCitationOptions()
    const citations = getRandomCitations(allCitations)
    const ped = {
      ...worldPed,
      warrantText:
        worldPed.isWanted == 'True'
          ? allCharges[Math.floor(Math.random() * allCharges.length)]
          : '',
      arrests: getRandomArrests(allCharges, worldPed.isWanted == 'True'),
      citations: citations,
    }
    pedData.push(ped)
  }

  if (!worldPedDataRaw) {
    pedData = []
  }

  fs.writeFileSync('peds.json', JSON.stringify(pedData))
  return pedData
}

function generateCars() {
  const worldCarDataRaw = fs.readFileSync('worldCars.data', 'utf-8')
  const worldCarDataArr = worldCarDataRaw.split(',')
  const worldCarData = []

  worldCarDataArr.forEach((car) => {
    let params = new URLSearchParams(car)
    worldCarData.push(paramsToObject(params.entries()))
  })

  let carData = new Array()
  try {
    carData = JSON.parse(fs.readFileSync('cars.json'))
  } catch {
    fs.writeFileSync('cars.json', '[]')
  }

  let carPlateArr = new Array()
  for (car of carData) {
    carPlateArr.push(car.licensePlate)
  }

  for (worldCar of worldCarData) {
    if (carPlateArr.includes(worldCar.licensePlate) || !getRandomPed()) {
      continue
    }
    const plateStatus =
      worldCar.isPolice == 'False'
        ? Math.floor(Math.random() * 25) == 0
          ? 'Invalid'
          : 'Valid'
        : 'Valid'
    const registration =
      worldCar.isPolice == 'False'
        ? Math.floor(Math.random() * 5) == 0
          ? Math.floor(Math.random() * 5) == 0
            ? 'None'
            : 'Expired'
          : 'Valid'
        : 'Valid'
    const car = {
      ...worldCar,
      owner:
        worldCar.isPolice == 'True'
          ? worldCar.model.toLowerCase().startsWith('police')
            ? 'Los Santos Police Department'
            : 'State Of San Andreas'
          : Math.floor(Math.random() * 10) != 0 && worldCar.driver
          ? worldCar.driver
          : getRandomPed().name,
      registration: registration,
      insurance:
        worldCar.isPolice == 'False'
          ? Math.floor(Math.random() * 5) == 0
            ? Math.floor(Math.random() * 3) == 0
              ? 'None'
              : 'Expired'
            : 'Valid'
          : 'Valid',
      stolen: worldCar.isStolen == 'True' ? 'Yes' : 'No',
      plateStatus: plateStatus,
    }
    carData.push(car)
  }
  if (!worldCarDataRaw) {
    carData = []
  }
  fs.writeFileSync('cars.json', JSON.stringify(carData))
  return carData
}

function paramsToObject(entries) {
  const result = {}
  for (const [key, value] of entries) {
    result[key] = value
  }
  return result
}

function getAllArrestOptions() {
  const file = JSON.parse(fs.readFileSync('arrestOptions.json'))
  const allCharges = new Array()
  for (chargesGroup of file) {
    for (charge of chargesGroup.charges) {
      allCharges.push(charge)
    }
  }
  return allCharges
}

function getAllCitationOptions() {
  const file = JSON.parse(fs.readFileSync('citationOptions.json'))
  const allCharges = new Array()
  for (chargesGroup of file) {
    for (charge of chargesGroup.charges) {
      allCharges.push(charge)
    }
  }
  return allCharges
}

function getRandomCitations(allCitations) {
  let i = Math.floor(Math.random() * 5)
  const citations = []
  while (i == 0) {
    citations.push(
      allCitations[Math.floor(Math.random() * allCitations.length)]
    )
    i = Math.floor(Math.random() * 10)
  }
  return citations
}

function getRandomArrests(allCharges, isWanted) {
  const wasArrested = isWanted
    ? Math.floor(Math.random() * 5) == 0
    : Math.floor(Math.random() * 15) == 0
  let i = 0
  const arrests = []
  while (wasArrested && i == 0) {
    arrests.push(allCharges[Math.floor(Math.random() * allCharges.length)])
    i = Math.floor(Math.random() * 10)
  }
  return arrests
}

function clearGeneratedData() {
  fs.writeFileSync('peds.json', '[]')
  fs.writeFileSync('cars.json', '[]')
}

function getRandomPed() {
  const peds = JSON.parse(fs.readFileSync('peds.json'))
  return peds[Math.floor(Math.random() * peds.length)]
}
