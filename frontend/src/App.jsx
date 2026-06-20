import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/shared'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Catalog from './pages/Catalog'
import Movements from './pages/Movements'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/movements" element={<Movements />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
