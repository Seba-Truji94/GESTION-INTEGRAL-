import { useState, useEffect, useRef } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiX, FiCheck, FiUser, FiEye, FiEyeOff, FiGrid, FiCalendar, FiFileText, FiDollarSign, FiPackage, FiBarChart2, FiSettings, FiSliders, FiShoppingBag, FiUsers, FiGlobe, FiSave } from 'react-icons/fi'
import api from '../services/api'

const SIDEBAR_ITEMS = [
  { modulo: 'dashboard',          label: 'Dashboard',      icon: <FiGrid /> },
  { modulo: 'eventos',            label: 'Eventos',        icon: <FiCalendar /> },
  { modulo: 'presupuestos',       label: 'Presupuestos',   icon: <FiFileText /> },
  { modulo: 'cobros',             label: 'Cobros',         icon: <FiDollarSign /> },
  { modulo: 'gastos',             label: 'Gastos',         icon: <FiDollarSign /> },
  { modulo: 'reportes',           label: 'Reportes',       icon: <FiBarChart2 /> },
  { modulo: 'inventario',         label: 'Inventario',     icon: <FiPackage /> },
  { modulo: 'catalogo',           label: 'Catálogo',       icon: <FiShoppingBag /> },
  { modulo: 'configuracion',      label: 'Configuración',  icon: <FiSettings /> },
  { modulo: 'configuracion_login',label: 'Visual Login',   icon: <FiSliders /> },
  { modulo: 'mantenedor',         label: 'Mantenedor',     icon: <FiUsers /> },
]

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

const RESTRICTED = new Set(['mantenedor', 'configuracion_login'])
const emptyPermisos = () =>
  Object.fromEntries(MODULOS.map(m => {
    const acceso = !RESTRICTED.has(m.key)
    return [m.key, { ver: acceso, crear: acceso, editar: acceso, eliminar: false }]
  }))

const emptyForm = () => ({ username: '', email: '', first_name: '', last_name: '', rol: 'operador', telefono: '', password: '', is_active: true })

