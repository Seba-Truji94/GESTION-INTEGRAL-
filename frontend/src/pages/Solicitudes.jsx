import { useState, useEffect } from 'react'
import { FiSearch, FiMail, FiPhone, FiCalendar, FiUsers, FiMessageSquare, FiClock, FiCheckCircle, FiEye, FiX, FiInbox, FiFilter } from 'react-icons/fi'
import api, { fmtDate } from '../services/api'

const ESTADOS = [
  { value: '', label: 'Todas' },
  { value: 'nueva', label: 'Nueva' },
  { value: 'vista', label: 'Vista' },
  { value: 'respondida', label: 'Respondida' },
]

const ESTADO_CFG = {
  nueva:      { bg: 'var(--blu-light)', color: 'var(--blu)',  dot: '#3b82f6' },
  vista:      { bg: '#fef9c3',          color: '#854d0e',     dot: '#eab308' },
  respondida: { bg: 'var(--grn-light)', color: 'var(--grn)',  dot: '#16a34a' },
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchSolicitudes() }, [])

  async function fetchSolicitudes() {
    try {
      const res = await api.get('/public/solicitudes/')
      setSolicitudes(res.data.results ?? res.data)
    } catch {
      setSolicitudes([])
    } finally {
      setLoading(false)
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.patch(`/public/solicitudes/${id}/`, { estado })
      setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado } : s))
      if (selected?.id === id) setSelected(prev => ({ ...prev, estado }))
    } catch {}
  }

  const filtradas = solicitudes.filter(s => {
    const matchSearch = !search ||
      s.nombre_cliente?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.telefono?.includes(search)
    const matchEstado = !filtroEstado || s.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const counts = {
    total: solicitudes.length,
    nueva: solicitudes.filter(s => s.estado === 'nueva').length,
    vista: solicitudes.filter(s => s.estado === 'vista').length,
    respondida: solicitudes.filter(s => s.estado === 'respondida').length,
  }

  const openSelected = (s) => {
    setSelected(s)
    if (s.estado === 'nueva') cambiarEstado(s.id, 'vista')
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de Cotización</h1>
          <p className="page-subtitle">Prospectos recibidos desde el sitio web</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',      val: counts.total,      color: 'var(--acc)',      bg: 'var(--acc-light)' },
          { label: 'Nuevas',     val: counts.nueva,      color: 'var(--blu)',      bg: 'var(--blu-light)' },
          { label: 'Vistas',     val: counts.vista,      color: '#854d0e',         bg: '#fef9c3' },
          { label: 'Respondidas',val: counts.respondida, color: 'var(--grn)',      bg: 'var(--grn-light)' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--bg2)', border: '1px solid var(--brd)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.val}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--txt3)', fontWeight: 500 }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar nombre, email, teléfono..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {ESTADOS.map(e => (
                <button key={e.value} onClick={() => setFiltroEstado(e.value)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
                    background: filtroEstado === e.value ? 'var(--acc)' : 'var(--bg3)',
                    color: filtroEstado === e.value ? '#fff' : 'var(--txt2)',
                  }}>
                  {e.label}
                  {e.value === 'nueva' && counts.nueva > 0 && (
                    <span style={{ marginLeft: 5, background: filtroEstado === 'nueva' ? 'rgba(255,255,255,0.3)' : 'var(--blu)', color: filtroEstado === 'nueva' ? '#fff' : '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10 }}>
                      {counts.nueva}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{filtradas.length} solicitud{filtradas.length !== 1 ? 'es' : ''}</span>
        </div>

        {loading ? (
          <div className="loading"><span className="spinner" />Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <FiInbox size={36} style={{ opacity: .25, marginBottom: 8 }} />
            <p>No hay solicitudes</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th className="center">Fecha Evento</th>
                <th className="center">Pax</th>
                <th className="center">Recibido</th>
                <th className="center">Estado</th>
                <th className="center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(s => {
                const cfg = ESTADO_CFG[s.estado] || { bg: 'var(--bg3)', color: 'var(--txt2)', dot: '#999' }
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => openSelected(s)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.estado === 'nueva' && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${cfg.bg}` }} />
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--txt1)' }}>{s.nombre_cliente}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--txt2)', fontSize: 13 }}>{s.email}</td>
                    <td style={{ color: 'var(--txt3)', fontSize: 13 }}>{s.telefono || '—'}</td>
                    <td className="center" style={{ whiteSpace: 'nowrap' }}>{s.fecha_evento ? fmtDate(s.fecha_evento) : '—'}</td>
                    <td className="center">{s.pax > 0 ? `${s.pax}` : '—'}</td>
                    <td className="center" style={{ color: 'var(--txt3)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(s.created_at)}</td>
                    <td className="center">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
                        {s.estado}
                      </span>
                    </td>
                    <td className="center" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {s.estado !== 'respondida' && (
                          <button className="btn-icon" title="Marcar respondida" style={{ color: 'var(--grn)' }}
                            onClick={() => cambiarEstado(s.id, 'respondida')}>
                            <FiCheckCircle size={15} />
                          </button>
                        )}
                        <button className="btn-icon" title="Ver detalle" onClick={() => openSelected(s)}>
                          <FiEye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="flex-between mb-24">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--acc-light)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                  {selected.nombre_cliente?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt1)', margin: 0 }}>{selected.nombre_cliente}</p>
                  {(() => { const cfg = ESTADO_CFG[selected.estado] || {}; return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.dot }} />{selected.estado}
                    </span>
                  )})()}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><FiX /></button>
            </div>

            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              {[
                { icon: <FiMail size={13} />, label: 'Email',        val: selected.email },
                { icon: <FiPhone size={13} />, label: 'Teléfono',   val: selected.telefono || '—' },
                { icon: <FiCalendar size={13} />, label: 'F. Evento', val: selected.fecha_evento ? fmtDate(selected.fecha_evento) : '—' },
                { icon: <FiUsers size={13} />, label: 'Personas',    val: selected.pax > 0 ? `${selected.pax} personas` : '—' },
                { icon: <FiClock size={13} />, label: 'Recibido',    val: fmtDate(selected.created_at) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--txt3)', width: 16 }}>{r.icon}</span>
                  <span style={{ color: 'var(--txt3)', width: 80, flexShrink: 0, fontSize: 12 }}>{r.label}</span>
                  <span style={{ color: 'var(--txt1)', fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
            </div>

            {selected.descripcion && (
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--txt3)', marginBottom: 6 }}>Descripción</p>
                <p style={{ fontSize: 13, color: 'var(--txt1)', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{selected.descripcion}</p>
              </div>
            )}

            <div className="modal-actions">
              {selected.estado !== 'vista' && selected.estado !== 'respondida' && (
                <button className="btn btn-outline" onClick={() => cambiarEstado(selected.id, 'vista')}>Marcar vista</button>
              )}
              {selected.estado !== 'respondida' && (
                <button className="btn btn-primary" style={{ background: 'var(--grn)', borderColor: 'var(--grn)' }} onClick={() => cambiarEstado(selected.id, 'respondida')}>
                  <FiCheckCircle size={13} /> Respondida
                </button>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="btn btn-primary">
                  <FiMail size={13} /> Enviar email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
