import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiDownload, FiEye, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi'
import api, { fmt, fmtDate, toInputDate } from '../services/api'
import Paginador from '../components/Paginador'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'presupuestado', label: 'Presupuestado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const TIPOS = [
  'matrimonio','quinceanios','cumpleanios','graduacion','bautizo',
  'cena_corporativa','almuerzo_ejecutivo','coctel','brunch','buffet','cafe','baby_shower','reunion_familiar','otro'
]

const TIPO_LABELS = {
  matrimonio:'Matrimonio', quinceanios:'Quinceaños', cumpleanios:'Cumpleaños', graduacion:'Graduación',
  bautizo:'Bautizo', cena_corporativa:'Cena Corporativa', almuerzo_ejecutivo:'Almuerzo Ejecutivo',
  coctel:'Cóctel', brunch:'Brunch', buffet:'Buffet', cafe:'Café', baby_shower:'Baby Shower',
  reunion_familiar:'Reunión Familiar', otro:'Otro'
}

const FILTRO_FECHA = [
  { value: '', label: 'Sin filtro fecha' },
  { value: 'evento_hoy', label: 'Evento: Hoy' },
  { value: 'evento_semana', label: 'Evento: Esta semana' },
  { value: 'evento_mes', label: 'Evento: Este mes' },
  { value: 'creado_hoy', label: 'Creado: Hoy' },
  { value: 'creado_semana', label: 'Creado: Esta semana' },
  { value: 'creado_mes', label: 'Creado: Este mes' },
]

