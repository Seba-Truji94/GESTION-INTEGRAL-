import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiX, FiCheck, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import api from '../services/api'

const MODULOS = [
  { key: 'dashboard',          label: 'Dashboard' },
  { key: 'eventos',            label: 'Eventos' },
  { key: 'presupuestos',       label: 'Presupuestos' },
  { key: 'cobros',             label: 'Cobros' },
  { key: 'gastos',             label: 'Gastos' },
  { key: 'inventario',         label: 'Inventario' },
  { key: 'catalogo',           label: 'Catálogo' },
  { key: 'reportes',           label: 'Reportes' },
  { key: 'configuracion',      label: 'Configuración' },
  { key: 'configuracion_login',label: 'Visual Login' },
  { key: 'mantenedor',          label: 'Mantenedor' },
]

const PERMS = [
  { key: 'ver',      label: 'Ver' },
  { key: 'crear',    label: 'Crear' },
  { key: 'editar',   label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' },
]

const emptyPermisos = () =>
  Object.fromEntries(MODULOS.map(m => [m.key, { ver: true, crear: true, editar: true, eliminar: false }]))

const emptyForm = () => ({ username: '', email: '', first_name: '', last_name: '', rol: 'operador', telefono: '', password: '', is_active: true })

export default function Mantenedor() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPermsModal, setShowPermsModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [permisos, setPermisos] = useState(emptyPermisos())
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/auth/usuarios/')
      setUsuarios(res.data.results || res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleOpenNew = () => {
    setEditUser(null)
    setForm(emptyForm())
    setShowUserModal(true)
  }

  const handleOpenEdit = (u) => {
    setEditUser(u)
    setForm({ username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name, rol: u.rol, telefono: u.telefono || '', password: '', is_active: u.is_active })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editUser) {
        await api.patch(`/auth/usuarios/${editUser.id}/`, payload)
      } else {
        await api.post('/auth/usuarios/', payload)
      }
      setShowUserModal(false)
      load()
    } catch (e) {
      alert('Error al guardar usuario')
      console.error(e)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.delete(`/auth/usuarios/${id}/`)
      load()
    } catch (e) { alert('No se pudo eliminar') }
  }

  const handleOpenPerms = (u) => {
    setSelectedUser(u)
    // Build perms from user data
    const p = emptyPermisos()
    if (u.permisos) {
      Object.entries(u.permisos).forEach(([mod, vals]) => {
        if (p[mod]) p[mod] = { ...vals }
      })
    }
    setPermisos(p)
    setShowPermsModal(true)
  }

  const handleSavePerms = async () => {
    setSaving(true)
    try {
      await api.put(`/auth/usuarios/${selectedUser.id}/permisos/`, permisos)
      setShowPermsModal(false)
      load()
    } catch (e) {
      alert('Error al guardar permisos')
      console.error(e)
    }
    setSaving(false)
  }

  const togglePerm = (modulo, perm) => {
    setPermisos(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], [perm]: !prev[modulo][perm] }
    }))
  }

  const toggleAllModule = (modulo) => {
    const all = Object.values(permisos[modulo]).every(Boolean)
    setPermisos(prev => ({
      ...prev,
      [modulo]: Object.fromEntries(PERMS.map(p => [p.key, !all]))
    }))
  }

  const toggleAllPerm = (perm) => {
    const all = MODULOS.every(m => permisos[m.key][perm])
    setPermisos(prev => {
      const next = { ...prev }
      MODULOS.forEach(m => { next[m.key] = { ...next[m.key], [perm]: !all } })
      return next
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mantenedor de Usuarios</h1>
          <p className="page-subtitle">Gestión de usuarios y control de acceso por módulo</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>
          <FiPlus /> Nuevo Usuario
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading"><span className="spinner"></span>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th className="center">Rol</th>
                <th className="center">Estado</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><p>No hay usuarios registrados</p></div></td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--acc-light)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {u.first_name?.[0] || u.username?.[0] || <FiUser />}
                      </div>
                      <span className="bold">{u.username}</span>
                    </div>
                  </td>
                  <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.email || '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.telefono || '—'}</td>
                  <td className="center">
                    <span className={`badge ${u.rol === 'admin' ? 'badge-aprobado' : 'badge-enviado'}`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Operador'}
                    </span>
                  </td>
                  <td className="center">
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="center">
                    <div className="flex gap-8" style={{ justifyContent: 'center' }}>
                      {u.rol !== 'admin' && (
                        <button className="btn-icon" title="Gestionar permisos" onClick={() => handleOpenPerms(u)} style={{ color: 'var(--acc)' }}>
                          <FiShield />
                        </button>
                      )}
                      <button className="btn-icon" title="Editar" onClick={() => handleOpenEdit(u)}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(u.id)} style={{ color: 'var(--red)' }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Usuario */}
      {showUserModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUserModal(false)}>
          <div className="modal">
            <div className="flex-between mb-24">
              <h3 style={{ margin: 0 }}>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="btn-icon" onClick={() => setShowUserModal(false)}><FiX /></button>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="ej: jperez" disabled={!!editUser} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select className="form-control" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input className="form-control" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Juan" />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input className="form-control" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Pérez" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="juan@ejemplo.cl" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 ..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>{editUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={editUser ? 'Sin cambios' : 'Mínimo 4 caracteres'}
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)' }}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Usuario activo
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowUserModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveUser} disabled={saving}>
                {saving ? 'Guardando...' : editUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Permisos */}
      {showPermsModal && selectedUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPermsModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="flex-between mb-24">
              <div>
                <h3 style={{ margin: 0 }}>Permisos de Módulos</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--txt3)' }}>
                  Usuario: <strong>{selectedUser.first_name || selectedUser.username}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowPermsModal(false)}><FiX /></button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Módulo</th>
                    {PERMS.map(p => (
                      <th key={p.key} className="center" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleAllPerm(p.key)} title={`Alternar todos — ${p.label}`}>
                        {p.label}
                      </th>
                    ))}
                    <th className="center">Todo</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULOS.map(m => {
                    const allOn = Object.values(permisos[m.key]).every(Boolean)
                    return (
                      <tr key={m.key}>
                        <td className="bold">{m.label}</td>
                        {PERMS.map(p => (
                          <td key={p.key} className="center">
                            <input
                              type="checkbox"
                              checked={permisos[m.key][p.key]}
                              onChange={() => togglePerm(m.key, p.key)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                          </td>
                        ))}
                        <td className="center">
                          <button
                            className="btn-icon"
                            onClick={() => toggleAllModule(m.key)}
                            title={allOn ? 'Quitar todos' : 'Marcar todos'}
                            style={{ color: allOn ? 'var(--grn)' : 'var(--txt3)' }}
                          >
                            {allOn ? <FiCheck /> : <FiEyeOff />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 12 }}>
              Haz clic en el encabezado de una columna para alternar ese permiso en todos los módulos.
            </p>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowPermsModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePerms} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
