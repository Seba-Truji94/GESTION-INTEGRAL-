import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiDownload, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import api, { fmt, fmtDate } from '../services/api'

const ESTADOS = [
  { value: '', label: 'Todos' },
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

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEvento, setEditEvento] = useState(null)
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
    } catch (e) { alert('Error al guardar') }
  }

  const handleEdit = (ev) => {
    setEditEvento(ev)
    setForm({ nombre: ev.nombre, cliente: ev.cliente, fecha: ev.fecha, tipo_evento: ev.tipo_evento, pax: ev.pax, lugar: ev.lugar, estado: ev.estado, menu: ev.menu || '', observaciones: ev.observaciones || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return
    await api.delete(`/eventos/${id}/`)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">Gestión de eventos de banquetería</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => api.get('/exportar/eventos/', { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'eventos.xlsx'; a.click()
          })}><FiDownload /> Excel</button>
          <button className="btn btn-primary" onClick={() => { setEditEvento(null); setForm({ nombre: '', cliente: '', fecha: '', tipo_evento: 'matrimonio', pax: 1, lugar: '', estado: 'presupuestado', menu: '', observaciones: '' }); setShowModal(true) }}>
            <FiPlus /> Nuevo Evento
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar eventos..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 160 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{eventos.length} eventos</span>
        </div>

        {loading ? <div className="loading"><span className="spinner"></span>Cargando...</div> : (
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Cliente</th>
                <th>Fecha</th>
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
              {eventos.length === 0 ? (
                <tr><td colSpan="10"><div className="empty-state"><p>No hay eventos registrados</p></div></td></tr>
              ) : eventos.map(ev => (
                <tr key={ev.id}>
                  <td className="bold" style={{ cursor: 'pointer', color: 'var(--acc)' }} onClick={() => navigate(`/eventos/${ev.id}`)}>{ev.nombre}</td>
                  <td>{ev.cliente}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(ev.fecha)}</td>
                  <td>{ev.tipo_evento_display}</td>
                  <td className="center">{ev.pax}</td>
                  <td className="right bold">{fmt(ev.venta_total)}</td>
                  <td className="right">{fmt(ev.costo_total)}</td>
                  <td className="right" style={{ color: ev.utilidad >= 0 ? 'var(--grn)' : 'var(--red)', fontWeight: 600 }}>{fmt(ev.utilidad)}</td>
                  <td className="center"><span className={`badge badge-${ev.estado}`}>{ev.estado_display}</span></td>
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
