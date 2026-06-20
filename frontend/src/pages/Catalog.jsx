import { useEffect, useState, useCallback } from 'react'
import { Search, ExternalLink, Plus } from 'lucide-react'
import { api, fmt } from '../lib/api'
import { Loading, useToast, Eyebrow, CATEGORIES } from '../components/shared'

export default function Catalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const { show, ToastEl } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = {}
      if (search) p.search = search
      if (category) p.category = category
      setItems(await api.getCatalog(p))
    } finally { setLoading(false) }
  }, [search, category])

  useEffect(() => { load() }, [load])

  async function addToInventory(item) {
    try {
      await api.addInventory({
        brand: item.brand, product: item.product, category: item.category,
        size: item.size, stock: 0, ksbclRef: item.govtCost,
        barCost: item.govtCost, sellingPrice: item.mrp,
      })
      show(`${item.brand} added to inventory`)
    } catch (e) { show(e.message, 'error') }
  }

  return (
    <div className="page-wrap">
      {ToastEl}
      <div className="page-header">
        <div>
          <Eyebrow>Government Reference</Eyebrow>
          <div className="page-title">KSBCL Catalog</div>
          <div className="page-desc">Official cost & MRP data from the Karnataka State Beverages Corporation Limited. Use as a benchmark before updating your prices.</div>
        </div>
        <a href="https://ksbcl.kar.nic.in" target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--au)', textDecoration: 'none', flexShrink: 0, opacity: .8 }}>
          ksbcl.kar.nic.in <ExternalLink size={11} />
        </a>
      </div>

      <div className="filter-row">
        <div className="search-box" style={{ minWidth: 240 }}>
          <Search size={13} />
          <input placeholder="Search KSBCL brands…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="catalog-grid">
          {items.map(item => (
            <div className="catalog-card" key={item.id}>
              <div className="catalog-top">
                <span className="cat-pill">{item.category}</span>
                <div className="size-chip">
                  <div className="size-chip-label">Size</div>
                  <div className="size-chip-val">{item.size}</div>
                </div>
              </div>
              <div className="catalog-name">{item.brand}</div>
              <div className="catalog-sub">{item.product}</div>
              <div className="price-boxes">
                <div className="price-box gov">
                  <div className="price-box-label">Govt Cost</div>
                  <div className="price-box-val">₹ {fmt(item.govtCost)}</div>
                </div>
                <div className="price-box">
                  <div className="price-box-label">MRP</div>
                  <div className="price-box-val mrp">₹ {fmt(item.mrp)}</div>
                </div>
              </div>
              <div className="catalog-footer">
                <a className="source-link" href="https://ksbcl.kar.nic.in" target="_blank" rel="noreferrer">
                  Source <ExternalLink size={10} />
                </a>
                <button className="add-from-catalog" onClick={() => addToInventory(item)}>
                  <Plus size={11} /> Add to Inventory
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
