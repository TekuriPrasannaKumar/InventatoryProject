import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { api, fmt } from '../lib/api'
import { Loading, Modal, useToast, Eyebrow, CATEGORIES, SIZES } from '../components/shared'

const BLANK = { brand: '', product: '', category: 'Whisky', size: '750ml', stock: '', ksbclRef: '', barCost: '', sellingPrice: '' }

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const { show, ToastEl } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = {}
      if (search) p.search = search
      if (category) p.category = category
      if (lowStock) p.lowStock = 'true'
      setItems(await api.getInventory(p))
    } catch (e) { show(e.message, 'error') }
    finally { setLoading(false) }
  }, [search, category, lowStock, show])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm(BLANK); setModal('add') }
  function openEdit(item) { setForm({ ...item }); setModal(item) }

  async function save() {
    setSaving(true)
    try {
      if (modal === 'add') { await api.addInventory(form); show('Item added to inventory') }
      else { await api.updateInventory(modal.id, form); show('Item updated') }
      setModal(null); load()
    } catch (e) { show(e.message, 'error') }
    finally { setSaving(false) }
  }

  async function del(item) {
    if (!confirm(`Remove ${item.brand} from inventory?`)) return
    try { await api.deleteInventory(item.id); show('Item removed'); load() }
    catch (e) { show(e.message, 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const margin = form.sellingPrice && form.ksbclRef
    ? (((+form.sellingPrice - +form.ksbclRef) / +form.ksbclRef) * 100).toFixed(1)
    : null

  return (
    <div className="page-wrap">
      {ToastEl}
      <div className="page-header">
        <div>
          <Eyebrow>Holdings</Eyebrow>
          <div className="page-title">Inventory</div>
          <div className="page-desc">Adjust your bar's cost and selling price after reviewing the latest KSBCL reference data.</div>
        </div>
        <button className="btn-gold" onClick={openAdd}><Plus size={13} /> Add Item</button>
      </div>

      <div className="filter-row">
        <div className="search-box">
          <Search size={13} />
          <input placeholder="Search brand or product…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className={`chip ${lowStock ? 'active' : ''}`} onClick={() => setLowStock(v => !v)}>Low stock only</div>
      </div>

      {loading ? <Loading /> : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Brand & Product</th><th>Category</th><th>In Stock</th>
                <th>KSBCL Ref</th><th>Bar Cost</th><th>Selling</th><th>Margin</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-title">No items found</div>
                    <div className="empty-desc">Try adjusting filters or add items from the KSBCL Catalog</div>
                  </div>
                </td></tr>
              ) : items.map(item => {
                const pct = (((item.sellingPrice - item.ksbclRef) / item.ksbclRef) * 100).toFixed(1)
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="cell-brand">{item.brand}</div>
                      <div className="cell-sub">{item.product} · {item.size}</div>
                    </td>
                    <td><span className="cat-pill">{item.category}</span></td>
                    <td className={item.stock < 10 ? 'cell-low' : 'cell-stock'}>{item.stock}</td>
                    <td className="cell-gold">₹ {fmt(item.ksbclRef)}</td>
                    <td className="cell-dim">₹ {fmt(item.barCost)}</td>
                    <td className="cell-gold">₹ {fmt(item.sellingPrice)}</td>
                    <td><span className="cell-pct"><TrendingUp size={10} /> +{pct}%</span></td>
                    <td>
                      <div className="action-row">
                        <div className="icon-btn" onClick={() => openEdit(item)}><Pencil size={11} /></div>
                        <div className="icon-btn del" onClick={() => del(item)}><Trash2 size={11} /></div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Item' : `Edit ${modal.brand}`}
          desc={modal === 'add' ? 'Add a new SKU to your bar inventory.' : 'Update pricing and stock for this item.'}
          onClose={() => setModal(null)}
        >
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. McDowell's" />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input className="form-input" value={form.product} onChange={e => set('product', e.target.value)} placeholder="e.g. No.1 Reserve" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bottle Size</label>
              <select className="form-input" value={form.size} onChange={e => set('size', e.target.value)}>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock (bottles)</label>
              <input className="form-input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">KSBCL Ref Price (₹)</label>
              <input className="form-input" type="number" value={form.ksbclRef} onChange={e => set('ksbclRef', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bar Cost (₹)</label>
              <input className="form-input" type="number" value={form.barCost} onChange={e => set('barCost', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price (₹)</label>
              <input className="form-input" type="number" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} placeholder="0" />
            </div>
          </div>
          {margin && (
            <div className="hint-green">✓ Margin: +{margin}% over KSBCL government cost</div>
          )}
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-gold" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add Item' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
