import express from 'express'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

// ── DB ────────────────────────────────────────────────────────────────────────
const db = new Low(new JSONFile(join(__dirname, 'db.json')), {
  inventory: [], movements: [],
  settings: { barName: "Tonight's House", region: 'Karnataka', lastSync: new Date().toISOString().slice(0, 10) }
})
await db.read()

if (!db.data.inventory.length) {
  db.data.inventory = [
    { id: 1,  brand: "Amrut",           product: "Fusion Single Malt",    category: "Whisky",  size: "750ml", stock: 18,  ksbclRef: 3200, barCost: 3200, sellingPrice: 3800 },
    { id: 2,  brand: "Bacardi",         product: "Carta Blanca",          category: "Rum",     size: "750ml", stock: 12,  ksbclRef: 880,  barCost: 880,  sellingPrice: 1050 },
    { id: 3,  brand: "Bira 91",         product: "White Wheat Ale",       category: "Beer",    size: "650ml", stock: 72,  ksbclRef: 180,  barCost: 180,  sellingPrice: 220  },
    { id: 4,  brand: "Black Dog",       product: "Triple Gold Reserve",   category: "Whisky",  size: "750ml", stock: 15,  ksbclRef: 1850, barCost: 1850, sellingPrice: 2200 },
    { id: 5,  brand: "Bombay Sapphire", product: "London Dry Gin",        category: "Gin",     size: "750ml", stock: 8,   ksbclRef: 2400, barCost: 2400, sellingPrice: 2850 },
    { id: 6,  brand: "Glenlivet",       product: "12 Year Single Malt",   category: "Whisky",  size: "750ml", stock: 6,   ksbclRef: 4800, barCost: 4800, sellingPrice: 5600 },
    { id: 7,  brand: "Greater Than",    product: "London Dry Gin",        category: "Gin",     size: "750ml", stock: 10,  ksbclRef: 1100, barCost: 1100, sellingPrice: 1320 },
    { id: 8,  brand: "Grover Zampa",    product: "La Reserve",            category: "Wine",    size: "750ml", stock: 15,  ksbclRef: 1180, barCost: 1180, sellingPrice: 1420 },
    { id: 9,  brand: "Honey Bee",       product: "Premium Brandy",        category: "Brandy",  size: "750ml", stock: 24,  ksbclRef: 440,  barCost: 440,  sellingPrice: 530  },
    { id: 10, brand: "Jagermeister",    product: "Herbal Liqueur",        category: "Liqueur", size: "750ml", stock: 5,   ksbclRef: 1600, barCost: 1600, sellingPrice: 1900 },
    { id: 11, brand: "Kingfisher",      product: "Strong Premium Lager",  category: "Beer",    size: "650ml", stock: 120, ksbclRef: 110,  barCost: 110,  sellingPrice: 140  },
    { id: 12, brand: "McDowell's",      product: "No.1 Reserve Whisky",   category: "Whisky",  size: "750ml", stock: 48,  ksbclRef: 555,  barCost: 555,  sellingPrice: 680  },
    { id: 13, brand: "Officer's Choice",product: "Black Whisky",          category: "Whisky",  size: "750ml", stock: 67,  ksbclRef: 470,  barCost: 470,  sellingPrice: 580  },
  ]
  db.data.movements = [
    { id: 1, date: "2026-04-28", type: "sell",    inventoryId: 12, brand: "McDowell's",      qty: 12, pricePerBottle: 850,  total: 10200, note: "" },
    { id: 2, date: "2026-04-28", type: "sell",    inventoryId: 4,  brand: "Black Dog",       qty: 24, pricePerBottle: 250,  total: 6000,  note: "" },
    { id: 3, date: "2026-04-28", type: "sell",    inventoryId: 13, brand: "Officer's Choice",qty: 12, pricePerBottle: 720,  total: 8640,  note: "" },
    { id: 4, date: "2026-04-27", type: "sell",    inventoryId: 11, brand: "Kingfisher",      qty: 3,  pricePerBottle: 3600, total: 10800, note: "" },
    { id: 5, date: "2026-04-27", type: "sell",    inventoryId: 13, brand: "Officer's Choice",qty: 8,  pricePerBottle: 1650, total: 13200, note: "" },
    { id: 6, date: "2026-04-23", type: "receive", inventoryId: 12, brand: "McDowell's",      qty: 60, pricePerBottle: 555,  total: 33300, note: "Weekly delivery" },
    { id: 7, date: "2026-04-22", type: "receive", inventoryId: 13, brand: "Officer's Choice",qty: 72, pricePerBottle: 470,  total: 33840, note: "Weekly delivery" },
    { id: 8, date: "2026-04-19", type: "receive", inventoryId: 11, brand: "Kingfisher",      qty: 12, pricePerBottle: 2500, total: 30000, note: "" },
  ]
  await db.write()
}

