import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FiDownload, FiCalendar, FiAlertTriangle, FiDollarSign, FiUser, FiPackage } from 'react-icons/fi'
import api, { fmt, downloadFile } from '../services/api'

const PIE_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/dashboard/?anio=${anio}`)
      setData(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [anio])

  if (loading || !data) return <div className="loading"><span className="spinner"></span>Cargando dashboard...</div>

  const isMobile = window.innerWidth < 768

  const eventosEstadoData = Object.entries(data.eventos_por_estado)
    .filter(([,v]) => v.count > 0)
    .map(([k, v]) => ({ name: v.label, value: v.count }))

  const cobrosEstadoData = Object.entries(data.cobros_por_estado)
    .filter(([,v]) => v.count > 0)
    .map(([k, v]) => ({ name: v.label, value: v.count }))

  const recaudacionPct = data.total_cobrado > 0 ? (data.total_pagado / data.total_cobrado * 100) : 0

  return (
    <div>
      <div className="page-header responsive-stack">
        <div className="w-full-mobile">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de gestión — {anio}</p>
        </div>
        <div className="flex gap-8 responsive-stack w-full-mobile">
          <select className="form-control responsive-select" value={anio} onChange={e => setAnio(e.target.value)}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-outline w-full-mobile" onClick={() => downloadFile(`/exportar/dashboard/?anio=${anio}`, `dashboard_${anio}.xlsx`)}>
            <FiDownload /> Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid responsive-kpi">
        <div className="kpi-card blue">
          <div className="kpi-label">Ventas Totales</div>
          <div className="kpi-value blue">{fmt(data.ventas_totales)}</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Costos Totales</div>
          <div className="kpi-value amber">{fmt(data.costos_totales)}</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Utilidad Neta</div>
          <div className="kpi-value green">{fmt(data.utilidad)}</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Margen Promedio</div>
          <div className="kpi-value" style={{ color: 'var(--pur)' }}>{data.margen_promedio}%</div>
        </div>
        <div className="kpi-card" style={{ border: '1px solid var(--red)' }}>
          <div className="kpi-label">Gastos Fijos Registrados</div>
          <div className="kpi-value red">{fmt(data.total_gastos)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Eventos</div>
          <div className="kpi-value">{data.total_eventos}</div>
        </div>
      </div>

      {/* Recaudación Bar */}
      <div className="card mb-24">
        <div className="flex-between mb-16">
          <div>
            <div className="card-title">Recaudación vs Presupuestado</div>
            <div style={{ fontSize: 13, color: 'var(--txt2)' }}>
              Pagado: <strong style={{ color: 'var(--grn)' }}>{fmt(data.total_pagado)}</strong> de {fmt(data.total_cobrado)}
              &nbsp;—&nbsp; Pendiente: <strong style={{ color: 'var(--red)' }}>{fmt(data.total_pendiente)}</strong>
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: recaudacionPct > 70 ? 'var(--grn)' : 'var(--amb)' }}>
            {recaudacionPct.toFixed(0)}%
          </span>
        </div>
        <div className="margin-bar-wrap" style={{ height: 14 }}>
          <div className={`margin-bar-fill ${recaudacionPct > 70 ? '' : recaudacionPct > 40 ? 'amber' : 'red'}`}
               style={{ width: `${Math.min(recaudacionPct, 100)}%`, height: 14 }}></div>
        </div>
        <div className="stat-panel" style={{ marginTop: 16 }}>
          {cobrosEstadoData.map((d, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-num" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{d.value}</div>
              <div className="stat-label">{d.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <h4>📊 Ventas vs Costos vs Utilidad por Mes</h4>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <BarChart data={data.ventas_por_mes.filter(m => m.ventas > 0 || m.costos > 0)}
                      margin={{ top: 4, right: 4, left: isMobile ? -20 : 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" tick={{ fontSize: isMobile ? 9 : 11 }}
                     tickFormatter={v => isMobile ? v.slice(0, 3) : v} />
              <YAxis tick={{ fontSize: isMobile ? 9 : 11 }}
                     tickFormatter={v => `$${(v/1000000).toFixed(1)}M`}
                     width={isMobile ? 44 : 60} />
              <Tooltip formatter={v => fmt(v)} />
              {!isMobile && <Legend />}
              <Bar dataKey="ventas" name="Ventas" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="costos" name="Costos" fill="#d97706" radius={[4,4,0,0]} />
              <Bar dataKey="utilidad" name="Utilidad" fill="#059669" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>📈 Eventos por Estado</h4>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <PieChart>
              <Pie data={eventosEstadoData} cx="50%" cy="50%"
                   outerRadius={isMobile ? 70 : 100}
                   dataKey="value"
                   label={isMobile
                     ? ({ value }) => value
                     : ({ name, value }) => `${name}: ${value}`}
                   labelLine={!isMobile}>
                {eventosEstadoData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              {isMobile && <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="chart-grid">
        <div className="card">
          <div className="card-title"><FiCalendar style={{ marginRight: 6 }} /> Próximos Eventos</div>
          {data.proximos_eventos.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>No hay eventos próximos</p></div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Pax</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.proximos_eventos.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.nombre}</strong><br/><span style={{fontSize:11,color:'var(--txt3)'}}>{e.cliente}</span></td>
                    <td>{e.fecha}</td>
                    <td>{e.pax}</td>
                    <td><span className={`badge badge-${e.estado?.toLowerCase().replace(/ /g,'_')}`}>{e.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        <div className="card">
          <div className="card-title"><FiAlertTriangle style={{ marginRight: 6, color: 'var(--amb)' }} /> Alertas de Stock Bajo</div>
          {data.stock_bajo.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>Todo el inventario OK</p></div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Producto</th><th className="right">Stock</th><th className="right">Mínimo</th></tr>
              </thead>
              <tbody>
                {data.stock_bajo.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td className="right" style={{ color: 'var(--red)', fontWeight: 600 }}>{p.stock_actual} {p.unidad}</td>
                    <td className="right">{p.stock_minimo} {p.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* New Metrics Panel */}
      <div className="chart-grid pb-24" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-title"><FiDollarSign style={{ marginRight: 6, color: 'var(--red)' }} /> Cobros Pendientes (Prioridad)</div>
          {data.cobros_pendientes?.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>No hay cobros pendientes</p></div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente / Evento</th>
                  <th>Vencimiento</th>
                  <th className="right">Monto Total</th>
                  <th className="right">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {data.cobros_pendientes?.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.cliente}</strong><br/><span style={{fontSize:11,color:'var(--txt3)'}}>{c.evento}</span></td>
                    <td><span className={c.vencimiento !== 'Sin fecha' ? 'badge badge-cancelado' : ''}>{c.vencimiento}</span></td>
                    <td className="right">{fmt(c.monto_total)}</td>
                    <td className="right" style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(c.pendiente)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        <div className="card">
          <div className="card-title"><FiUser style={{ marginRight: 6, color: 'var(--blue)' }} /> Top Clientes por Ventas</div>
          {data.top_clientes?.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>No hay eventos registrados</p></div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th className="center">Eventos</th>
                  <th className="right">Total Comprado</th>
                </tr>
              </thead>
              <tbody>
                {data.top_clientes?.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                    <td className="center">{c.eventos}</td>
                    <td className="right bold green">{fmt(c.total_comprado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      <div className="card mb-24">
         <div className="card-title"><FiPackage style={{ marginRight: 6, color: 'var(--amb)' }} /> Top Insumos por Valor Total Utilizado</div>
         {data.top_insumos?.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>No hay consumo registrado</p></div>
          ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Producto / Insumo</th>
                  <th className="right">Cantidad Utilizada</th>
                  <th className="right">Costo Acumulado Estimado</th>
                </tr>
              </thead>
              <tbody>
                {data.top_insumos?.map((i, idx) => (
                  <tr key={idx}>
                    <td className="center bold" style={{color: 'var(--txt3)'}}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{i.nombre}</td>
                    <td className="right">{i.cantidad.toFixed(2)}</td>
                    <td className="right bold" style={{ color: 'var(--amb)' }}>{fmt(i.valor_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
      </div>
    </div>
  )
}