export default function Mantenedor() {
  const [tab, setTab] = useState('usuarios')
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
          <h1 className="page-title">Mantenedor</h1>
          <p className="page-subtitle">Usuarios, permisos y configuración del sitio web</p>
        </div>
        {tab === 'usuarios' && (
          <button className="btn btn-primary" onClick={handleOpenNew}>
            <FiPlus /> Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {[
          { key: 'usuarios', label: 'Usuarios', icon: <FiUsers size={14} /> },
          { key: 'sitio',    label: 'Sitio Web', icon: <FiGlobe size={14} /> },
          { key: 'bancos',   label: 'Datos Bancarios', icon: <FiDollarSign size={14} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'sitio' && <SitioWebConfig />}
      {tab === 'bancos' && <DatosBancariosConfig />}

      {tab === 'usuarios' && <div className="table-wrapper">
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
      </div>}

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
          <div className="modal" style={{ maxWidth: 900 }}>
            <div className="flex-between mb-24">
              <div>
                <h3 style={{ margin: 0 }}>Permisos de Módulos</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--txt3)' }}>
                  Usuario: <strong>{selectedUser.first_name || selectedUser.username}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowPermsModal(false)}><FiX /></button>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              {/* Tabla de permisos */}
              <div style={{ flex: 1, overflowX: 'auto' }}>
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
                <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 12 }}>
                  Haz clic en el encabezado de una columna para alternar ese permiso en todos los módulos.
                </p>
              </div>

              {/* Vista previa de sidebar */}
              <div style={{ width: 180, flexShrink: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt2)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Vista previa sidebar
                </p>
                <div style={{ background: 'var(--sidebar-bg, #1a1a2e)', borderRadius: 10, padding: '12px 8px', minHeight: 200 }}>
                  {SIDEBAR_ITEMS.filter(item => permisos[item.modulo]?.ver).length === 0 ? (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '16px 8px' }}>
                      Sin acceso a ningún módulo
                    </p>
                  ) : (
                    SIDEBAR_ITEMS.filter(item => permisos[item.modulo]?.ver).map(item => (
                      <div key={item.modulo} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                        <span style={{ fontSize: 14, opacity: 0.7 }}>{item.icon}</span>
                        {item.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

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

function SitioWebConfig() {
  const logoInputRef = useRef(null)
  const [form, setForm] = useState(null)
  const [media, setMedia] = useState([])
  const [saving, setSaving] = useState(false)
  const [savingMedia, setSavingMedia] = useState({})
  const [saved, setSaved] = useState(false)

  const load = async () => {
    try {
      const [configRes, mediaRes] = await Promise.all([
        api.get('/public/config/'),
        api.get('/public/media/')
      ])
      setForm(configRes.data)
      setMedia(mediaRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'logo' || k === 'logo_url') return
        if (v !== null && v !== undefined) data.append(k, v)
      })
      if (logoInputRef.current?.files[0]) data.append('logo', logoInputRef.current.files[0])
      await api.patch('/public/config/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    setSaving(false)
  }

  const handleMediaUpload = async (seccion, file) => {
    if (!file) return
    setSavingMedia(prev => ({ ...prev, [seccion]: true }))
    try {
      const formData = new FormData()
      formData.append('seccion', seccion)
      formData.append('archivo', file)
      formData.append('activo', 'true')
      
      // If singleton, try to update existing or create new
      const existing = media.find(m => m.seccion === seccion && seccion !== 'galeria')
      if (existing) {
        await api.patch(`/public/media-assets/${existing.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/public/media-assets/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      load()
    } catch (e) {
      console.error(e)
      alert('Error al subir archivo')
    }
    setSavingMedia(prev => ({ ...prev, [seccion]: false }))
  }

  const handleDeleteMedia = async (id) => {
    if (!confirm('¿Eliminar este elemento de media?')) return
    try {
      await api.delete(`/public/media-assets/${id}/`)
      load()
    } catch (e) { console.error(e) }
  }

  if (!form) return <div className="loading"><span className="spinner" />Cargando...</div>

  const getMedia = (sec) => media.find(m => m.seccion === sec)
  const galeria = media.filter(m => m.seccion === 'galeria')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, alignItems: 'start' }}>
      <div className="card">
        <p className="card-title flex-center gap-8">
            <FiSettings size={14} /> Información de marca y contacto
        </p>

        <div className="form-grid form-grid-2 mb-24">
          <SitioField label="Nombre de la marca" name="nombre_marca" value={form.nombre_marca} onChange={handleChange} />
          <SitioField label="Eslogan (header/hero)" name="eslogan" value={form.eslogan} onChange={handleChange} />
          <SitioField label="Subtítulo hero" name="hero_subtitulo" value={form.hero_subtitulo} onChange={handleChange} />
          <SitioField label="Texto copyright footer" name="footer_copyright" value={form.footer_copyright} onChange={handleChange} />
          <SitioField label="Email de contacto" name="email_contacto" type="email" value={form.email_contacto} onChange={handleChange} />
          <SitioField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          <SitioField label="Instagram URL" name="instagram_url" value={form.instagram_url} onChange={handleChange} />
          <SitioField label="Instagram usuario (@...)" name="instagram_usuario" value={form.instagram_usuario} onChange={handleChange} />
          <SitioField label="Facebook URL" name="facebook_url" value={form.facebook_url} onChange={handleChange} />
          <SitioField label="Facebook usuario" name="facebook_usuario" value={form.facebook_usuario} onChange={handleChange} />
          <SitioField label="WhatsApp (+569...)" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
        </div>

        <p className="card-title">Sección "Quiénes Somos"</p>
        <div className="form-grid mb-24">
          <SitioField label="Título principal" name="nosotros_titulo" value={form.nosotros_titulo} onChange={handleChange} />
          <SitioTextarea label="Párrafo 1" name="nosotros_texto1" value={form.nosotros_texto1} onChange={handleChange} />
          <SitioTextarea label="Párrafo 2" name="nosotros_texto2" value={form.nosotros_texto2} onChange={handleChange} />
        </div>

        <p className="card-title">Estadísticas</p>
        <div className="form-grid form-grid-3 mb-24">
          <div className="form-group">
            <SitioField label="N° 1" name="stat1_num" type="number" value={form.stat1_num} onChange={handleChange} />
            <SitioField label="Etiqueta 1" name="stat1_label" value={form.stat1_label} onChange={handleChange} />
          </div>
          <div className="form-group">
            <SitioField label="N° 2" name="stat2_num" type="number" value={form.stat2_num} onChange={handleChange} />
            <SitioField label="Etiqueta 2" name="stat2_label" value={form.stat2_label} onChange={handleChange} />
          </div>
          <div className="form-group">
            <SitioField label="N° 3" name="stat3_num" type="number" value={form.stat3_num} onChange={handleChange} />
            <SitioField label="Etiqueta 3" name="stat3_label" value={form.stat3_label} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-24">
          <label className="card-title" style={{ display: 'block', marginBottom: 8 }}>Logo (opcional)</label>
          <div className="flex-center gap-16">
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo" style={{ height: 40, objectFit: 'contain', border: '1px solid var(--bd)', padding: 4, borderRadius: 'var(--r)', background: 'var(--bg)' }} />
            )}
            <input ref={logoInputRef} type="file" accept="image/*" style={{ fontSize: 12 }} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
          {saving ? <span className="spinner" /> : <FiSave size={14} />}
          {saving ? 'Guardando...' : saved ? '¡Guardado con éxito!' : 'Guardar Información General'}
        </button>
      </div>

      <div className="flex flex-col gap-24">
        <div className="card">
            <p className="card-title flex-center gap-8">
                <FiPackage size={14} /> Fotos de la Sección "Nosotros"
            </p>
            <div className="grid-2">
                <MediaUploader 
                   label="Foto 1 (Cocina/Interior)" 
                   sec="nosotros_foto1" 
                   asset={getMedia('nosotros_foto1')} 
                   onUpload={handleMediaUpload} 
                   loading={savingMedia['nosotros_foto1']} 
                />
                <MediaUploader 
                   label="Foto 2 (Producto/Tabla)" 
                   sec="nosotros_foto2" 
                   asset={getMedia('nosotros_foto2')} 
                   onUpload={handleMediaUpload} 
                   loading={savingMedia['nosotros_foto2']} 
                />
            </div>
            <div style={{ marginTop: 20 }}>
                 <MediaUploader 
                   label="Banner Superior Sección" 
                   sec="nosotros_banner" 
                   asset={getMedia('nosotros_banner')} 
                   onUpload={handleMediaUpload} 
                   loading={savingMedia['nosotros_banner']} 
                />
            </div>
        </div>

        <div className="card">
            <p className="card-title flex-center gap-8">
                <FiBarChart2 size={14} /> Hero e Imagen Principal
            </p>
            <div className="grid-2">
                <MediaUploader 
                   label="Video Hero (Fondo)" 
                   sec="hero_video" 
                   asset={getMedia('hero_video')} 
                   onUpload={handleMediaUpload} 
                   loading={savingMedia['hero_video']} 
                />
                <MediaUploader 
                   label="Imagen Hero (Fallback)" 
                   sec="hero_imagen" 
                   asset={getMedia('hero_imagen')} 
                   onUpload={handleMediaUpload} 
                   loading={savingMedia['hero_imagen']} 
                />
            </div>
        </div>

        <div className="card">
            <div className="flex-between mb-16">
                <p className="card-title flex-center gap-8" style={{margin:0}}>
                    <FiGrid size={14} /> Galería de Fotos
                </p>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="file" 
                        id="galeria-upload" 
                        hidden 
                        onChange={e => handleMediaUpload('galeria', e.target.files[0])} 
                    />
                    <label htmlFor="galeria-upload" className="btn btn-outline btn-sm cursor-pointer">
                        <FiPlus size={14}/> Añadir
                    </label>
                </div>
            </div>
            
            {galeria.length === 0 ? (
                <div className="empty-state" style={{ padding: 30, border: '1px dashed var(--bd)', borderRadius: 'var(--r)' }}>
                    No hay fotos en la galería aún.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                    {galeria.map(item => (
                        <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-100" style={{ position: 'relative', aspectRatio: '1/1' }}>
                            {item.url?.endsWith('.mp4') || item.url?.endsWith('.webm') ? (
                                <video src={item.url} className="w-full h-full object-cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} className="gallery-hover">
                                <button className="btn-icon" style={{ background: 'var(--red)', color: '#fff', border: 'none' }} onClick={() => handleDeleteMedia(item.id)}>
                                    <FiTrash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function MediaUploader({ label, sec, asset, onUpload, loading }) {
    const inputRef = useRef(null)
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</label>
            <div 
                className="relative aspect-video rounded-lg border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-200 transition-colors cursor-pointer group"
                onClick={() => inputRef.current?.click()}
            >
                {loading ? (
                    <span className="spinner" />
                ) : asset ? (
                    <>
                        {asset.url?.endsWith('.mp4') || asset.url?.endsWith('.webm') || asset.url?.endsWith('.mov') ? (
                            <video src={asset.url} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                            <img src={asset.url} className="w-full h-full object-cover" alt="" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-bold bg-black/50 px-3 py-1 rounded-full border border-white/20">CAMBIAR ARCHIVO</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                        <FiPlus size={24} />
                        <span className="text-[10px] font-bold">SUBIR</span>
                    </div>
                )}
                <input ref={inputRef} type="file" hidden onChange={e => onUpload(sec, e.target.files[0])} />
            </div>
        </div>
    )
}


function DatosBancariosConfig() {
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isAdding, setIsAdding] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/datos-transferencia/')
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      setDatos(list)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm(item)
    setIsAdding(false)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/datos-transferencia/${editingId}/`, editForm)
      } else {
        await api.post('/datos-transferencia/', editForm)
      }
      setEditingId(null)
      setIsAdding(false)
      load()
    } catch { alert('Error al guardar datos bancarios') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar estos datos?')) return
    try {
      await api.delete(`/datos-transferencia/${id}/`)
      load()
    } catch { alert('Error al eliminar') }
  }

  const toggleActivo = async (item) => {
    try {
      await api.patch(`/datos-transferencia/${item.id}/`, { activo: !item.activo })
      load()
    } catch {}
  }

  if (loading) return <div className="loading"><span className="spinner" /></div>

  return (
    <div>
      <div className="flex-between mb-24">
        <p className="card-title flex-center gap-8" style={{margin:0}}>
            <FiDollarSign size={14} /> Cuentas para Transferencias
        </p>
        <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditForm({ activo: true }) }}>
          <FiPlus /> Nueva Cuenta
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="card mb-24" style={{ borderColor: 'var(--acc)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>{editingId ? 'Editar Cuenta' : 'Registrar Nueva Cuenta'}</h3>
          <div className="form-grid form-grid-2">
            <SitioField label="Banco" value={editForm.banco} onChange={e => setEditForm({...editForm, banco: e.target.value})} />
            <SitioField label="Tipo de Cuenta" value={editForm.tipo_cuenta} onChange={e => setEditForm({...editForm, tipo_cuenta: e.target.value})} />
            <SitioField label="N° Cuenta" value={editForm.numero_cuenta} onChange={e => setEditForm({...editForm, numero_cuenta: e.target.value})} />
            <SitioField label="Titular" value={editForm.titular} onChange={e => setEditForm({...editForm, titular: e.target.value})} />
            <SitioField label="RUT" value={editForm.rut} onChange={e => setEditForm({...editForm, rut: e.target.value})} />
            <SitioField label="Email Confirmación" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => { setEditingId(null); setIsAdding(false) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}><FiSave /> Guardar Cuenta</button>
          </div>
        </div>
      )}

      <div className="grid-3">
        {datos.map(item => (
          <div key={item.id} className={`card bank-card ${item.activo ? 'active' : ''}`}>
            <div className="flex-between mb-16">
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt)' }}>{item.banco}</p>
                <p style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.tipo_cuenta}</p>
              </div>
              <div className="flex gap-8">
                <button 
                  className="btn-icon"
                  onClick={() => toggleActivo(item)}
                  title={item.activo ? 'Cuenta activa' : 'Activar esta cuenta'}
                  style={{ color: item.activo ? 'var(--grn)' : 'var(--txt3)' }}
                >
                  <FiCheck />
                </button>
                <button className="btn-icon" onClick={() => handleEdit(item)}>
                  <FiEdit2 />
                </button>
                <button className="btn-icon" onClick={() => handleDelete(item.id)} style={{ color: 'var(--red)' }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <div className="flex-between"><span style={{ color: 'var(--txt3)' }}>N° Cuenta:</span><span className="bold">{item.numero_cuenta}</span></div>
              <div className="flex-between"><span style={{ color: 'var(--txt3)' }}>Titular:</span><span>{item.titular}</span></div>
              <div className="flex-between"><span style={{ color: 'var(--txt3)' }}>RUT:</span><span>{item.rut}</span></div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--bd)', fontSize: 11, color: 'var(--acc)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.email}
              </div>
            </div>
          </div>
        ))}
      </div>
      {datos.length === 0 && !isAdding && (
        <div className="empty-state card" style={{ padding: 60 }}>
          No hay cuentas bancarias registradas.
        </div>
      )}
    </div>
  )
}


function SitioField({ label, name, type = 'text', value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="form-control"
      />
    </div>
  )
}

function SitioTextarea({ label, name, value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={3}
        className="form-control"
        style={{ resize: 'none' }}
      />
    </div>
  )
}
