import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wine, BookOpen, ArrowLeftRight, CheckCircle, XCircle, X } from 'lucide-react'

export function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Wine },
    { to: '/catalog', label: 'KSBCL Catalog', icon: BookOpen },
    { to: '/movements', label: 'Movements', icon: ArrowLeftRight },
  ]
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-lockup">
          <div className="sb-mark">
            <svg viewBox="0 0 24 24"><path d="M8 22v-5M16 22v-5M3 7l1-4h16l1 4H3z"/><path d="M3 7c0 2 1 4 3 5M21 7c0 2-1 4-3 5M6 12v5M18 12v5M6 17h12"/></svg>
          </div>
          <div>
            <div className="sb-title">Bar Stock</div>
            <div className="sb-sub">KSBCL · Karnataka</div>
          </div>
        </div>
        <div className="sb-divider" />
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Menu</div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <div className="nav-ic"><Icon size={14} /></div>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-user">
          <div className="user-row">
            <div className="user-av">
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'var(--au)', fill: 'none', strokeWidth: 1.5 }}>
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <div className="user-name">Karthik</div>
              <div className="user-role">Bar Owner</div>
            </div>
          </div>
        </div>
        <div className="sb-credit">
          Reference: <a href="https://ksbcl.kar.nic.in" target="_blank" rel="noreferrer">ksbcl.kar.nic.in</a>
        </div>
      </div>
    </aside>
  )
}

export function Modal({ title, desc, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-close">
          <div className="icon-btn" onClick={onClose}><X size={13} /></div>
        </div>
        <div className="modal-title">{title}</div>
        {desc && <div className="modal-desc">{desc}</div>}
        {children}
      </div>
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((message, type = 'success') => setToast({ message, type }), [])
  const hide = useCallback(() => setToast(null), [])
  const ToastEl = toast ? <Toast {...toast} onClose={hide} /> : null
  return { show, ToastEl }
}

export function Loading() {
  return <div className="loading"><div className="spinner" /></div>
}

export function Eyebrow({ children }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-line" />
      {children}
    </div>
  )
}

export const CATEGORIES = ['Whisky', 'Beer', 'Gin', 'Wine', 'Vodka', 'Rum', 'Brandy', 'Liqueur']
export const SIZES = ['180ml', '375ml', '500ml', '650ml', '750ml', '1L']
