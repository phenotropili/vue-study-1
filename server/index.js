import express from 'express'
import fs from 'fs'
import cfg from './config.json' assert { type: 'json' }
import path from 'path'
import os from 'os'
import bodyParser from 'body-parser'
import nc from 'natural-compare-lite'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'

const { databasePath, imagesPath, port, picsPerPage, imagesBaseURL, mongoDBConnectionString } = cfg

const client = new MongoClient(mongoDBConnectionString)
const db = client.db('images')
const collection = db.collection('images')

const imageRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i

const syncImagesWithDirectory = async (dir) => {
  console.log('Syncing directory with DB')
  const isDirExists = fs.existsSync(dir)

  if (!isDirExists) {
    throw new Error(`Directory ${dir} does not exist`)
  }

  const images = fs.readdirSync(dir, { recursive: true }).filter((entry) => imageRegex.test(entry))
  const imagesMap = Object.fromEntries(images.map((x) => [x, true]))

  const savedImages = (await collection.find({}).project({ _id: 0, fileName: 1 }).toArray()).map(
    (x) => x.fileName
  )
  const savedMap = Object.fromEntries(savedImages.map((x) => [x, true]))

  const imagesToAdd = images.filter((x) => !savedMap[x])
  const imagesToRemove = savedImages.filter((x) => !imagesMap[x])

  if (imagesToAdd.length) {
    const insertList = imagesToAdd.map((fileName) => ({ fileName, categories: [] }))
    await collection.insertMany(insertList)
  }

  if (imagesToRemove.length) {
    await collection.deleteMany({ fileName: { $in: imagesToRemove } })
  }
  console.log(`Inserted: ${imagesToAdd.length}, deleted: ${imagesToRemove.length}`)
}

const dbPath =
  databasePath[0] !== `~` ? databasePath : path.resolve(os.homedir(), databasePath.slice(2))
const dbContent = fs.readFileSync(dbPath)
const database = JSON.parse(dbContent)

const saveDatabase = () => {
  const newDBContent = JSON.stringify(database)
  fs.writeFileSync(dbPath, newDBContent, { encoding: 'utf-8' })
}

const getCategoriesList = () => {}

const getImage = (id) => {
  const categories = database.imgToCat[id]

  return {
    id,
    categories,
    fileName: id
  }
}

await syncImagesWithDirectory(imagesPath)

const app = express()

app.use('/images', express.static(imagesPath))

app.use(bodyParser.json())

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
)

app.post('/api/v1/getImages/', async (_req, res) => {
  const start = (_req.body.page || 0) * picsPerPage
  const filters = _req.body.filters || {}

  const images = await collection.find(filters, { skip: start, limit: picsPerPage }).toArray()
  const imagesCount = await collection.countDocuments(filters)
  return res.send({ images, pagesTotal: Math.ceil(imagesCount / picsPerPage) })
})

app.post('/api/v1/editImage', async (_req, res) => {
  const { _id, categories = [] } = _req.body

  const existedImage = await collection.findOne({ _id: ObjectId.createFromHexString(_id) })

  const updateResult = await collection.updateOne(
    { _id: ObjectId.createFromHexString(_id) },
    {
      $set: {
        categories
      }
    }
  )
  res.json({ image: { ...existedImage, categories }, categories: [] })
})

app.get('/api/v1/getCategories', (_req, res) => {
  const categories = Object.keys(database.imgToCat).sort((a, b) => nc(a, b))

  return res.send(categories)
})

app.get('/api/v1/deleteImage', (_req, res) => {})

app.listen(port, () => {
  console.log('Server listening on port', port)
})
