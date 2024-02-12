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
    throw new Error(`Directory ${dir} does not existW`)
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

const corsConfig = {}

const app = express()

app.use('/images', express.static(imagesPath))

app.use(bodyParser.json())

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
)

app.get('/api/v1/getImages/', (_req, res) => {
  console.log(_req.body)
  const start = _req.body.page || 0
  const end = start + picsPerPage
  const selectedImages = images.slice(start, end)

  return res.json({ images: selectedImages })
})

app.listen(port, () => {
  console.log('Server listening on port', port)
})