const CATALOG = [
  { id: 1,  brand: "Amrut",           product: "Fusion Single Malt",    category: "Whisky",  size: "750ml", govtCost: 3200, mrp: 3800 },
  { id: 2,  brand: "Bacardi",         product: "Carta Blanca",          category: "Rum",     size: "750ml", govtCost: 880,  mrp: 1050 },
  { id: 3,  brand: "Bira 91",         product: "White Wheat Ale",       category: "Beer",    size: "650ml", govtCost: 180,  mrp: 220  },
  { id: 4,  brand: "Black Dog",       product: "Triple Gold Reserve",   category: "Whisky",  size: "750ml", govtCost: 1850, mrp: 2200 },
  { id: 5,  brand: "Bombay Sapphire", product: "London Dry Gin",        category: "Gin",     size: "750ml", govtCost: 2400, mrp: 2850 },
  { id: 6,  brand: "Glenlivet",       product: "12 Year Single Malt",   category: "Whisky",  size: "750ml", govtCost: 4800, mrp: 5600 },
  { id: 7,  brand: "Greater Than",    product: "London Dry Gin",        category: "Gin",     size: "750ml", govtCost: 1100, mrp: 1320 },
  { id: 8,  brand: "Grover Zampa",    product: "La Reserve",            category: "Wine",    size: "750ml", govtCost: 1180, mrp: 1420 },
  { id: 9,  brand: "Honey Bee",       product: "Premium Brandy",        category: "Brandy",  size: "750ml", govtCost: 440,  mrp: 530  },
  { id: 10, brand: "Jagermeister",    product: "Herbal Liqueur",        category: "Liqueur", size: "750ml", govtCost: 1600, mrp: 1900 },
  { id: 11, brand: "Kingfisher",      product: "Strong Premium Lager",  category: "Beer",    size: "650ml", govtCost: 110,  mrp: 140  },
  { id: 12, brand: "McDowell's",      product: "No.1 Reserve Whisky",   category: "Whisky",  size: "750ml", govtCost: 555,  mrp: 680  },
  { id: 13, brand: "Officer's Choice",product: "Black Whisky",          category: "Whisky",  size: "750ml", govtCost: 470,  mrp: 580  },
  { id: 14, brand: "Royal Challenge", product: "Premium Whisky",        category: "Whisky",  size: "750ml", govtCost: 720,  mrp: 880  },
  { id: 15, brand: "Sula",            product: "Sauvignon Blanc",       category: "Wine",    size: "750ml", govtCost: 780,  mrp: 950  },
  { id: 16, brand: "Signature",       product: "Rare Aged Whisky",      category: "Whisky",  size: "750ml", govtCost: 620,  mrp: 780  },
  { id: 17, brand: "Blenders Pride",  product: "Reserve Collection",    category: "Whisky",  size: "750ml", govtCost: 910,  mrp: 1100 },
  { id: 18, brand: "100 Pipers",      product: "Aged 12 Years",         category: "Whisky",  size: "750ml", govtCost: 840,  mrp: 1020 },
]

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  await db.read()
  const inv = db.data.inventory
  const mvmts = db.data.movements
  const stockValue = inv.reduce((s, i) => s + i.stock * i.barCost, 0)
  const projRevenue = inv.reduce((s, i) => s + i.stock * i.sellingPrice, 0)
  const lowStock = inv.filter(i => i.stock < 10).length
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = mvmts.filter(m => m.date === today && m.type === 'sell').reduce((s, m) => s + m.total, 0)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const weeklyNet = mvmts.filter(m => m.date >= weekAgo)
    .reduce((s, m) => s + (m.type === 'receive' ? m.qty : m.type === 'sell' ? -m.qty : 0), 0)
  const catBreakdown = {}
  for (const i of inv) catBreakdown[i.category] = (catBreakdown[i.category] || 0) + i.stock * i.barCost
  res.json({
    skus: inv.length,
    bottlesInStock: inv.reduce((s, i) => s + i.stock, 0),
    stockValue, projectedRevenue: projRevenue,
    projectedMargin: projRevenue - stockValue,
    lowStock, todaySales, weeklyNet,
    categoryBreakdown: catBreakdown,
    lastSync: db.data.settings.lastSync,
  })
})

