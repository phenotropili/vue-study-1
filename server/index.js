import express from 'express'
import fs from 'fs'
import cfg from './config.json' assert { type: 'json' }
import path from 'path'
import os from 'os'
import bodyParser from 'body-parser'
import nc from 'natural-compare-lite'
import cors from 'cors'

const { databasePath, imagesPath, port, picsPerPage } = cfg

const imageRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i

const getImagesInDirectory = (dir) => {
  const isDirExists = fs.existsSync(dir)

  if (!isDirExists) {
    throw new Error(`Directory ${dir} does not exist`)
  }

  const images = fs.readdirSync(dir, { recursive: true }).filter((entry) => imageRegex.test(entry))
  images.sort((a, b) => nc(a.toLowerCase(), b.toLowerCase()))

  return images
}

const dbPath =
  databasePath[0] !== `~` ? databasePath : path.resolve(os.homedir(), databasePath.slice(2))
const dbContent = fs.readFileSync(dbPath)
const database = JSON.parse(dbContent)

const images = getImagesInDirectory(imagesPath)

const app = express()

app.use('/images', express.static(imagesPath))

app.use(bodyParser.json())

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
)

app.post('/api/v1/getImages/', (_req, res) => {
  console.log(_req.body)
  const start = _req.body.page || 0
  const end = start + picsPerPage
  const selectedImages = images.slice(start, end)

  return res.send(selectedImages)
})

app.post('/api/v1/editImage', (_req, res) => {
  const { id, categories = [] } = _req.body
  const categoriesMap = Object.fromEntries(categories.map((cat) => [cat, true]))

  const existedCats = database.imgToCat[id] || []
  const existedCatsMap = Object.fromEntries(existedCats.map((cat) => [cat, true]))

  const addedCats = categories.filter((cat) => !existedCatsMap[cat])

  const removedCats = existedCats.filter((cat) => !categoriesMap[cat])

  database.imgToCat[id] = categories
  addedCats.forEach((cat) => {
    const imagesByCat = database.catToImg[cat]

    if (!imagesByCat) {
      database.catToImg[cat] = [id]
      return
    }

    imagesByCat.push(id)
  })

  removedCats.forEach((cat) => {
    const imagesByCat = database.catToImg[cat]

    if (!imagesByCat) {
      return
    }

    const imageIndex = imagesByCat.indexOf(id)
    if (imageIndex !== -1) {
      imagesByCat.splice(imageIndex, 1)
    }

    if (imagesByCat.length === 0) {
      delete database.catToImg[cat]
    }
  })
  const newDBContent = JSON.stringify(database)
  fs.writeFileSync(dbPath, newDBContent, { encoding: 'utf-8' })

  res.sendStatus(200)
})

app.get('/api/v1/getCategories', (_req, res) => {
  const categories = Object.keys(database.imgToCat).sort((a, b) => nc(a, b))

  return res.send(categories)
})

app.get('/api/v1/deleteImage', (_req, res) => {
  const { id } = _req.body

  const fileName = path.resolve(imagesPath, id)
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName)
  }

  const catsForImage = database.imgToCat[id]
  catsForImage.forEach((cat) => {
    const imagesForCat = database.catToImg[cat]
    const imageIndex = imagesForCat.indexOf(id)
    if (imageIndex !== -1) {
      imagesForCat.splice(imageIndex, 1)
    }
    if (!imagesForCat.length) {
      delete database.catToImg[cat]
    }
  })
  delete database.imgToCat[id]

  const imageIndex = images.indexOf(id)
  if (imageIndex !== -1) {
    images.splice(imageIndex, 1)
  }

  const newDBContent = JSON.stringify(database)
  fs.writeFileSync(dbPath, newDBContent, { encoding: 'utf-8' })

  res.sendStatus(200)
})

app.listen(port, () => {
  console.log('Server listening on port', port)
})
