import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const DB_PATH = path.join(process.cwd(), 'server', 'db.json')

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return { orders: [] }
  }
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to write DB', e)
  }
}

app.get('/orders', (req, res) => {
  const db = readDB()
  res.json(db.orders || [])
})

app.post('/orders', (req, res) => {
  const db = readDB()
  const order = req.body
  if (!order || !order.id) {
    return res.status(400).json({ error: 'Invalid order' })
  }
  db.orders = db.orders || []
  db.orders.push(order)
  writeDB(db)
  res.status(201).json({ success: true, orderId: order.id })
})

app.delete('/orders', (req, res) => {
  const db = readDB()
  db.orders = []
  writeDB(db)
  res.status(200).json({ success: true })
})

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
})
