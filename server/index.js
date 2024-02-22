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
}

const dbPath =
  databasePath[0] !== `~` ? databasePath : path.resolve(os.homedir(), databasePath.slice(2))
const dbContent = fs.readFileSync(dbPath)
const database = JSON.parse(dbContent)

const saveDatabase = () => {
  const newDBContent = JSON.stringify(database)
  fs.writeFileSync(dbPath, newDBContent, { encoding: 'utf-8' })
}

const getCategoriesList = async () => {
  const categoriesCursor = collection.find({})
  const categoriesList = await (await categoriesCursor.project({ _id: 0, categories: 1 }).toArray())
    .map((x) => x.categories)
    .flat(1)
  const categoriesSet = new Set(categoriesList)
  return Array.from(categoriesSet).sort((a, b) => nc(a, b))
}

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

app.post('/api/v1/getImages/', (_req, res) => {
  const start = (_req.body.page || 0) * picsPerPage
  let filters = _req.body.filters || {}
  if (filters === ':empty') {
    filters = { categories: [] }
  }

  Promise.all([
    collection.find(filters, { skip: start, limit: picsPerPage }).toArray(),
    collection.countDocuments(filters),
    getCategoriesList()
  ]).then(([images, imagesCount, categories]) => {
    res.send({ images, pagesTotal: Math.ceil(imagesCount / picsPerPage), categories })
  })
})

app.post('/api/v1/editImage', async (_req, res) => {
  const { _id, categories = [] } = _req.body

  await collection.updateOne(
    { _id: ObjectId.createFromHexString(_id) },
    {
      $set: {
        categories
      }
    }
  )

  Promise.all([
    collection.findOne({ _id: ObjectId.createFromHexString(_id) }),
    getCategoriesList()
  ]).then(([image, newCategories]) => {
    res.json({ image, categories: newCategories })
  })
})

app.get('/api/v1/getCategories', async (_req, res) => {
  const categories = await getCategoriesList()

  res.send(categories)
})

app.get('/api/v1/deleteImage', (_req, res) => {})

app.listen(port, () => {
  console.log('Server listening on port', port)
})
