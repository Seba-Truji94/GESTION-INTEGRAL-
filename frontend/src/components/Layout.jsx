import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiGrid, FiCalendar, FiFileText, FiDollarSign, FiPackage, FiLogOut, FiSettings, FiBarChart2, FiMenu, FiX, FiSliders } from 'react-icons/fi'
import PerfilUsuarioModal from './PerfilUsuarioModal'


const navItems = [
  { to: '/', icon: <FiGrid />, label: 'Dashboard', exact: true },
  { to: '/eventos', icon: <FiCalendar />, label: 'Eventos' },
  { to: '/presupuestos', icon: <FiFileText />, label: 'Presupuestos' },
  { to: '/cobros', icon: <FiDollarSign />, label: 'Cobros' },
  { to: '/gastos', icon: <FiDollarSign />, label: 'Gastos' },
  { to: '/reportes', icon: <FiBarChart2 />, label: 'Reportes' },
  { to: '/inventario', icon: <FiPackage />, label: 'Inventario' },
  { to: '/catalogo', icon: <FiFileText />, label: 'Catálogo' },
  { to: '/configuracion', icon: <FiSettings />, label: 'Configuración' },
  { to: '/configuracion/login', icon: <FiSliders />, label: 'Visual Login' },
]

export default function Layout({ children, user, setUser, onLogout }) {
  const location = useLocation()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="btn-menu" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="mobile-brand">KRUXEL</div>
        <div style={{ width: 40 }}></div>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">KR</div>
          <div>
            <div className="sidebar-title">KRUXEL</div>
            <div className="sidebar-subtitle">Tu Gestión Integral de Software</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menú Principal</div>
          {navItems.map(item => (
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
            <div className="sidebar-user-role">{user?.rol}</div>
          </div>
          <button className="btn-logout" onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Cerrar sesión">

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
