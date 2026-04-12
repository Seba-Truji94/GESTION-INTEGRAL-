import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import EventoDetalle from './pages/EventoDetalle'
import Presupuestos from './pages/Presupuestos'
import PresupuestoNuevo from './pages/PresupuestoNuevo'
import PresupuestoImpresion from './pages/PresupuestoImpresion'
import Cobros from './pages/Cobros'
import Inventario from './pages/Inventario'
import ConfiguracionTransferencia from './pages/ConfiguracionTransferencia'
import ConfiguracionLogin from './pages/ConfiguracionLogin'
import PagoComprobante from './pages/PagoComprobante'
import PresupuestoPublico from './pages/PresupuestoPublico'
import Gastos from './pages/Gastos'
import Catalogo from './pages/Catalogo'
import Reportes from './pages/Reportes'
import Mantenedor from './pages/Mantenedor'
import api from './services/api'
import './index.css'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" />
}

// Checks if user has 'ver' permission for a given module
function ModuleRoute({ user, modulo, children }) {
  if (!user) return null
  if (user.rol === 'admin') return children
  const perm = user.permisos?.[modulo]
  if (!perm?.ver) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ user, children }) {
  if (!user) return null
  if (user.rol !== 'admin') return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me/').then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
    }
  }, [])

  const handleLogin = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/p/:id" element={<PresupuestoPublico />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout user={user} setUser={setUser} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/eventos" element={<ModuleRoute user={user} modulo="eventos"><Eventos /></ModuleRoute>} />
                <Route path="/eventos/:id" element={<ModuleRoute user={user} modulo="eventos"><EventoDetalle /></ModuleRoute>} />
                <Route path="/presupuestos" element={<ModuleRoute user={user} modulo="presupuestos"><Presupuestos /></ModuleRoute>} />
                <Route path="/presupuestos/nuevo" element={<ModuleRoute user={user} modulo="presupuestos"><PresupuestoNuevo /></ModuleRoute>} />
                <Route path="/presupuestos/:id/editar" element={<ModuleRoute user={user} modulo="presupuestos"><PresupuestoNuevo /></ModuleRoute>} />
                <Route path="/presupuestos/:id/imprimir" element={<ModuleRoute user={user} modulo="presupuestos"><PresupuestoImpresion /></ModuleRoute>} />
                <Route path="/cobros" element={<ModuleRoute user={user} modulo="cobros"><Cobros /></ModuleRoute>} />
                <Route path="/gastos" element={<ModuleRoute user={user} modulo="gastos"><Gastos /></ModuleRoute>} />
                <Route path="/pagos/:id/comprobante" element={<ModuleRoute user={user} modulo="cobros"><PagoComprobante /></ModuleRoute>} />
                <Route path="/inventario" element={<ModuleRoute user={user} modulo="inventario"><Inventario /></ModuleRoute>} />
                <Route path="/catalogo" element={<ModuleRoute user={user} modulo="catalogo"><Catalogo /></ModuleRoute>} />
                <Route path="/reportes" element={<ModuleRoute user={user} modulo="reportes"><Reportes /></ModuleRoute>} />
                <Route path="/configuracion" element={<ModuleRoute user={user} modulo="configuracion"><ConfiguracionTransferencia /></ModuleRoute>} />
                <Route path="/configuracion/login" element={<ModuleRoute user={user} modulo="configuracion"><ConfiguracionLogin /></ModuleRoute>} />
                <Route path="/mantenedor" element={<AdminRoute user={user}><Mantenedor /></AdminRoute>} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
