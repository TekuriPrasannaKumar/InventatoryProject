import { useEffect, useState, useCallback } from 'react'
import { ArrowDown, ArrowUp, Settings2, Plus } from 'lucide-react'
import { api, fmt, fmtDate, fmtDateShort } from '../lib/api'
import { Loading, Modal, useToast, Eyebrow } from '../components/shared'

function groupByDate(mvmts) {
  const g = {}
  for (const m of mvmts) { if (!g[m.date]) g[m.date] = []; g[m.date].push(m) }
  return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]))
}

export default function Movements() {
  const [mvmts, setMvmts] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ inventoryId: '', type: 'sell', qty: '', pricePerBottle: '', note: '' })
  const [saving, setSaving] = useState(false)
  const { show, ToastEl } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = typeFilter !== 'all' ? { type: typeFilter } : {}
      const [m, inv] = await Promise.all([api.getMovements(p), api.getInventory()])
      setMvmts(m); setInventory(inv)
    } catch (e) { show(e.message, 'error') }
    finally { setLoading(false) }
  }, [typeFilter, show])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().slice(0, 10)
  const todayM = mvmts.filter(m => m.date === today)
  const todaySales = todayM.filter(m => m.type === 'sell').reduce((s, m) => s + m.total, 0)
  const todayRecv = todayM.filter(m => m.type === 'receive').reduce((s, m) => s + m.qty, 0)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const weekNet = mvmts.filter(m => m.date >= weekAgo).reduce((s, m) =>
    s + (m.type === 'receive' ? m.qty : m.type === 'sell' ? -m.qty : 0), 0)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const selectedItem = inventory.find(i => i.id === +form.inventoryId)

  function onItemChange(id) {
    const item = inventory.find(i => i.id === +id)
    const price = item ? (form.type === 'sell' ? item.sellingPrice : item.barCost) : ''
    setForm(f => ({ ...f, inventoryId: id, pricePerBottle: price }))
  }
  function onTypeChange(type) {
    const item = inventory.find(i => i.id === +form.inventoryId)
    const price = item ? (type === 'sell' ? item.sellingPrice : item.barCost) : form.pricePerBottle
    setForm(f => ({ ...f, type, pricePerBottle: price }))
  }

  async function record() {
    setSaving(true)
    try {
      await api.addMovement(form)
      show('Movement recorded')
      setShowModal(false)
      setForm({ inventoryId: '', type: 'sell', qty: '', pricePerBottle: '', note: '' })
      load()
    } catch (e) { show(e.message, 'error') }
    finally { setSaving(false) }
  }

  const total = form.qty && form.pricePerBottle ? +form.qty * +form.pricePerBottle : null
  const groups = groupByDate(mvmts)

  return (
    <div className="page-wrap">
      {ToastEl}
      <div className="page-header">
        <div>
          <Eyebrow>Activity</Eyebrow>
          <div className="page-title">Stock Movements</div>
          <div className="page-desc">Every receipt, sale, and adjustment that touched your inventory — grouped by day.</div>
        </div>
        <button className="btn-gold" onClick={() => setShowModal(true)}><Plus size={13} /> Record Movement</button>
      </div>

      <div className="today-grid">
        <div className="today-card">
          <div className="today-label">Today's Sales</div>
          <div className="today-val sale">₹ {fmt(todaySales)}</div>
          <div className="today-note">{todaySales === 0 ? 'No sales recorded yet' : `${todayM.filter(m => m.type === 'sell').length} transaction(s)`}</div>
        </div>
        <div className="today-card">
          <div className="today-label">Bottles Received Today</div>
          <div className="today-val recv">{todayRecv}</div>
          <div className="today-note">{todayRecv === 0 ? 'No deliveries logged' : 'Received today'}</div>
        </div>
        <div className="today-card">
          <div className="today-label">Net Change · 7 Days</div>
          <div className="today-val net">{weekNet >= 0 ? '+' : ''}{weekNet}</div>
          <div className="today-note">Bottles this week</div>
        </div>
      </div>

      <div className="filter-row">
        {['all', 'receive', 'sell', 'adjust'].map(t => (
          <div key={t} className={`chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {loading ? <Loading /> : groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No movements recorded</div>
          <div className="empty-desc">Record a sale or stock receipt to get started</div>
        </div>
      ) : groups.map(([date, items]) => {
        const sales = items.filter(m => m.type === 'sell').reduce((s, m) => s + m.total, 0)
        const recv = items.filter(m => m.type === 'receive').reduce((s, m) => s + m.qty, 0)
        return (
          <div key={date}>
            <div className="day-heading">
              <span className="day-heading-title">{fmtDate(date)}</span>
              <span className="day-heading-date">{fmtDateShort(date)}</span>
              {sales > 0 && <span className="day-heading-sales">Sales ₹ {fmt(sales)}</span>}
              {recv > 0 && <span className="day-heading-sales">Received +{recv}</span>}
              <span className="day-heading-count">{items.length} movement{items.length !== 1 ? 's' : ''}</span>
            </div>
            {items.map(m => (
              <div className="movement-card" key={m.id}>
                <div className="movement-time">09:15 AM</div>
                <div className={`movement-icon ${m.type === 'receive' ? 'receive' : 'sell'}`}>
                  {m.type === 'receive' ? <ArrowDown size={14} strokeWidth={2.5} />
                    : m.type === 'sell' ? <ArrowUp size={14} strokeWidth={2.5} />
                    : <Settings2 size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="movement-brand">{m.brand}</div>
                  <div className="movement-type">{m.type === 'receive' ? 'Stock Received' : m.type === 'sell' ? 'Bottles Sold' : 'Stock Adjusted'}</div>
                  {m.note && <div className="movement-note">{m.note}</div>}
                </div>
                <div>
                  <div className={`movement-qty ${m.type === 'receive' ? 'pos' : 'neg'}`}>
                    {m.type === 'receive' ? '+' : '−'}{m.qty}
                  </div>
                  <div className="movement-bottles">Bottles</div>
                </div>
                <div>
                  <div className="movement-amount">₹ {fmt(m.total)}</div>
                  <div className="movement-rate">@ ₹ {fmt(m.pricePerBottle)}</div>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {showModal && (
        <Modal title="Record Movement" desc="Log a stock receipt, sale, or manual adjustment." onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Item</label>
            <select className="form-input" value={form.inventoryId} onChange={e => onItemChange(e.target.value)}>
              <option value="">Select a brand…</option>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.brand} · {i.product} (stock: {i.stock})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select className="form-input" value={form.type} onChange={e => onTypeChange(e.target.value)}>
                <option value="sell">Sell</option>
                <option value="receive">Receive</option>
                <option value="adjust">Adjust Stock</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity (bottles)</label>
              <input className="form-input" type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Price per Bottle (₹)</label>
            <input className="form-input" type="number" value={form.pricePerBottle} onChange={e => set('pricePerBottle', e.target.value)} placeholder="0" />
          </div>
          {total && (
            <div className="hint-gold">
              <span style={{ color: 'var(--t2)', fontSize: 12 }}>{form.type === 'sell' ? 'Sale total' : 'Purchase total'}</span>
              <span className="hint-gold-val">₹ {fmt(total)}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input className="form-input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Weekly delivery, end-of-night count…" />
          </div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-gold" onClick={record} disabled={saving || !form.inventoryId || !form.qty}>
              {saving ? 'Recording…' : 'Record'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
