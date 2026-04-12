import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiDollarSign, FiPaperclip, FiTrash2, FiCopy, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi'
import api, { fmt, toInputDate } from '../services/api'
import Paginador from '../components/Paginador'

const CATEGORIAS_GASTOS = [
  { id: 'arriendo', label: 'Arriendo / Bodega' },
  { id: 'sueldos', label: 'Sueldos / Honorarios' },
  { id: 'servicios', label: 'Servicios Públicos' },
  { id: 'insumos_fijos', label: 'Insumos Fijos' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'seguros', label: 'Seguros / Patentes' },
  { id: 'mantenimiento', label: 'Mantenimiento' },
  { id: 'suscripciones', label: 'Suscripciones' },
  { id: 'otro', label: 'Otro' },
]

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedGasto, setSelectedGasto] = useState(null)
  
  const now = new Date()
  const [filtro, setFiltro] = useState({
    mes: now.getMonth() + 1,
    anio: now.getFullYear()
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [form, setForm] = useState({
    nombre: '',
    categoria: 'otro',
    monto: '',
    fecha_vencimiento: now.toISOString().split('T')[0],
    estado: 'pendiente',
    observaciones: '',
    comprobante: null
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/gastos/?mes=${filtro.mes}&anio=${filtro.anio}`)
      // Handle both paginated and non-paginated responses
      setGastos(Array.isArray(res.data) ? res.data : (res.data?.results || []))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    setPage(1)
  }, [filtro])

  const paginated = gastos.slice((page - 1) * pageSize, page * pageSize)

  const handleSave = async () => {
    if (!form.nombre || !form.monto) { alert('Completa los campos obligatorios'); return }
    
    const formData = new FormData()
    formData.append('nombre', form.nombre)
    formData.append('categoria', form.categoria)
    formData.append('monto', form.monto)
    formData.append('fecha_vencimiento', form.fecha_vencimiento)
    formData.append('estado', form.estado)
    formData.append('observaciones', form.observaciones)
    if (form.comprobante instanceof File) {
      formData.append('comprobante', form.comprobante)
    }

    try {
      if (selectedGasto) {
        await api.patch(`/gastos/${selectedGasto.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/gastos/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setShowModal(false)
      load()
    } catch (e) {
      console.error(e)
      alert('Error al guardar el gasto')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    try {
      await api.delete(`/gastos/${id}/`)
      load()
    } catch (e) { console.error(e) }
  }

  const handleClone = async () => {
    if (!window.confirm('Esto copiará todos los gastos del mes pasado que falten en el mes actual. ¿Continuar?')) return
    try {
      const res = await api.post('/gastos/clonar-mes-anterior/')
      alert(`Se han clonado ${res.data.clonados} gastos.`);
      load()
    } catch (e) {
      console.error(e)
      alert('Error al clonar gastos')
    }
  }

  const toggleEstado = async (gasto) => {
    const nuevoEstado = gasto.estado === 'pendiente' ? 'pagado' : 'pendiente'
    try {
      await api.patch(`/gastos/${gasto.id}/`, { estado: nuevoEstado })
      load()
    } catch (e) { console.error(e) }
  }

  const totalPagado = gastos.filter(g => g.estado === 'pagado').reduce((s, g) => s + Number(g.monto), 0)
  const totalPendiente = gastos.filter(g => g.estado === 'pendiente').reduce((s, g) => s + Number(g.monto), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos Fijos y Mensuales</h1>
          <p className="page-subtitle">Gestión de egresos y facturas mensuales</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => api.get(`/exportar/gastos/?mes=${filtro.mes}&anio=${filtro.anio}`, { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = `gastos_${filtro.mes}_${filtro.anio}.xlsx`; a.click()
          })}>
            <FiDownload /> Excel
          </button>
          <button className="btn btn-outline" onClick={handleClone}>
            <FiCopy /> Clonar Mes Anterior
          </button>
          <button className="btn btn-primary" onClick={() => {
            setSelectedGasto(null)
            setForm({
              nombre: '', categoria: 'otro', monto: '',
              fecha_vencimiento: now.toISOString().split('T')[0],
              estado: 'pendiente', observaciones: '', comprobante: null
            })
            setShowModal(true)
          }}>
            <FiPlus /> Nuevo Gasto
          </button>
        </div>
      </div>

      <div className="kpi-grid responsive-kpi">
        <div className="kpi-card green">
          <div className="kpi-label">Total Pagado</div>
          <div className="kpi-value green">{fmt(totalPagado)}</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Pendiente de Pago</div>
          <div className="kpi-value amber">{fmt(totalPendiente)}</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Proyección Total</div>
          <div className="kpi-value blue">{fmt(totalPagado + totalPendiente)}</div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar responsive-toolbar">
          <div className="table-toolbar-left responsive-stack">
            <select className="form-control responsive-select" value={filtro.mes} onChange={e => setFiltro({...filtro, mes: e.target.value})}>
              <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
              <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
              <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
              <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
            </select>
            <select className="form-control responsive-select" value={filtro.anio} onChange={e => setFiltro({...filtro, anio: e.target.value})}>
              {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="loading"><span className="spinner"></span>Cargando...</div> : (
          <table>
            <thead>
              <tr>
                <th>Gasto / Concepto</th>
                <th>Categoría</th>
                <th>Vencimiento</th>
                <th className="right">Monto</th>
                <th className="center">Estado</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="6" className="center">No hay gastos registrados para este periodo</td></tr>
              ) : paginated.map(g => (
                <tr key={g.id}>
                  <td className="bold">{g.nombre}</td>
                  <td>{g.categoria_display}</td>
                  <td>{g.fecha_vencimiento}</td>
                  <td className="right bold">{fmt(g.monto)}</td>
                  <td className="center">
                    <button 
                      className={`badge badge-${g.estado === 'pagado' ? 'aprobado' : 'pendiente'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => toggleEstado(g)}
                    >
                      {g.estado === 'pagado' ? <><FiCheckCircle /> Pagado</> : <><FiClock /> Pendiente</>}
                    </button>
                  </td>
                  <td className="center">
                    <div className="flex gap-8 justify-center">
                      {g.comprobante && (
                        <a href={g.comprobante} target="_blank" rel="noreferrer" className="btn-icon" title="Ver comprobante">
                          <FiPaperclip />
                        </a>
                      )}
                      <button className="btn-icon" onClick={() => {
                        setSelectedGasto(g)
                        setForm({
                          nombre: g.nombre, categoria: g.categoria, monto: g.monto,
                          fecha_vencimiento: toInputDate(g.fecha_vencimiento),
                          estado: g.estado, observaciones: g.observaciones, comprobante: null
                        })
                        setShowModal(true)
                      }}><FiDollarSign /></button>
                      <button className="btn-icon text-red" onClick={() => handleDelete(g.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Paginador total={gastos.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="card-header"><h3 className="card-title">{selectedGasto ? 'Editar Gasto' : 'Nuevo Gasto Fijo'}</h3></div>
            <div className="card-body grid-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Nombre / Concepto</label>
                <input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Arriendo Oficina" />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                  {CATEGORIAS_GASTOS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monto</label>
                <input type="number" className="form-control" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Fecha Vencimiento</label>
                <input type="date" className="form-control" value={form.fecha_vencimiento} onChange={e => setForm({...form, fecha_vencimiento: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Comprobante de Pago (Opcional)</label>
                <input type="file" className="form-control" onChange={e => setForm({...form, comprobante: e.target.files[0]})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Observaciones</label>
                <textarea className="form-control" rows="2" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})}></textarea>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar Gasto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
