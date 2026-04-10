import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, FiPlus, FiDollarSign, FiClock, FiFileText, 
  FiTrendingUp, FiCheckCircle, FiUser, FiPaperclip, FiPrinter, FiX, FiInfo
} from 'react-icons/fi'
import api, { fmt, fmtDate } from '../services/api'

export default function EventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [seguimiento, setSeguimiento] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSegForm, setShowSegForm] = useState(false)
  const [segForm, setSegForm] = useState({ estado_nuevo: '', notas: '' })
  
  // Traceability Modal State
  const [showTraceModal, setShowTraceModal] = useState(false)
  const [selectedCobroForTrace, setSelectedCobroForTrace] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [evRes, segRes] = await Promise.all([
        api.get(`/eventos/${id}/`),
        api.get(`/eventos/${id}/seguimiento/`)
      ])
      setEvento(evRes.data)
      setSeguimiento(segRes.data.results || segRes.data)
      setSegForm(f => ({ ...f, estado_nuevo: evRes.data.estado }))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleSeguimiento = async () => {
    await api.post(`/eventos/${id}/seguimiento/crear/`, segForm)
    setShowSegForm(false)
    load()
  }

  if (loading || !evento) return <div className="loading"><span className="spinner"></span>Cargando detalle del evento...</div>

  const margenColor = evento.margen >= 30 ? 'var(--grn)' : evento.margen >= 15 ? 'var(--amb)' : 'var(--red)'

  // Recalculate event-level financial info
  const totalPresupuestado = evento.venta_total || 0
  const totalPagado = (evento.presupuestos || []).reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0)
  const totalPendiente = totalPresupuestado - totalPagado

  return (
    <div className="evento-detalle">
      <div className="page-header">
        <div className="flex-center gap-12">
          <button className="btn-icon" onClick={() => navigate('/eventos')}><FiArrowLeft /></button>
          <div>
            <h1 className="page-title">{evento.nombre}</h1>
            <p className="page-subtitle">{evento.cliente} — {evento.tipo_evento_display}</p>
          </div>
        </div>
        <div className="flex-center gap-12">
            <span className={`badge badge-${evento.estado}`} style={{ fontSize: 13, padding: '6px 16px' }}>{evento.estado_display}</span>
        </div>
      </div>

      {/* Info + KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-label">Fecha</div><div className="kpi-value" style={{fontSize:16}}>{fmtDate(evento.fecha)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Personas</div><div className="kpi-value">{evento.pax}</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Venta Estimada</div><div className="kpi-value blue" style={{fontSize:18}}>{fmt(totalPresupuestado)}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Pagado</div><div className="kpi-value green" style={{fontSize:18}}>{fmt(totalPagado)}</div></div>
        <div className="kpi-card red"><div className="kpi-label">Saldo Pendiente</div><div className="kpi-value red" style={{fontSize:18}}>{fmt(totalPendiente)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Margen Est.</div><div className="kpi-value" style={{fontSize:18,color:margenColor}}>{evento.margen?.toFixed(1)}%</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 20, alignItems: 'start' }}>
        <div className="flex-column gap-20">
            {/* Presupuestos y Finanzas */}
            <div className="card">
                <div className="flex-between mb-16">
                    <div className="card-title">Presupuestos y Control de Cobros</div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/presupuestos/nuevo?evento=${id}`)}>
                    <FiPlus /> Nuevo Presupuesto
                    </button>
                </div>
                
                {(!evento.presupuestos || evento.presupuestos.length === 0) ? (
                    <div className="empty-state" style={{padding:24}}><p>Sin presupuestos asociados</p></div>
                ) : (
                    <div className="table-wrapper" style={{boxShadow:'none', border:'none', background:'transparent'}}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Folio</th>
                                    <th>Estado</th>
                                    <th className="right">Venta</th>
                                    <th className="right">Costo</th>
                                    <th className="right">Pagado</th>
                                    <th className="center">Trazabilidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evento.presupuestos.map(p => (
                                    <tr key={p.id}>
                                        <td className="bold">{p.numero}</td>
                                        <td><span className={`badge badge-${p.estado}`}>{p.estado_display}</span></td>
                                        <td className="right bold">{fmt(p.total)}</td>
                                        <td className="right" style={{color:'var(--txt3)'}}>{fmt(p.costo_total)}</td>
                                        <td className="right" style={{color:'var(--grn)', fontWeight:600}}>{fmt(p.monto_pagado || 0)}</td>
                                        <td className="center">
                                            <button className="btn btn-icon btn-outline" onClick={() => { setSelectedCobroForTrace(p); setShowTraceModal(true); }} title="Ver auditoría financiera">
                                                <FiTrendingUp />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resumen de Movimientos (Traceability inline) */}
            <div className="card">
                <div className="card-title mb-16">Acciones Rápidas</div>
                <div className="flex gap-12">
                   <button className="btn btn-outline" onClick={() => navigate('/cobros')}>
                       <FiDollarSign /> Ir a Cobros Generales
                   </button>
                   <button className="btn btn-outline" onClick={() => navigate('/reportes')}>
                       <FiActivity /> Ver Reporte de Rentabilidad
                   </button>
                </div>
            </div>
        </div>

        {/* Sidebar: Timeline */}
        <div className="card">
          <div className="flex-between mb-16">
            <div className="card-title">Línea de Vida (Seguimiento)</div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowSegForm(!showSegForm)}>
              <FiPlus />
            </button>
          </div>

          {showSegForm && (
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--r)', marginBottom: 16 }}>
              <div className="form-group mb-12"><label>Nuevo Estado</label>
                <select className="form-control" value={segForm.estado_nuevo} onChange={e => setSegForm({...segForm, estado_nuevo: e.target.value})}>
                    <option value="presupuestado">Presupuestado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select></div>
              <div className="form-group mb-12"><label>Notas</label>
                <input className="form-control" value={segForm.notas} onChange={e => setSegForm({...segForm, notas: e.target.value})} placeholder="Ej: Pago de reserva recibido" /></div>
              <button className="btn btn-primary btn-sm w-100" onClick={handleSeguimiento}>Actualizar Estado</button>
            </div>
          )}

          <div className="timeline">
            {seguimiento.length === 0 ? (
              <div className="empty-state" style={{padding:24}}><p>Sin registros</p></div>
            ) : seguimiento.map((s, i) => (
              <div key={s.id} className="timeline-item">
                <div className={`timeline-dot ${s.estado_nuevo === 'completado' ? 'green' : s.estado_nuevo === 'cancelado' ? 'amber' : ''}`}></div>
                <div className="timeline-content">
                  <strong>{s.estado_anterior ? `${s.estado_anterior} → ` : ''}{s.estado_nuevo}</strong>
                  {s.notas && <p style={{ fontSize: 12, color: 'var(--txt2)', margin: '4px 0 0' }}>{s.notas}</p>}
                  <div className="timeline-date" style={{fontSize:10}}>{s.usuario_nombre} — {new Date(s.fecha).toLocaleString('es-CL')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTraceModal && selectedCobroForTrace && (
          <FinanceTraceabilityModal 
            presupuesto={selectedCobroForTrace} 
            evento={evento}
            onClose={() => setShowTraceModal(false)} 
          />
      )}
    </div>
  )
}

function FinanceTraceabilityModal({ presupuesto, evento, onClose }) {
    // Note: 'presupuesto' here comes from the 'evento.presupuestos' array which already includes pagos if pre-fetched/serialized correctly.
    // If not, we might need a separate load, but let's assume serialization is sufficient.
    const [pagos, setPagos] = useState(presupuesto.pagos || [])
    
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg" style={{maxWidth:800}}>
                <div className="flex-between mb-24">
                    <div>
                        <h2 style={{margin:0}}>Detalle de Auditoría: {presupuesto.numero}</h2>
                        <p style={{fontSize:14, color:'var(--txt3)', marginTop:4}}>{evento.nombre} • {evento.cliente}</p>
                    </div>
                    <button className="btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3, 1fr)', marginBottom:24}}>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Venta Presupuesto</div><div className="kpi-value">{fmt(presupuesto.total)}</div></div>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Recaudado</div><div className="kpi-value green">{fmt(presupuesto.monto_pagado || 0)}</div></div>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Pendiente</div><div className="kpi-value red">{fmt(presupuesto.total - (presupuesto.monto_pagado || 0))}</div></div>
                </div>

                <h3 style={{fontSize:15, marginBottom:12}}>Movimientos Firmados</h3>
                <div className="table-wrapper" style={{boxShadow:'none', border:'1px solid var(--bd)'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha Mov.</th>
                                <th className="right">Monto</th>
                                <th>Método</th>
                                <th>Gestor / Auditor</th>
                                <th className="center">Docs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!pagos || pagos.length === 0) ? (
                                <tr><td colSpan="5" className="center py-24"><FiInfo/> No hay pagos registrados para este presupuesto</td></tr>
                            ) : pagos.map(p => (
                                <tr key={p.id}>
                                    <td className="bold">{fmtDate(p.fecha_pago)}</td>
                                    <td className="right bold" style={{color:'var(--grn)'}}>{fmt(p.monto)}</td>
                                    <td><span className="badge badge-parcial">{p.metodo_pago_display}</span></td>
                                    <td>
                                        <div className="flex-center gap-8">
                                            <div style={{width:24, height:24, borderRadius:'50%', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10}}><FiUser/></div>
                                            <span style={{fontSize:12}}>{p.gestor_nombre || 'Adm'}</span>
                                        </div>
                                    </td>
                                    <td className="center">
                                        <div className="flex gap-4 justify-center">
                                            <Link to={`/pagos/${p.id}/comprobante`} className="btn-icon" title="Ver Recibo"><FiPrinter/></Link>
                                            {p.evidencia && <a href={p.evidencia} target="_blank" rel="noreferrer" className="btn-icon" title="Ver Evidencia"><FiPaperclip/></a>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="modal-actions" style={{marginTop:32}}>
                    <button className="btn btn-outline w-100" onClick={onClose}>Cerrar Auditoría</button>
                </div>
            </div>
        </div>
    )
}

function FiActivity() { return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> }