function matchFecha(ev, filtro) {
  if (!filtro) return true
  const now = new Date()
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = startOfDay(now)
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  if (filtro.startsWith('evento_')) {
    const d = startOfDay(new Date(ev.fecha))
    if (filtro === 'evento_hoy')   return d.getTime() === today.getTime()
    if (filtro === 'evento_semana') return d >= startOfWeek
    if (filtro === 'evento_mes')   return d >= startOfMonth
  }
  if (filtro.startsWith('creado_')) {
    const d = startOfDay(new Date(ev.created_at))
    if (filtro === 'creado_hoy')   return d.getTime() === today.getTime()
    if (filtro === 'creado_semana') return d >= startOfWeek
    if (filtro === 'creado_mes')   return d >= startOfMonth
  }
  return true
}

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEvento, setEditEvento] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [changingEstado, setChangingEstado] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      let url = '/eventos/?page_size=200'
      if (filtroEstado) url += `&estado=${filtroEstado}`
      if (search) url += `&search=${search}`
      const res = await api.get(url)
      setEventos(res.data.results || res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [filtroEstado, search])
  useEffect(() => { setPage(1) }, [filtroEstado, search, filtroFecha])

  const filtered = eventos.filter(ev => matchFecha(ev, filtroFecha))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleCambiarEstado = async (ev, nuevoEstado) => {
    setChangingEstado(ev.id)
    try {
      await api.patch(`/eventos/${ev.id}/`, { estado: nuevoEstado })
      setEventos(prev => prev.map(e => e.id === ev.id ? { ...e, estado: nuevoEstado, estado_display: ESTADOS.find(s => s.value === nuevoEstado)?.label || nuevoEstado } : e))
    } catch {}
    setChangingEstado(null)
  }

  const [form, setForm] = useState({ nombre: '', cliente: '', fecha: '', tipo_evento: 'matrimonio', pax: 1, lugar: '', estado: 'presupuestado', menu: '', observaciones: '' })

  const handleSave = async () => {
    try {
      if (editEvento) {
        await api.put(`/eventos/${editEvento.id}/`, form)
      } else {
        await api.post('/eventos/', form)
      }
      setShowModal(false)
      setEditEvento(null)
      setForm({ nombre: '', cliente: '', fecha: '', tipo_evento: 'matrimonio', pax: 1, lugar: '', estado: 'presupuestado', menu: '', observaciones: '' })
      load()
    } catch { alert('Error al guardar') }
  }

  const handleEdit = (ev) => {
    setEditEvento(ev)
    setForm({ nombre: ev.nombre, cliente: ev.cliente, fecha: toInputDate(ev.fecha), tipo_evento: ev.tipo_evento, pax: ev.pax, lugar: ev.lugar, estado: ev.estado, menu: ev.menu || '', observaciones: ev.observaciones || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return
    await api.delete(`/eventos/${id}/`)
    load()
  }

  return (
    <div>
      <div className="page-header responsive-stack">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">Gestión de eventos de banquetería</p>
        </div>
        <div className="flex gap-8 responsive-stack w-full-mobile">
          <button className="btn btn-outline w-full-mobile" onClick={() => api.get('/exportar/eventos/', { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'eventos.xlsx'; a.click()
          })}><FiDownload /> Excel</button>
          <button className="btn btn-primary w-full-mobile" onClick={() => { setEditEvento(null); setForm({ nombre: '', cliente: '', fecha: '', tipo_evento: 'matrimonio', pax: 1, lugar: '', estado: 'presupuestado', menu: '', observaciones: '' }); setShowModal(true) }}>
            <FiPlus /> Nuevo Evento
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar responsive-toolbar">
          <div className="table-toolbar-left responsive-stack">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar eventos..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control responsive-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select className="form-control responsive-select" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}>
              {FILTRO_FECHA.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <span className="mobile-hide" style={{ fontSize: 12, color: 'var(--txt3)' }}>{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? <div className="loading"><span className="spinner"></span>Cargando...</div> : (
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Cliente</th>
                <th>F. Evento</th>
                <th>F. Creación</th>
                <th>Tipo</th>
                <th className="center">Pax</th>
                <th className="right">Venta</th>
                <th className="right">Costo</th>
                <th className="right">Utilidad</th>
                <th className="center">Estado</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="11"><div className="empty-state"><p>No hay eventos registrados</p></div></td></tr>
              ) : paginated.map(ev => (
                <tr key={ev.id}>
                  <td className="bold" style={{ cursor: 'pointer', color: 'var(--acc)' }} onClick={() => navigate(`/eventos/${ev.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {ev.nombre}
                      {ev.es_externo && <span style={{ fontSize: 9, background: 'var(--pur-light)', color: 'var(--pur)', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>🌐 WEB</span>}
                    </div>
                  </td>
                  <td>{ev.cliente}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(ev.fecha)}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--txt3)', fontSize: 12 }}>{fmtDate(ev.created_at)}</td>
                  <td>{ev.tipo_evento_display}</td>
                  <td className="center">{ev.pax}</td>
                  <td className="right bold">{fmt(ev.venta_total)}</td>
                  <td className="right">{fmt(ev.costo_total)}</td>
                  <td className="right" style={{ color: ev.utilidad >= 0 ? 'var(--grn)' : 'var(--red)', fontWeight: 600 }}>{fmt(ev.utilidad)}</td>
                  <td className="center">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={ev.estado}
                        disabled={changingEstado === ev.id}
                        onChange={e => handleCambiarEstado(ev, e.target.value)}
                        className={`badge badge-${ev.estado}`}
                        style={{ appearance: 'none', paddingRight: 20, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 600, fontSize: 11 }}
                      >
                        {ESTADOS.filter(e => e.value).map(e => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                      <FiChevronDown size={10} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
                    </div>
                  </td>
                  <td className="center">
                    <div className="flex gap-8" style={{ justifyContent: 'center' }}>
                      <button className="btn-icon" onClick={() => navigate(`/eventos/${ev.id}`)} title="Ver detalle"><FiEye /></button>
                      <button className="btn-icon" onClick={() => handleEdit(ev)} title="Editar"><FiEdit2 /></button>
                      <button className="btn-icon" onClick={() => handleDelete(ev.id)} title="Eliminar" style={{ color: 'var(--red)' }}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Paginador total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <h3>{editEvento ? 'Editar Evento' : 'Nuevo Evento'}</h3>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label>Nombre del Evento</label>
                <input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="ej: Matrimonio García" /></div>
              <div className="form-group"><label>Cliente</label>
                <input className="form-control" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} placeholder="Nombre del cliente" /></div>
              <div className="form-group"><label>Fecha</label>
                <input type="date" className="form-control" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
              <div className="form-group"><label>Tipo de Evento</label>
                <select className="form-control" value={form.tipo_evento} onChange={e => setForm({...form, tipo_evento: e.target.value})}>
                  {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
                </select></div>
              <div className="form-group"><label>N° Personas (Pax)</label>
                <input type="number" className="form-control" value={form.pax} onChange={e => setForm({...form, pax: parseInt(e.target.value) || 1})} min="1" /></div>
              <div className="form-group"><label>Lugar</label>
                <input className="form-control" value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})} placeholder="Ubicación del evento" /></div>
              <div className="form-group"><label>Estado</label>
                <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                  {ESTADOS.filter(e=>e.value).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select></div>
            </div>
            <div className="form-group"><label>Menú</label>
              <textarea className="form-control" rows="2" value={form.menu} onChange={e => setForm({...form, menu: e.target.value})} placeholder="Descripción del menú"></textarea></div>
            <div className="form-group"><label>Observaciones</label>
              <textarea className="form-control" rows="2" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Notas adicionales"></textarea></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>{editEvento ? 'Guardar Cambios' : 'Crear Evento'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
