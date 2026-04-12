import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiDownload, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi'
import api, { fmt } from '../services/api'
import Paginador from '../components/Paginador'

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [tab, setTab] = useState('productos') // productos | movimientos
  const [pageP, setPageP] = useState(1)
  const [pageSizeP, setPageSizeP] = useState(10)
  const [pageM, setPageM] = useState(1)
  const [pageSizeM, setPageSizeM] = useState(10)
  const [showModal, setShowModal] = useState(false)
  const [showMovModal, setShowMovModal] = useState(false)
  const [editProd, setEditProd] = useState(null)
  const [form, setForm] = useState({ nombre: '', categoria: 'ingrediente', unidad: 'un', stock_actual: 0, stock_minimo: 0, precio_compra: 0, precio_venta: 0, proveedor: '' })
  const [movForm, setMovForm] = useState({ producto: '', tipo: 'entrada', cantidad: 0, motivo: '', referencia_evento: '' })

  const load = async () => {
    setLoading(true)
    try {
      let url = '/productos/?page_size=200'
      if (search) url += `&search=${search}`
      if (filtroCat) url += `&categoria=${filtroCat}`
      const [prodRes, movRes] = await Promise.all([api.get(url), api.get('/movimientos/?page_size=100')])
      setProductos(prodRes.data.results || prodRes.data)
      setMovimientos(movRes.data.results || movRes.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [search, filtroCat])
  useEffect(() => { setPageP(1) }, [search, filtroCat])

  const paginatedProductos = productos.slice((pageP - 1) * pageSizeP, pageP * pageSizeP)
  const paginatedMovimientos = movimientos.slice((pageM - 1) * pageSizeM, pageM * pageSizeM)

  const handleSave = async () => {
    try {
      if (editProd) { await api.put(`/productos/${editProd.id}/`, form) }
      else { await api.post('/productos/', form) }
      setShowModal(false); setEditProd(null); load()
    } catch (e) { alert('Error al guardar') }
  }

  const handleEdit = (p) => {
    setEditProd(p); setForm({ nombre: p.nombre, categoria: p.categoria, unidad: p.unidad, stock_actual: p.stock_actual, stock_minimo: p.stock_minimo, precio_compra: p.precio_compra, precio_venta: p.precio_venta, proveedor: p.proveedor })
    setShowModal(true)
  }

  const handleDelete = async (id) => { if (confirm('¿Eliminar producto?')) { await api.delete(`/productos/${id}/`); load() } }

  const handleMov = async () => {
    if (!movForm.producto || !movForm.cantidad) { alert('Completa los campos'); return }
    await api.post('/movimientos/', movForm)
    setShowMovModal(false); load()
  }

  const totalProductos = productos.length
  const stockBajo = productos.filter(p => p.stock_bajo).length
  const valorTotal = productos.reduce((s, p) => s + Number(p.valor_inventario || 0), 0)
  const categorias = [...new Set(productos.map(p => p.categoria))].length

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Inventario</h1><p className="page-subtitle">Gestión de productos, stock y movimientos</p></div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => api.get('/exportar/stock/', { responseType: 'blob' }).then(r => {
            const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'inventario.xlsx'; a.click()
          })}><FiDownload /> Excel</button>
          <button className="btn btn-outline" onClick={() => { setMovForm({ producto: '', tipo: 'entrada', cantidad: 0, motivo: '', referencia_evento: '' }); setShowMovModal(true) }}>
            <FiRefreshCw /> Movimiento
          </button>
          <button className="btn btn-primary" onClick={() => { setEditProd(null); setForm({ nombre: '', categoria: 'ingrediente', unidad: 'un', stock_actual: 0, stock_minimo: 0, precio_compra: 0, precio_venta: 0, proveedor: '' }); setShowModal(true) }}>
            <FiPlus /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="kpi-grid responsive-kpi">
        <div className="kpi-card"><div className="kpi-label">Total Productos</div><div className="kpi-value">{totalProductos}</div></div>
        <div className="kpi-card red"><div className="kpi-label">Stock Bajo</div><div className="kpi-value red">{stockBajo}</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Valor Inventario</div><div className="kpi-value blue">{fmt(valorTotal)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Categorías</div><div className="kpi-value">{categorias}</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-24">
        <button className={`btn ${tab === 'productos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('productos')}>Productos</button>
        <button className={`btn ${tab === 'movimientos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('movimientos')}>Movimientos</button>
      </div>

      {tab === 'productos' ? (
        <div className="table-wrapper">
          <div className="table-toolbar responsive-toolbar">
            <div className="table-toolbar-left responsive-stack">
              <div className="search-wrap"><FiSearch className="search-icon" />
                <input className="search-input" placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} /></div>
              <select className="form-control responsive-select" value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
                <option value="">Todas las categorías</option>
                <option value="ingrediente">Ingrediente</option><option value="insumo">Insumo</option>
                <option value="descartable">Descartable</option><option value="bebida">Bebida</option>
                <option value="equipamiento">Equipamiento</option><option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {loading ? <div className="loading"><span className="spinner"></span>Cargando...</div> : (
            <>
            <table>
              <thead><tr>
                <th>Producto</th><th>Categoría</th><th>Unidad</th><th className="right">Stock</th>
                <th className="right">Mínimo</th><th className="right">P. Compra</th><th className="right">P. Venta</th>
                <th className="right">Margen%</th><th>Proveedor</th><th className="center">Estado</th><th className="center">Acciones</th>
              </tr></thead>
              <tbody>
                {paginatedProductos.length === 0 ? (
                  <tr><td colSpan="11"><div className="empty-state"><p>No hay productos</p></div></td></tr>
                ) : paginatedProductos.map(p => (
                  <tr key={p.id}>
                    <td className="bold">{p.nombre}</td>
                    <td>{p.categoria_display}</td>
                    <td>{p.unidad_display}</td>
                    <td className="right bold" style={{color: p.stock_bajo ? 'var(--red)' : 'var(--txt)'}}>{Number(p.stock_actual)}</td>
                    <td className="right" style={{color:'var(--txt3)'}}>{Number(p.stock_minimo)}</td>
                    <td className="right">{fmt(p.precio_compra)}</td>
                    <td className="right bold">{fmt(p.precio_venta)}</td>
                    <td className="right" style={{color: p.margen >= 30 ? 'var(--grn)' : 'var(--amb)', fontWeight:600}}>{p.margen?.toFixed(1)}%</td>
                    <td style={{fontSize:12,color:'var(--txt2)'}}>{p.proveedor || '-'}</td>
                    <td className="center">
                      {p.stock_bajo ? <span className="badge badge-red">⚠ Bajo</span> : <span className="badge badge-green">OK</span>}
                    </td>
                    <td className="center">
                      <div className="flex gap-8" style={{justifyContent:'center'}}>
                        <button className="btn-icon" onClick={() => handleEdit(p)}><FiEdit2 /></button>
                        <button className="btn-icon" onClick={() => handleDelete(p.id)} style={{color:'var(--red)'}}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginador total={productos.length} page={pageP} pageSize={pageSizeP} onPage={setPageP} onPageSize={setPageSizeP} />
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Producto</th><th>Tipo</th><th className="right">Cantidad</th><th className="right">Stock Anterior</th><th className="right">Stock Nuevo</th><th>Motivo</th><th>Fecha</th><th>Usuario</th></tr></thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr><td colSpan="8"><div className="empty-state"><p>No hay movimientos registrados</p></div></td></tr>
              ) : paginatedMovimientos.map(m => (
                <tr key={m.id}>
                  <td className="bold">{m.producto_nombre}</td>
                  <td>
                    <span className={`badge ${m.tipo === 'entrada' ? 'badge-green' : m.tipo === 'salida' ? 'badge-red' : 'badge-amber'}`}>
                      {m.tipo === 'entrada' ? <><FiArrowDown style={{marginRight:4}}/></> : m.tipo === 'salida' ? <><FiArrowUp style={{marginRight:4}}/></> : <><FiRefreshCw style={{marginRight:4}}/></>}
                      {m.tipo_display}
                    </span>
                  </td>
                  <td className="right bold">{Number(m.cantidad)}</td>
                  <td className="right">{Number(m.stock_anterior)}</td>
                  <td className="right bold">{Number(m.stock_nuevo)}</td>
                  <td style={{fontSize:12}}>{m.motivo || '-'}</td>
                  <td style={{fontSize:12, color:'var(--txt3)'}}>{new Date(m.fecha).toLocaleString('es-CL')}</td>
                  <td style={{fontSize:12}}>{m.usuario_nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginador total={movimientos.length} page={pageM} pageSize={pageSizeM} onPage={setPageM} onPageSize={setPageSizeM} />
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <h3>{editProd ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="form-group"><label>Categoría</label>
                <select className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                  <option value="ingrediente">Ingrediente</option><option value="insumo">Insumo</option>
                  <option value="descartable">Descartable</option><option value="bebida">Bebida</option>
                  <option value="equipamiento">Equipamiento</option><option value="otro">Otro</option>
                </select></div>
              <div className="form-group"><label>Unidad</label>
                <select className="form-control" value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})}>
                  <option value="kg">Kilogramo</option><option value="lt">Litro</option><option value="un">Unidad</option>
                  <option value="docena">Docena</option><option value="caja">Caja</option><option value="bolsa">Bolsa</option>
                  <option value="bandeja">Bandeja</option><option value="paquete">Paquete</option>
                </select></div>
              <div className="form-group"><label>Stock Actual</label><input type="number" className="form-control" value={form.stock_actual} onChange={e => setForm({...form, stock_actual: parseFloat(e.target.value)||0})} /></div>
              <div className="form-group"><label>Stock Mínimo</label><input type="number" className="form-control" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: parseFloat(e.target.value)||0})} /></div>
              <div className="form-group"><label>Precio Compra (CLP)</label><input type="number" className="form-control" value={form.precio_compra} onChange={e => setForm({...form, precio_compra: parseFloat(e.target.value)||0})} /></div>
              <div className="form-group"><label>Precio Venta (CLP)</label><input type="number" className="form-control" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: parseFloat(e.target.value)||0})} /></div>
              <div className="form-group"><label>Proveedor</label><input className="form-control" value={form.proveedor} onChange={e => setForm({...form, proveedor: e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>{editProd ? 'Guardar Cambios' : 'Crear Producto'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMovModal(false)}>
          <div className="modal">
            <h3>Registrar Movimiento de Stock</h3>
            <div className="form-group"><label>Producto</label>
              <select className="form-control" value={movForm.producto} onChange={e => setMovForm({...movForm, producto: e.target.value})}>
                <option value="">-- Seleccionar --</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {Number(p.stock_actual)} {p.unidad})</option>)}
              </select></div>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label>Tipo</label>
                <select className="form-control" value={movForm.tipo} onChange={e => setMovForm({...movForm, tipo: e.target.value})}>
                  <option value="entrada">Entrada</option><option value="salida">Salida</option><option value="ajuste">Ajuste</option>
                </select></div>
              <div className="form-group"><label>Cantidad</label>
                <input type="number" className="form-control" value={movForm.cantidad} onChange={e => setMovForm({...movForm, cantidad: parseFloat(e.target.value)||0})} /></div>
            </div>
            <div className="form-group"><label>Motivo</label><input className="form-control" value={movForm.motivo} onChange={e => setMovForm({...movForm, motivo: e.target.value})} placeholder="Razón del movimiento" /></div>
            <div className="form-group"><label>Evento Relacionado (opcional)</label><input className="form-control" value={movForm.referencia_evento} onChange={e => setMovForm({...movForm, referencia_evento: e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowMovModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleMov}>Registrar Movimiento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
