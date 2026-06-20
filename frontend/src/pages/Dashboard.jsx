import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Layers, Package, Wallet, TrendingUp, AlertTriangle, Activity, Clock } from 'lucide-react'
import { api, fmt } from '../lib/api'
import { Loading, Eyebrow } from '../components/shared'

const CAT_COLORS = {
  Whisky: '#C9973B', Beer: '#6B9E50', Gin: '#4E7E96',
  Wine: '#8E4E72', Vodka: '#5E6E8E', Rum: '#8E5E4E',
  Brandy: '#8E7A4E', Liqueur: '#6A4E8E',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--ink3)', border: '1px solid var(--vl)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--t2)', marginBottom: 3 }}>{payload[0].payload.cat}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--au)' }}>₹ {fmt(payload[0].value)}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => { api.getDashboard().then(setData).catch(console.error) }, [])
  if (!data) return <div className="page-wrap"><Loading /></div>

  const syncD = new Date(data.lastSync + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const chartData = Object.entries(data.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, val]) => ({ cat, val }))

  const stats = [
    { label: 'SKUs', value: data.skus, icon: Layers, sub: 'Active products' },
    { label: 'Bottles in Stock', value: fmt(data.bottlesInStock), icon: Package, sub: 'Total units' },
    { label: 'Stock Value', value: `₹ ${fmt(data.stockValue)}`, icon: Wallet, rupee: true, sub: 'At purchase cost' },
    { label: 'Projected Revenue', value: `₹ ${fmt(data.projectedRevenue)}`, icon: TrendingUp, rupee: true, sub: 'At selling price' },
    { label: 'Projected Margin', value: `₹ ${fmt(data.projectedMargin)}`, icon: TrendingUp, rupee: true, cls: 'success', sub: 'Gross margin' },
    { label: 'Low Stock SKUs', value: data.lowStock, icon: AlertTriangle, cls: data.lowStock > 0 ? 'danger' : '', sub: 'Below 10 bottles' },
    { label: "Today's Sales", value: `₹ ${fmt(data.todaySales)}`, icon: Activity, rupee: true, sub: 'Sales today' },
    { label: 'Net Change · 7 Days', value: (data.weeklyNet >= 0 ? '+' : '') + data.weeklyNet, icon: Clock, cls: data.weeklyNet >= 0 ? 'success' : '', sub: 'Bottles this week' },
  ]

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <Eyebrow>Operations</Eyebrow>
          <div className="page-title">Tonight's House</div>
          <div className="page-desc">A precise view of every bottle on the shelf — your bar's cost and the latest Karnataka State Beverages Corporation reference price.</div>
        </div>
        <div className="sync-box">
          <div className="sync-label"><span className="sync-dot" /> Last KSBCL Sync</div>
          <div className="sync-date">{syncD}</div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, rupee, cls, sub }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label-row">
              {label}
              <div className="stat-icon"><Icon size={13} /></div>
            </div>
            <div className={`stat-value ${rupee ? 'rupee' : ''} ${cls || ''}`}>{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <div>
            <div className="chart-eyebrow">Stock Value</div>
            <div className="chart-title">By Category</div>
          </div>
          <div className="chart-badge">{chartData.length} categories</div>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barCategoryGap="32%">
            <XAxis dataKey="cat" axisLine={false} tickLine={false} tick={{ fill: 'var(--t3)', fontSize: 11, fontFamily: 'Inter' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--t3)', fontSize: 11, fontFamily: 'Inter' }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,151,59,.04)' }} />
            <Bar dataKey="val" radius={[5, 5, 0, 0]}>
              {chartData.map(({ cat }) => <Cell key={cat} fill={CAT_COLORS[cat] || '#C9973B'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