// ── Inventory ─────────────────────────────────────────────────────────────────
app.get('/api/inventory', async (req, res) => {
  await db.read()
  let items = db.data.inventory
  const { search, category, lowStock } = req.query
  if (search) items = items.filter(i => `${i.brand} ${i.product}`.toLowerCase().includes(search.toLowerCase()))
  if (category) items = items.filter(i => i.category === category)
  if (lowStock === 'true') items = items.filter(i => i.stock < 10)
  res.json(items)
})

app.post('/api/inventory', async (req, res) => {
  await db.read()
  const item = { ...req.body, id: Date.now() }
  db.data.inventory.push(item)
  await db.write()
  res.status(201).json(item)
})

app.put('/api/inventory/:id', async (req, res) => {
  await db.read()
  const idx = db.data.inventory.findIndex(i => i.id === +req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.inventory[idx] = { ...db.data.inventory[idx], ...req.body }
  await db.write()
  res.json(db.data.inventory[idx])
})

app.delete('/api/inventory/:id', async (req, res) => {
  await db.read()
  db.data.inventory = db.data.inventory.filter(i => i.id !== +req.params.id)
  await db.write()
  res.json({ ok: true })
})

// ── Catalog ───────────────────────────────────────────────────────────────────
app.get('/api/catalog', (req, res) => {
  let items = CATALOG
  const { search, category } = req.query
  if (search) items = items.filter(i => `${i.brand} ${i.product}`.toLowerCase().includes(search.toLowerCase()))
  if (category) items = items.filter(i => i.category === category)
  res.json(items)
})

// ── Movements ─────────────────────────────────────────────────────────────────
app.get('/api/movements', async (req, res) => {
  await db.read()
  let items = [...db.data.movements].sort((a, b) => b.date.localeCompare(a.date))
  if (req.query.type && req.query.type !== 'all') items = items.filter(m => m.type === req.query.type)
  res.json(items)
})

app.post('/api/movements', async (req, res) => {
  await db.read()
  const { inventoryId, type, qty, pricePerBottle, note } = req.body
  const inv = db.data.inventory.find(i => i.id === +inventoryId)
  if (!inv) return res.status(404).json({ error: 'Inventory item not found' })
  if (type === 'sell' && inv.stock < +qty) return res.status(400).json({ error: 'Insufficient stock' })
  const movement = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    type, inventoryId: +inventoryId, brand: inv.brand,
    qty: +qty, pricePerBottle: +pricePerBottle,
    total: +qty * +pricePerBottle, note: note || '',
  }
  if (type === 'receive') inv.stock += +qty
  else if (type === 'sell') inv.stock -= +qty
  else if (type === 'adjust') inv.stock = +qty
  db.data.movements.push(movement)
  await db.write()
  res.status(201).json(movement)
})

// ── Settings ──────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => { await db.read(); res.json(db.data.settings) })
app.put('/api/settings', async (req, res) => {
  await db.read()
  db.data.settings = { ...db.data.settings, ...req.body }
  await db.write(); res.json(db.data.settings)
})

app.listen(4000, () => console.log('✓ BarStock API → https://barstock-api-9erp.onrender.com/'))
