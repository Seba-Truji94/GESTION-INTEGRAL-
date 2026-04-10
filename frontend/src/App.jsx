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
import PagoComprobante from './pages/PagoComprobante'
import PresupuestoPublico from './pages/PresupuestoPublico'
import Gastos from './pages/Gastos'
import Catalogo from './pages/Catalogo'
import Reportes from './pages/Reportes'
import api from './services/api'
import './index.css'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" />
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
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/eventos/:id" element={<EventoDetalle />} />
                <Route path="/presupuestos" element={<Presupuestos />} />
                <Route path="/presupuestos/nuevo" element={<PresupuestoNuevo />} />
                <Route path="/presupuestos/:id/editar" element={<PresupuestoNuevo />} />
                <Route path="/presupuestos/:id/imprimir" element={<PresupuestoImpresion />} />
                <Route path="/cobros" element={<Cobros />} />
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/pagos/:id/comprobante" element={<PagoComprobante />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/configuracion" element={<ConfiguracionTransferencia />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
