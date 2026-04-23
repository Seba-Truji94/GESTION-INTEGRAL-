import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiGrid, FiCalendar, FiFileText, FiDollarSign, FiPackage, FiLogOut, FiSettings, FiBarChart2, FiMenu, FiX, FiSliders, FiUsers, FiShoppingBag, FiInbox } from 'react-icons/fi'
import PerfilUsuarioModal from './PerfilUsuarioModal'

const NAV_ITEMS = [
  { to: '/',               icon: <FiGrid />,       label: 'Dashboard',      modulo: 'dashboard',    exact: true },
  { to: '/eventos',        icon: <FiCalendar />,   label: 'Eventos',        modulo: 'eventos' },
  { to: '/presupuestos',   icon: <FiFileText />,   label: 'Presupuestos',   modulo: 'presupuestos' },
  { to: '/cobros',         icon: <FiDollarSign />, label: 'Cobros',         modulo: 'cobros' },
  { to: '/gastos',         icon: <FiDollarSign />, label: 'Gastos',         modulo: 'gastos' },
  { to: '/reportes',       icon: <FiBarChart2 />,  label: 'Reportes',       modulo: 'reportes' },
  { to: '/inventario',     icon: <FiPackage />,    label: 'Inventario',     modulo: 'inventario' },
  { to: '/catalogo',       icon: <FiShoppingBag />,label: 'Catálogo',       modulo: 'catalogo' },
  { to: '/solicitudes',   icon: <FiInbox />,      label: 'Solicitudes',    modulo: 'solicitudes' },
  { to: '/configuracion/login', icon: <FiSliders />, label: 'Visual Login', modulo: 'configuracion_login' },
]

function canSee(user, modulo) {
  if (!user) return false
  if (user.rol === 'admin') return true
  return user.permisos?.[modulo]?.ver === true
}

export default function Layout({ children, user, setUser, onLogout }) {
  useLocation()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(item => canSee(user, item.modulo))

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="btn-menu" onClick={() => setIsSidebarOpen(s => !s)}>
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="mobile-brand">RyF BANQUETERIA</div>
        <div style={{ width: 40 }}></div>
      </header>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">RF</div>
          <div>
            <div className="sidebar-title">RyF BANQUETERIA</div>
            <div className="sidebar-subtitle">Gestión Integral</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menú Principal</div>
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {canSee(user, 'mantenedor') && (
            <>
              <div className="nav-section" style={{ marginTop: 16 }}>Administración</div>
              <NavLink
                to="/mantenedor"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="nav-icon"><FiUsers /></span>
                Mantenedor
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-user" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: 0 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.first_name?.[0] || user?.username?.[0] || 'U'
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-role">{user?.rol === 'admin' ? 'Administrador' : 'Operador'}</div>
          </div>
          <button className="btn-logout" onClick={(e) => { e.stopPropagation(); onLogout() }} title="Cerrar sesión">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      {showProfileModal && (
        <PerfilUsuarioModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  )
}
