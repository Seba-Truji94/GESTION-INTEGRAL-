import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiDownload, FiEye, FiPrinter } from 'react-icons/fi'
import api, { fmt } from '../services/api'

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      let url = '/presupuestos/?page_size=200'
      if (filtroEstado) url += `&estado=${filtroEstado}`
      if (search) url += `&search=${search}`
      const res = await api.get(url)
      setPresupuestos(res.data.results || res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [filtroEstado, search])

  const totalPresupuestado = presupuestos.reduce((s, p) => s + Number(p.total || 0), 0)
  const totalCosto = presupuestos.reduce((s, p) => s + Number(p.costo_total || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Presupuestos</h1>
          <p className="page-subtitle">Todos los presupuestos generados</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => api.get('/exportar/presupuestos/', { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'presupuestos.xlsx'; a.click()
          })}><FiDownload /> Excel</button>
          <button className="btn btn-primary" onClick={() => navigate('/presupuestos/nuevo')}>
            <FiPlus /> Nuevo Presupuesto
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-label">Total Presupuestos</div><div className="kpi-value">{presupuestos.length}</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Total Presupuestado</div><div className="kpi-value blue">{fmt(totalPresupuestado)}</div></div>
        <div className="kpi-card amber"><div className="kpi-label">Total Costos</div><div className="kpi-value amber">{fmt(totalCosto)}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Utilidad Total</div><div className="kpi-value green">{fmt(totalPresupuestado - totalCosto)}</div></div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar presupuestos..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 160 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviado">Enviado</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        {loading ? <div className="loading"><span className="spinner"></span>Cargando...</div> : (
          <table>
            <thead>
              <tr>
                <th>N° Presupuesto</th>
                <th>Evento</th>
                <th>Cliente</th>
                <th className="right">Costo</th>
                <th className="right">Total Venta</th>
                <th className="right">Margen</th>
                <th>Forma de Pago</th>
                <th className="center">Estado</th>
                <th>Fecha</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.length === 0 ? (
                <tr><td colSpan="10"><div className="empty-state"><p>No hay presupuestos</p></div></td></tr>
              ) : presupuestos.map(p => {
                const util = Number(p.total || 0) - Number(p.costo_total || 0)
                const margen = Number(p.total) > 0 ? (util / Number(p.total) * 100) : 0
                return (
                  <tr key={p.id}>
                    <td className="bold font-mono">{p.numero}</td>
                    <td style={{ cursor: 'pointer', color: 'var(--acc)' }} onClick={() => navigate(`/eventos/${p.evento}`)}>{p.evento_nombre}</td>
                    <td>{p.evento_cliente}</td>
                    <td className="right">{fmt(p.costo_total)}</td>
                    <td className="right bold">{fmt(p.total)}</td>
                    <td className="right" style={{ color: margen >= 30 ? 'var(--grn)' : margen >= 15 ? 'var(--amb)' : 'var(--red)', fontWeight: 600 }}>{margen.toFixed(1)}%</td>
                    <td style={{ fontSize: 12 }}>{p.forma_pago_display}</td>
                    <td className="center"><span className={`badge badge-${p.estado}`}>{p.estado_display}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{p.created_at}</td>
                    <td className="center" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button className="btn-icon" onClick={() => navigate(`/eventos/${p.evento}`)} title="Ver evento"><FiEye /></button>
                      <button className="btn-icon" onClick={() => navigate(`/presupuestos/${p.id}/editar`)} title="Editar"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                      <button className="btn-icon" onClick={() => navigate(`/presupuestos/${p.id}/imprimir`)} title="Imprimir / Compartir"><FiPrinter /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
