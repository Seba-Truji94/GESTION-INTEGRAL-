import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiPlus, FiSearch, FiDownload, FiDollarSign, FiPrinter, FiPaperclip, 
  FiEye, FiTrendingUp, FiActivity, FiUser, FiCalendar, FiClock, FiCheckCircle, FiInfo, FiX
} from 'react-icons/fi'
import api, { fmt, fmtDate } from '../services/api'

export default function Cobros() {
  const [cobros, setCobros] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [allPagos, setAllPagos] = useState([]) // For global traceability
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [activeTab, setActiveTab] = useState('gestion') // 'gestion' | 'trazabilidad'
  
  const [showModal, setShowModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [showTraceModal, setShowTraceModal] = useState(false)
  
  const [selectedCobro, setSelectedCobro] = useState(null)
  
  const [cobroForm, setCobroForm] = useState({ presupuesto: '', monto_total: 0, observaciones: '' })
  const [pagoForm, setPagoForm] = useState({ monto: 0, metodo_pago: 'transferencia', fecha_pago: new Date().toISOString().split('T')[0], comprobante: '', observaciones: '' })

  const load = async () => {
    setLoading(true)
    try {
      let url = '/cobros/?page_size=200'
      if (filtroEstado) url += `&estado=${filtroEstado}`
      if (search) url += `&search=${search}`
      
      const [cobrosRes, presRes] = await Promise.all([
        api.get(url), 
        api.get('/presupuestos/?page_size=200')
      ])
      
      const data = cobrosRes.data.results || cobrosRes.data
      setCobros(data)
      setPresupuestos(presRes.data.results || presRes.data)
      
      // Extract all payments for global traceability log
      const payments = data.flatMap(c => (c.pagos || []).map(p => ({
          ...p,
          cobro_id: c.id,
          evento_nombre: c.evento_nombre,
          cliente: c.cliente,
          presupuesto_numero: c.presupuesto_numero
      }))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setAllPagos(payments)
      
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [filtroEstado, search])

  const handleCreateCobro = async () => {
    if (!cobroForm.presupuesto) { alert('Selecciona un presupuesto'); return }
    await api.post('/cobros/', cobroForm)
    setShowModal(false)
    load()
  }

  const handlePago = async () => {
    if (!pagoForm.monto || pagoForm.monto <= 0) { alert('Ingresa un monto válido'); return }
    const formData = new FormData()
    formData.append('monto', pagoForm.monto)
    formData.append('metodo_pago', pagoForm.metodo_pago)
    formData.append('fecha_pago', pagoForm.fecha_pago)
    formData.append('comprobante', pagoForm.comprobante)
    formData.append('observaciones', pagoForm.observaciones)
    if (pagoForm.evidencia) formData.append('evidencia', pagoForm.evidencia)

    try {
      await api.post(`/cobros/${selectedCobro.id}/pagos/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowPagoModal(false)
      load()
    } catch (e) { alert('Error al registrar el pago') }
  }

  // KPIs
  const totalCobrado = cobros.reduce((s, c) => s + Number(c.monto_total || 0), 0)
  const totalPagado = cobros.reduce((s, c) => s + Number(c.monto_pagado || 0), 0)
  const totalPendiente = totalCobrado - totalPagado
  const deudoresCriticos = cobros.filter(c => Number(c.saldo_pendiente) > 0 && c.estado !== 'cancelado').length

  return (
    <div className="cobros-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión Financiera y Cobranza</h1>
          <p className="page-subtitle">Trazabilidad total de ingresos y auditoría de movimientos</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => api.get('/exportar/cobros/', { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'cobros.xlsx'; a.click()
          })}><FiDownload /> Exportar Excel</button>
          <button className="btn btn-primary" onClick={() => { setCobroForm({ presupuesto: '', monto_total: 0, observaciones: '' }); setShowModal(true) }}>
            <FiPlus /> Crear Cobro
          </button>
        </div>
      </div>

      <div className="responsive-kpi mb-24">
        <div className="kpi-card"><div className="kpi-label">Proyección de Ingresos</div><div className="kpi-value">{fmt(totalCobrado)}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Recaudación Efectiva</div><div className="kpi-value green">{fmt(totalPagado)}</div></div>
        <div className="kpi-card red"><div className="kpi-label">Por Recaudar (Morosidad)</div><div className="kpi-value red">{fmt(totalPendiente)}</div></div>
        <div className="kpi-card amber"><div className="kpi-label">Deudores Críticos</div><div className="kpi-value amber">{deudoresCriticos} Proyectos</div></div>
      </div>

      <div className="card mb-24" style={{padding: 0, overflow: 'hidden'}}>
        <div className="flex" style={{borderBottom: '1px solid var(--bd)', background: '#f8fafc'}}>
            <button 
                className={`tab-btn ${activeTab === 'gestion' ? 'active' : ''}`}
                onClick={() => setActiveTab('gestion')}
                style={{padding:'16px 24px', border:'none', background:'none', borderBottom: activeTab === 'gestion' ? '2px solid var(--acc)' : '2px solid transparent', fontWeight: 600, color: activeTab === 'gestion' ? 'var(--acc)' : 'var(--txt2)', cursor:'pointer'}}
            >
                <FiActivity style={{marginRight:8}}/> Gestión de Presupuestos
            </button>
            <button 
                className={`tab-btn ${activeTab === 'trazabilidad' ? 'active' : ''}`}
                onClick={() => setActiveTab('trazabilidad')}
                style={{padding:'16px 24px', border:'none', background:'none', borderBottom: activeTab === 'trazabilidad' ? '2px solid var(--acc)' : '2px solid transparent', fontWeight: 600, color: activeTab === 'trazabilidad' ? 'var(--acc)' : 'var(--txt2)', cursor:'pointer'}}
            >
                <FiTrendingUp style={{marginRight:8}}/> Log de Movimientos (Auditoría)
            </button>
        </div>

        <div style={{padding: 24}}>
            {activeTab === 'gestion' ? (
                <div className="table-wrapper" style={{boxShadow:'none', border:'none', background:'transparent'}}>
                    <div className="table-toolbar" style={{padding:0, marginBottom:16}}>
                        <div className="table-toolbar-left">
                            <div className="search-wrap"><FiSearch className="search-icon" /><input className="search-input" placeholder="Buscar por presupuesto, evento o cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                            <select className="form-control" style={{width:160}} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                                <option value="">Todos los Estados</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="parcial">Abonos Parciales</option>
                                <option value="pagado">Pagados Completos</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead><tr>
                            <th>ID</th><th>Presupuesto</th><th>Evento / Cliente</th>
                            <th className="right">Venta</th><th className="right">Pagado</th>
                            <th className="right">Saldo</th><th className="center">Estado</th><th className="center">Auditoría</th>
                        </tr></thead>
                        <tbody>
                            {cobros.map(c => (
                                <tr key={c.id}>
                                    <td className="font-mono" style={{fontSize:11}}>#{c.id}</td>
                                    <td className="bold">{c.presupuesto_numero}</td>
                                    <td>
                                        <div className="bold">{c.evento_nombre}</div>
                                        <div style={{fontSize:11, color:'var(--txt3)'}}>{c.cliente}</div>
                                    </td>
                                    <td className="right bold">{fmt(c.monto_total)}</td>
                                    <td className="right" style={{color:'var(--grn)', fontWeight:600}}>{fmt(c.monto_pagado)}</td>
                                    <td className="right" style={{color: Number(c.saldo_pendiente) > 0 ? 'var(--red)' : 'var(--grn)', fontWeight:600}}>{fmt(c.saldo_pendiente)}</td>
                                    <td className="center"><span className={`badge badge-${c.estado}`}>{c.estado_display}</span></td>
                                    <td className="center">
                                        <div className="flex gap-8 justify-center">
                                            <button className="btn-icon" title="Ver detalles y movimientos" onClick={() => { setSelectedCobro(c); setShowTraceModal(true); }}>
                                                <FiEye />
                                            </button>
                                            {c.estado !== 'pagado' && (
                                                <button className="btn btn-success btn-sm" onClick={() => { setSelectedCobro(c); setPagoForm({ monto: Number(c.saldo_pendiente), metodo_pago: 'transferencia', fecha_pago: new Date().toISOString().split('T')[0], comprobante: '', observaciones: '' }); setShowPagoModal(true) }}>
                                                    <FiDollarSign />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="table-wrapper" style={{boxShadow:'none', border:'none', background:'transparent'}}>
                     <table>
                        <thead><tr>
                            <th>Registro</th><th>Evento / Presupuesto</th><th>Monto</th><th>Método</th><th>Gestor (Auditoría)</th><th>Fecha Mov.</th><th className="center">Comprobante</th>
                        </tr></thead>
                        <tbody>
                            {allPagos.length === 0 ? <tr><td colSpan="7" className="center py-24"><FiInfo/> No hay registros de pagos en el sistema</td></tr> : allPagos.map(p => (
                                <tr key={p.id}>
                                    <td style={{fontSize:11, color:'var(--txt3)'}}>{new Date(p.created_at).toLocaleString()}</td>
                                    <td>
                                        <div className="bold">{p.evento_nombre}</div>
                                        <div className="font-mono" style={{fontSize:11}}>{p.presupuesto_numero}</div>
                                    </td>
                                    <td className="right bold" style={{color:'var(--grn)'}}>{fmt(p.monto)}</td>
                                    <td><span className={`badge ${p.metodo_pago === 'efectivo' ? 'badge-amber' : 'badge-presupuestado'}`}>{p.metodo_pago_display}</span></td>
                                    <td>
                                        <div className="flex-center gap-8">
                                            <div style={{width:24, height:24, borderRadius:'50%', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10}}><FiUser/></div>
                                            <span className="bold" style={{fontSize:12}}>{p.gestor_nombre}</span>
                                        </div>
                                    </td>
                                    <td>{fmtDate(p.fecha_pago)}</td>
                                    <td className="center">
                                        <div className="flex gap-4 justify-center">
                                            <Link to={`/pagos/${p.id}/comprobante`} className="btn-icon" title="Imprimir Comprobante"><FiPrinter/></Link>
                                            {p.evidencia && <a href={p.evidencia} target="_blank" rel="noreferrer" className="btn-icon" title="Ver Transferencia"><FiPaperclip/></a>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Modal Traceability Detallada */}
      {showTraceModal && selectedCobro && (
          <FinanceTraceabilityModal 
            cobro={selectedCobro} 
            onClose={() => setShowTraceModal(false)}
            onAddPayment={() => { setShowTraceModal(false); setShowPagoModal(true); }}
          />
      )}

      {/* New Cobro Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>Preparar Nuevo Cobro</h3>
            <div className="form-group"><label>Presupuesto Asociado</label>
              <select className="form-control" value={cobroForm.presupuesto} onChange={e => {
                const pres = presupuestos.find(p => String(p.id) === e.target.value)
                setCobroForm({...cobroForm, presupuesto: e.target.value, monto_total: pres ? Number(pres.total) : 0})
              }}>
                <option value="">-- Seleccionar presupuesto aprobado --</option>
                {presupuestos.map(p => <option key={p.id} value={p.id}>{p.numero} - {p.evento_nombre} ({fmt(p.total)})</option>)}
              </select></div>
            <div className="form-group"><label>Monto a Cobrar</label>
              <input type="number" className="form-control" value={cobroForm.monto_total} onChange={e => setCobroForm({...cobroForm, monto_total: parseFloat(e.target.value)||0})} /></div>
            <div className="form-group"><label>Notas de Cobranza</label>
              <textarea className="form-control" rows="2" value={cobroForm.observaciones} onChange={e => setCobroForm({...cobroForm, observaciones: e.target.value})} placeholder="Ej: Pago inicial del 50%"></textarea></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreateCobro}>Generar Cobro</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Insertion Modal */}
      {showPagoModal && selectedCobro && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPagoModal(false)}>
          <div className="modal">
            <h3>Ingresar Movimiento de Caja</h3>
            <div style={{background:'var(--bg)',padding:14,borderRadius:'var(--r)',marginBottom:16,fontSize:13}}>
              <div className="flex-between"><span>Cobro #{selectedCobro.id} ({selectedCobro.presupuesto_numero})</span><strong>{selectedCobro.evento_nombre}</strong></div>
              <div className="flex-between" style={{marginTop:4}}><span>Saldo por recaudar:</span><strong style={{color:'var(--red)'}}>{fmt(selectedCobro.saldo_pendiente)}</strong></div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label>Monto Entrante</label>
                <input type="number" className="form-control" value={pagoForm.monto} onChange={e => setPagoForm({...pagoForm, monto: parseFloat(e.target.value)||0})} /></div>
              <div className="form-group"><label>Método Recibido</label>
                <select className="form-control" value={pagoForm.metodo_pago} onChange={e => setPagoForm({...pagoForm, metodo_pago: e.target.value})}>
                  <option value="efectivo">Efectivo</option><option value="transferencia">Transferencia Bancaria</option>
                </select></div>
              <div className="form-group"><label>Fecha Recepción</label>
                <input type="date" className="form-control" value={pagoForm.fecha_pago} onChange={e => setPagoForm({...pagoForm, fecha_pago: e.target.value})} /></div>
              <div className="form-group"><label>Folio Comprobante</label>
                <input className="form-control" value={pagoForm.comprobante} onChange={e => setPagoForm({...pagoForm, comprobante: e.target.value})} placeholder="Opcional" /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Evidencia Digital (Transferencia/Foto)</label>
                <input type="file" className="form-control" onChange={e => setPagoForm({...pagoForm, evidencia: e.target.files[0]})} accept="image/*,.pdf" /></div>
            </div>
            <div className="form-group"><label>Comentarios Internos</label>
              <textarea className="form-control" rows="2" value={pagoForm.observaciones} onChange={e => setPagoForm({...pagoForm, observaciones: e.target.value})}></textarea></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowPagoModal(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={handlePago}><FiCheckCircle /> Registrar Movimiento y Firmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FinanceTraceabilityModal({ cobro, onClose, onAddPayment }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg" style={{maxWidth:900}}>
                <div className="flex-between mb-24">
                    <div>
                        <h2 style={{margin:0}}>Trazabilidad Financiera: {cobro.presupuesto_numero}</h2>
                        <p style={{fontSize: 14, color:'var(--txt2)', marginTop: 4}}>{cobro.evento_nombre} — {cobro.cliente}</p>
                    </div>
                    <button className="btn-icon" onClick={onClose}><FiX/></button>
                </div>

                <div className="responsive-kpi mb-24">
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Total Presupuestado</div><div className="kpi-value">{fmt(cobro.monto_total)}</div></div>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Pagado a la Fecha</div><div className="kpi-value green">{fmt(cobro.monto_pagado)}</div></div>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Saldo Pendiente</div><div className="kpi-value red">{fmt(cobro.saldo_pendiente)}</div></div>
                    <div className="kpi-card" style={{background:'var(--bg)', border:'none'}}><div className="kpi-label">Diferencia/Ajuste</div><div className="kpi-value">0</div></div>
                </div>

                <div className="flex-between mb-16">
                    <h3 style={{margin:0, fontSize:15}}>Bitácora de Movimientos (Auditoría)</h3>
                    {Number(cobro.saldo_pendiente) > 0 && <button className="btn btn-success btn-sm" onClick={onAddPayment}><FiPlus/> Agregar Abono</button>}
                </div>

                <div className="table-wrapper" style={{boxShadow:'none', border:'1px solid var(--bd)'}}>
                    <table>
                        <thead><tr><th>Fecha Registro</th><th>Fecha Mov.</th><th>Monto</th><th>Método</th><th>Auditor/Gestor</th><th className="center">Comprobante</th></tr></thead>
                        <tbody>
                            {(!cobro.pagos || cobro.pagos.length === 0) ? (
                                <tr><td colSpan="6" className="center py-24"><FiInfo/> No se han registrado movimientos para este cobro</td></tr>
                            ) : cobro.pagos.map(p => (
                                <tr key={p.id}>
                                    <td style={{fontSize:11, color:'var(--txt3)'}}>{new Date(p.created_at).toLocaleString()}</td>
                                    <td className="bold">{fmtDate(p.fecha_pago)}</td>
                                    <td className="right bold" style={{color:'var(--grn)'}}>{fmt(p.monto)}</td>
                                    <td><span className="badge badge-parcial">{p.metodo_pago_display}</span></td>
                                    <td>
                                        <div className="flex-center gap-8">
                                            <div style={{width:24, height:24, borderRadius:'50%', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10}}><FiUser/></div>
                                            <span style={{fontSize:12}}>{p.gestor_nombre}</span>
                                        </div>
                                    </td>
                                    <td className="center">
                                        <div className="flex gap-4 justify-center">
                                            <Link to={`/pagos/${p.id}/comprobante`} className="btn-icon" title="Imprimir Recibo"><FiPrinter/></Link>
                                            {p.evidencia && <a href={p.evidencia} target="_blank" rel="noreferrer" className="btn-icon" title="Ver Transferencia"><FiPaperclip/></a>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="modal-actions" style={{marginTop:32}}>
                    <button className="btn btn-outline" style={{width:'100%'}} onClick={onClose}>Cerrar Detalle Financiero</button>
                </div>
            </div>
        </div>
    )
}


