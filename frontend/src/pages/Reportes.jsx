import { useState, useEffect, useMemo } from 'react'
import { 
  FiFileText, FiDollarSign, FiPackage, FiBarChart2, FiFilter, 
  FiArrowUpRight, FiArrowDownLeft, FiCalendar, FiUser, FiInfo, FiTrendingUp,
  FiClock, FiX, FiCheckCircle, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import api, { fmt, fmtDate } from '../services/api'

export default function Reportes() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rentabilidad')
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [mes, setMes] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    load()
  }, [anio, mes])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/reportes/', { params: { anio, mes } })
      setData(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'rentabilidad', label: 'Rentabilidad de Proyectos', icon: <FiTrendingUp /> },
    { id: 'historico', label: 'Histórico Realizados', icon: <FiCalendar /> },
    { id: 'finanzas', label: 'Flujo de Caja Mensual', icon: <FiDollarSign /> },
    { id: 'insumos', label: 'Uso de Insumos', icon: <FiPackage /> }
  ]

  if (loading && !data) return <div className="loading"><span className="spinner"></span>Generando reportes optimizados...</div>

  return (
    <div className="reportes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportería y Cruce de Datos</h1>
          <p className="page-subtitle">Análisis técnico-financiero con indexación de alto rendimiento</p>
        </div>
        <div className="flex gap-12">
            <div className="flex-center gap-8 card" style={{padding: '8px 16px', background: 'var(--wh)'}}>
                <FiCalendar style={{color: 'var(--txt3)'}} />
                <select className="form-control" style={{width: 100, border: 'none', background: 'none'}} value={anio} onChange={e => setAnio(e.target.value)}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="form-control" style={{width: 130, border: 'none', background: 'none'}} value={mes} onChange={e => setMes(e.target.value)}>
                    <option value="">Todo el año</option>
                    {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                        <option key={i+1} value={i+1}>{m}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      <div className="card mb-24" style={{padding: 0, overflow: 'visible'}}>
        <div className="flex" style={{borderBottom: '1px solid var(--bd)', background: '#f8fafc', overflowX: 'auto', whiteSpace: 'nowrap'}}>
          {tabs.map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-center gap-8`}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                color: activeTab === t.id ? 'var(--acc)' : 'var(--txt2)',
                borderBottom: activeTab === t.id ? '2px solid var(--acc)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{padding: 24}}>
          {activeTab === 'rentabilidad' && <RentabilidadTable data={data?.rentabilidad || []} onShowHistory={setSelectedEvent} />}
          {activeTab === 'historico' && <HistoricoTable data={data?.rentabilidad?.filter(e => e.estado === 'completado') || []} onShowHistory={setSelectedEvent}/>}
          {activeTab === 'finanzas' && <FinanzasTable data={data?.flujo_caja || []} />}
          {activeTab === 'insumos' && <InsumosTable data={data?.consumo || []} />}
        </div>
      </div>

      {selectedEvent && (
        <TraceabilityModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}

function Pagination({ total, pageSize, currentPage, onPageChange }) {
    const totalPages = Math.ceil(total / pageSize)
    if (totalPages <= 1) return null
    return (
        <div className="flex-center gap-16 mt-24" style={{borderTop: '1px solid var(--bd)', paddingTop: 16}}>
            <button className="btn btn-icon btn-outline btn-sm" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}><FiChevronLeft /></button>
            <span style={{fontSize: 12, color: 'var(--txt2)'}}>Página {currentPage + 1} de {totalPages}</span>
            <button className="btn btn-icon btn-outline btn-sm" disabled={currentPage === totalPages - 1} onClick={() => onPageChange(currentPage + 1)}><FiChevronRight /></button>
        </div>
    )
}

function RentabilidadTable({ data, onShowHistory }) {
  const [page, setPage] = useState(0)
  const pageSize = 15
  
  useEffect(() => { setPage(0) }, [data])
  
  const pagedData = useMemo(() => {
    return data.slice(page * pageSize, (page + 1) * pageSize)
  }, [data, page])

  if (data.length === 0) return <div className="empty-state"><FiInfo /> No hay datos para este periodo</div>

  return (
    <div className="table-wrapper" style={{boxShadow: 'none', border: 'none', background: 'transparent'}}>
      <table>
        <thead>
          <tr>
            <th>Evento / Cliente</th>
            <th>Fecha</th>
            <th className="right">Venta (Neto)</th>
            <th className="right">Costo Insumos</th>
            <th className="right">Margen</th>
            <th className="right">Cobrado</th>
            <th className="right">Pendiente</th>
            <th className="center">Traza</th>
          </tr>
        </thead>
        <tbody>
          {pagedData.map(e => (
            <tr key={e.id}>
              <td>
                <div className="bold">{e.nombre}</div>
                <div style={{fontSize: 11, color: 'var(--txt3)'}}><FiUser style={{fontSize: 9}}/> {e.cliente || 'Particular'}</div>
              </td>
              <td style={{fontSize: 12}}>{fmtDate(e.fecha)}</td>
              <td className="right bold">{fmt(e.venta)}</td>
              <td className="right" style={{color: 'var(--txt2)'}}>{fmt(e.costo)}</td>
              <td className="right">
                <div className="bold" style={{color: e.margen >= 30 ? 'var(--grn)' : e.margen >= 15 ? 'var(--amb)' : 'var(--red)'}}>
                    {fmt(e.utilidad)}
                </div>
                <div style={{fontSize: 10, opacity: 0.7}}>{e.margen.toFixed(1)}%</div>
              </td>
              <td className="right" style={{color: 'var(--grn)', fontWeight: 600}}>{fmt(e.pagado)}</td>
              <td className="right" style={{color: e.pendiente > 0 ? 'var(--red)' : 'var(--grn)', fontWeight: 600}}>
                 {e.pendiente > 0 ? fmt(e.pendiente) : 'Pagado'}
              </td>
              <td className="center">
                <button className="btn-icon" title="Ver trazabilidad de cobro" onClick={() => onShowHistory(e)}>
                    <FiClock />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total={data.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </div>
  )
}

function HistoricoTable({ data, onShowHistory }) {
    const [page, setPage] = useState(0)
    const pageSize = 15
    
    useEffect(() => { setPage(0) }, [data])
    
    const pagedData = useMemo(() => {
        return data.slice(page * pageSize, (page + 1) * pageSize)
    }, [data, page])

  if (data.length === 0) return <div className="empty-state"><FiInfo /> No hay eventos realizados en este periodo</div>
  return (
    <div className="table-wrapper" style={{boxShadow: 'none', border: 'none', background: 'transparent'}}>
      <table>
        <thead>
          <tr>
            <th>Evento Realizado</th>
            <th>Fecha</th>
            <th className="center">Pax</th>
            <th className="right">Venta Final</th>
            <th className="right">Costo Final</th>
            <th className="right">Utilidad Neta</th>
            <th className="center">Eficiencia</th>
            <th className="center">Pagos</th>
          </tr>
        </thead>
        <tbody>
          {pagedData.map(e => (
            <tr key={e.id}>
              <td className="bold">{e.nombre}</td>
              <td style={{fontSize: 12}}>{fmtDate(e.fecha)}</td>
              <td className="center bold">{e.pax}</td>
              <td className="right">{fmt(e.venta)}</td>
              <td className="right">{fmt(e.costo)}</td>
              <td className="right bold" style={{color: 'var(--grn)'}}>{fmt(e.utilidad)}</td>
              <td className="center">
                <span className="badge" style={{background: 'var(--acc-light)', color: 'var(--acc)'}}>
                    {(e.venta / (e.pax || 1)).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}/pax
                </span>
              </td>
              <td className="center">
                <button className="btn-icon" onClick={() => onShowHistory(e)}><FiClock /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total={data.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </div>
  )
}

function FinanzasTable({ data }) {
  const totIngresos = data.reduce((s, i) => s + i.ingresos, 0)
  const totGastos = data.reduce((s, i) => s + i.gastos, 0)
  
  return (
    <div className="table-wrapper" style={{boxShadow: 'none', border: 'none', background: 'transparent'}}>
      <div className="responsive-kpi mb-24">
         <div className="kpi-card" style={{background: 'var(--bg)', border: 'none'}}>
            <div className="kpi-label">Ingresos Reales (Pagos Recibidos)</div>
            <div className="kpi-value green">{fmt(totIngresos)}</div>
         </div>
         <div className="kpi-card" style={{background: 'var(--bg)', border: 'none'}}>
            <div className="kpi-label">Gastos Fijos Periodo</div>
            <div className="kpi-value red">{fmt(totGastos)}</div>
         </div>
         <div className="kpi-card" style={{background: 'var(--bg)', border: 'none'}}>
            <div className="kpi-label">Flujo de Caja Neto</div>
            <div className="kpi-value blue">{fmt(totIngresos - totGastos)}</div>
         </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Mes Periodo</th>
            <th className="right">Ingresos (Pagos)</th>
            <th className="right">Gastos Fijos</th>
            <th className="right">Flujo Neto</th>
            <th className="center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map(m => (
            <tr key={m.mes_num}>
              <td className="bold">{m.mes_label}</td>
              <td className="right" style={{color: 'var(--grn)'}}><FiArrowDownLeft /> {fmt(m.ingresos)}</td>
              <td className="right" style={{color: 'var(--red)'}}><FiArrowUpRight /> {fmt(m.gastos)}</td>
              <td className="right bold">{fmt(m.flujo_neto)}</td>
              <td className="center">
                {m.flujo_neto > 0 ? 
                    <span className="badge badge-confirmado">Superávit</span> : 
                    m.flujo_neto < 0 ? <span className="badge badge-cancelado">Déficit</span> : 
                    <span className="badge badge-borrador">Sin Mov.</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InsumosTable({ data }) {
    const [page, setPage] = useState(0)
    const pageSize = 15
    
    useEffect(() => { setPage(0) }, [data])
    
    const pagedData = useMemo(() => {
        return data.slice(page * pageSize, (page + 1) * pageSize)
    }, [data, page])

  if (data.length === 0) return <div className="empty-state"><FiInfo /> No hay consumo registrado</div>
  return (
    <div className="table-wrapper" style={{boxShadow: 'none', border: 'none', background: 'transparent'}}>
      <table>
        <thead>
          <tr>
            <th>Insumo / Producto</th>
            <th className="right">Cantidad Utilizada</th>
            <th className="right">Costo Estimado Acum.</th>
            <th>Tipo de Item</th>
          </tr>
        </thead>
        <tbody>
          {pagedData.map((i, idx) => (
            <tr key={idx}>
              <td className="bold">{i.nombre}</td>
              <td className="right">{i.cantidad.toFixed(2)}</td>
              <td className="right bold">{fmt(i.costo_total)}</td>
              <td>
                <span className={`badge ${i.unidad === 'I' ? 'badge-parcial' : 'badge-borrador'}`}>
                    {i.unidad === 'I' ? 'Ingrediente' : 'Servicio/Insumo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total={data.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </div>
  )
}

function TraceabilityModal({ event, onClose }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{width: 600}}>
                <div className="flex-between mb-24">
                    <div>
                        <h3 style={{margin:0}}>Trazabilidad de Cobros</h3>
                        <p style={{fontSize: 12, color:'var(--txt3)', marginTop: 4}}>{event.nombre} • {fmtDate(event.fecha)}</p>
                    </div>
                    <button className="btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="card mb-24" style={{background: 'var(--bg)', border: 'none'}}>
                    <div className="flex-between mb-8"><span>Total Presupuestado:</span><span className="bold">{fmt(event.venta)}</span></div>
                    <div className="flex-between mb-8"><span>Total Pagado:</span><span className="bold" style={{color: 'var(--grn)'}}>{fmt(event.pagado)}</span></div>
                    <div className="flex-between"><span>Saldo Pendiente:</span><span className="bold" style={{color: event.pendiente > 0 ? 'var(--red)' : 'var(--grn)'}}>{fmt(event.pendiente)}</span></div>
                </div>

                <h4 style={{fontSize: 11, textTransform: 'uppercase', color:'var(--txt3)', marginBottom: 12}}>Historial de Movimientos</h4>
                
                {event.historial_pagos.length === 0 ? (
                    <div className="empty-state" style={{padding: 20}}>
                        <FiInfo /> No se han registrado abonos aún.
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {event.historial_pagos.map(p => (
                            <div key={p.id} className="card" style={{padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div className="flex-center gap-12">
                                    <div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--grn-light)', color: 'var(--grn)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <FiCheckCircle />
                                    </div>
                                    <div>
                                        <div className="bold">{fmt(p.monto)}</div>
                                        <div style={{fontSize: 11, color:'var(--txt3)'}}>{p.metodo}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div style={{fontSize: 12, fontWeight: 500}}>{fmtDate(p.fecha)}</div>
                                    <div style={{fontSize: 10, color:'var(--txt3)'}}>Confirmado</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{marginTop: 32}}>
                    <button className="btn btn-primary" style={{width: '100%'}} onClick={onClose}>Cerrar Panorama</button>
                </div>
            </div>
        </div>
    )
}
