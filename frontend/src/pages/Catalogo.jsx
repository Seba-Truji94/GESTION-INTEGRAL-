import { useState, useEffect, useMemo } from 'react'
import {
  FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiSearch, FiFilter,
  FiBriefcase, FiPercent, FiTrendingUp, FiShoppingBag, FiInfo, FiLayers
} from 'react-icons/fi'
import api, { fmt } from '../services/api'
import Paginador from '../components/Paginador'

export default function Catalogo() {
  const [items, setItems] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [form, setForm] = useState({ 
    nombre: '', descripcion: '', categoria: 'otro', precio_venta: 0, ingredientes: [], imagen: null 
  })

  useEffect(() => {
    load()
    api.get('/productos/?page_size=1000').then(r => setProductos(r.data.results || r.data))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/catalogo/productos/')
      setItems(Array.isArray(res.data) ? res.data : (res.data?.results || []))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Derived Values & KPIs
  const filtered = useMemo(() => {
    return items.filter(it => {
      const matchesSearch = it.nombre.toLowerCase().includes(search.toLowerCase()) ||
                          it.descripcion.toLowerCase().includes(search.toLowerCase())
      const matchesCat = catFilter === 'all' || it.categoria === catFilter
      return matchesSearch && matchesCat
    })
  }, [items, search, catFilter])

  useEffect(() => { setPage(1) }, [search, catFilter])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const kpis = useMemo(() => {
    const total = items.length
    const avgMargin = total > 0 ? items.reduce((s, i) => s + i.margen_estimado, 0) / total : 0
    const mostProfitable = items.length > 0 ? [...items].sort((a, b) => b.margen_estimado - a.margen_estimado)[0]?.nombre : '-'
    const totalSalesValue = items.reduce((s, i) => s + (Number(i.precio_venta) || 0), 0)
    return { total, avgMargin, mostProfitable, totalSalesValue }
  }, [items])

  const handleOpen = (item = null) => {
    if (item) {
      setEditing(item.id)
      setForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        precio_venta: item.precio_venta,
        ingredientes: item.ingredientes.map(i => ({ producto: i.producto, cantidad: i.cantidad })),
        imagen: null
      })
    } else {
      setEditing(null)
      setForm({ nombre: '', descripcion: '', categoria: 'otro', precio_venta: 0, ingredientes: [], imagen: null })
    }
    setShowModal(true)
  }

  const addIngredient = () => {
    setForm({ ...form, ingredientes: [...form.ingredientes, { producto: '', cantidad: 0 }] })
  }

  const removeIngredient = (idx) => {
    const next = [...form.ingredientes]
    next.splice(idx, 1)
    setForm({ ...form, ingredientes: next })
  }

  const updateIngredient = (idx, field, val) => {
    const next = [...form.ingredientes]
    next[idx][field] = val
    setForm({ ...form, ingredientes: next })
  }

  // Real-time cost calculation for the form
  const currentCost = useMemo(() => {
    return form.ingredientes.reduce((total, item) => {
      const prod = productos.find(p => String(p.id) === String(item.producto))
      if (prod) return total + (Number(prod.precio_compra) * Number(item.cantidad))
      return total
    }, 0)
  }, [form.ingredientes, productos])

  const currentMargin = form.precio_venta > 0 ? ((form.precio_venta - currentCost) / form.precio_venta * 100) : 0

  const handleSave = async () => {
    if (!form.nombre) return alert('El nombre es obligatorio')
    try {
      let savedItem = null
      if (editing) {
        const res = await api.put(`/catalogo/productos/${editing}/`, form)
        savedItem = res.data
      } else {
        const res = await api.post('/catalogo/productos/', form)
        savedItem = res.data
      }

      // Upload image if present
      if (form.imagen && savedItem) {
        const formData = new FormData()
        formData.append('imagen', form.imagen)
        await api.patch(`/catalogo/productos/${savedItem.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setShowModal(false)
      load()
    } catch (e) { 
      console.error(e)
      alert('Error al guardar el producto. Verifique los datos.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return
    try {
      await api.delete(`/catalogo/productos/${id}/`)
      load()
    } catch (e) { console.error(e) }
  }

  const catColors = {
    reposteria: '#ec4899', // pink
    banqueteria: '#8b5cf6', // purple
    cocteleria: '#f59e0b', // amber
    bebidas: '#3b82f6', // blue
    otro: '#64748b' // slate
  }

  if (loading) return <div className="loading"><span className="spinner"></span>Cargando Catálogo Maestro...</div>

  return (
    <div className="catalogo-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo Maestro y Recetas</h1>
          <p className="page-subtitle">Gestión centralizada de productos terminados y sus escandallos de costos</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpen()}>
          <FiPlus /> Nuevo Producto
        </button>
      </div>

      {/* KPI Dashboard */}
      <div className="responsive-kpi mb-24">
        <div className="kpi-card blue">
          <div className="kpi-label">Productos Activos</div>
          <div className="kpi-value blue">{kpis.total}</div>
          <div className="kpi-change"><FiBriefcase /> Catálogo Comercial</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Margen Promedio</div>
          <div className="kpi-value green">{kpis.avgMargin.toFixed(1)}%</div>
          <div className="kpi-change"><FiTrendingUp /> Rentabilidad Proyectada</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Más Rentable</div>
          <div className="kpi-value amber" style={{fontSize: 14, marginTop: 8}}>{kpis.mostProfitable}</div>
          <div className="kpi-change"><FiPercent /> Mejor Margen</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Valor Promedio Venta</div>
          <div className="kpi-value purple">{fmt(kpis.totalSalesValue / (kpis.total || 1))}</div>
          <div className="kpi-change"><FiShoppingBag /> Ticket Sugerido</div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar por nombre o descripción..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-center gap-8">
              <FiFilter style={{color:'var(--txt3)'}} />
              <select className="form-control" style={{width: 180}} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">Todas las categorías</option>
                <option value="reposteria">Repostería</option>
                <option value="banqueteria">Banquetería</option>
                <option value="cocteleria">Coctelería</option>
                <option value="bebidas">Bebidas</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div className="table-toolbar-right">
            <span style={{fontSize: 12, color:'var(--txt3)'}}>Mostrando {filtered.length} ítems</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto terminardo</th>
              <th>Categoría</th>
              <th className="right">Costo Insumos</th>
              <th className="right">Precio Sugerido</th>
              <th className="right">Margen</th>
              <th className="center">Gestión</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
                <tr>
                    <td colSpan={6}>
                        <div className="empty-state">
                            <FiShoppingBag className="empty-icon" />
                            <p>No se encontraron productos en el catálogo</p>
                        </div>
                    </td>
                </tr>
            ) : paginated.map(it => (
              <tr key={it.id}>
                <td>
                    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                        {it.imagen ? (
                            <img src={it.imagen} alt={it.nombre} style={{width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#f1f5f9'}} />
                        ) : (
                            <div style={{width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)'}}>
                                <FiShoppingBag />
                            </div>
                        )}
                        <div>
                            <div className="bold" style={{fontSize: 14}}>{it.nombre}</div>
                            <div style={{fontSize: 11, color:'var(--txt3)', marginTop: 2}}>{it.descripcion || 'Sin descripción'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span className="badge" style={{background: `${catColors[it.categoria]}15`, color: catColors[it.categoria], border: `1px solid ${catColors[it.categoria]}30`}}>
                        {it.categoria.charAt(0).toUpperCase() + it.categoria.slice(1)}
                    </span>
                </td>
                <td className="right" style={{color: 'var(--txt2)'}}>{fmt(it.costo_base)}</td>
                <td className="right bold" style={{color:'var(--acc)', fontSize: 14}}>{fmt(it.precio_venta)}</td>
                <td className="right">
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span style={{fontWeight: 800, color: it.margen_estimado >= 30 ? 'var(--grn)' : it.margen_estimado >= 15 ? 'var(--amb)' : 'var(--red)'}}>
                            {it.margen_estimado.toFixed(1)}%
                        </span>
                        <div className="margin-bar-wrap" style={{width: 60, height: 4, marginTop: 4}}>
                            <div className="margin-bar-fill" style={{
                                width: `${Math.min(Math.max(it.margen_estimado, 0), 100)}%`, 
                                height: 4,
                                background: it.margen_estimado >= 30 ? 'var(--grn)' : it.margen_estimado >= 15 ? 'var(--amb)' : 'var(--red)'
                            }}></div>
                        </div>
                    </div>
                </td>
                <td className="center">
                  <div className="flex-center gap-8 justify-center">
                    <button className="btn-icon" title="Editar receta" onClick={() => handleOpen(it)}><FiEdit2 /></button>
                    <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(it.id)} style={{color:'var(--red)'}}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginador total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {showModal && (
        <div className="modal-overlay">
        <div className="modal modal-lg" style={{padding: 0, overflow: 'hidden'}}>
            <div style={{background: 'linear-gradient(to right, var(--nav), var(--nav2))', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h2 style={{margin:0, fontSize: 20}}>{editing ? 'Editor de Producto Maestro' : 'Nuevo Producto en Catálogo'}</h2>
                <p style={{fontSize: 12, opacity: 0.8, marginTop: 4}}>Configura los costos y el precio final de venta</p>
              </div>
              <button className="btn-icon" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff'}} onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            
            <div className="form-grid form-grid-2" style={{ height: 'calc(88vh - 120px)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', overflowY: 'auto' }}>
                {/* General Info Side */}
                <div style={{padding: 32, borderRight: '1px solid var(--bd)'}}>
                    <h3 style={{fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24}}>
                        <FiInfo /> Datos Generales
                    </h3>
                    
                    <div className="form-group"><label>Nombre del Producto Comercial</label>
                        <input className="form-control" placeholder="Ej: Torta Pompadour 20 personas" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
                    
                    <div className="form-group"><label>Categoría</label>
                        <select className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                        <option value="reposteria">Repostería</option>
                        <option value="banqueteria">Banquetería</option>
                        <option value="cocteleria">Coctelería</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="otro">Otro</option>
                        </select></div>
                    
                    <div className="form-group"><label>Descripción / Notas de producción</label>
                        <textarea className="form-control" rows={4} placeholder="Detalles de preparación, empaque, etc." value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} /></div>
                    
                    <div className="form-group">
                        <label>Imagen del Producto</label>
                        <input type="file" className="form-control" accept="image/*" onChange={e => setForm({...form, imagen: e.target.files[0]})} />
                        {editing && items.find(i => i.id === editing)?.imagen && !form.imagen && (
                            <div style={{marginTop: 8, fontSize: 11, color: 'var(--txt3)'}}>
                                Imagen actual: <a href={items.find(i => i.id === editing).imagen} target="_blank" rel="noreferrer">Ver</a>
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group" style={{marginTop: 32}}>
                        <label>Precio de Venta Final ($)</label>
                        <input type="number" className="form-control" style={{fontSize: 18, fontWeight: 700, color: 'var(--acc)'}} value={form.precio_venta} onChange={e => setForm({...form, precio_venta: Number(e.target.value)})} />
                        <div style={{fontSize: 11, color:'var(--txt3)', marginTop: 4}}>Este es el precio que se mostrará en los presupuestos.</div>
                    </div>

                    {/* Financial Summary card in modal */}
                    <div className="card" style={{marginTop: 32, background: 'var(--bg)', border: 'none'}}>
                        <div className="flex-between mb-8"><span>Costo Materiales:</span><span className="bold">{fmt(currentCost)}</span></div>
                        <div className="flex-between mb-8"><span>Precio Venta:</span><span className="bold" style={{color: 'var(--acc)'}}>{fmt(form.precio_venta)}</span></div>
                        <div className="flex-between mb-16"><span>Utilidad:</span><span className="bold" style={{color: 'var(--grn)'}}>{fmt(form.precio_venta - currentCost)}</span></div>
                        <div className="margin-bar-wrap" style={{height: 6}}>
                            <div className="margin-bar-fill" style={{
                                width: `${Math.min(Math.max(currentMargin, 0), 100)}%`, height: 6,
                                background: currentMargin >= 30 ? 'var(--grn)' : currentMargin >= 15 ? 'var(--amb)' : 'var(--red)'
                            }}></div>
                        </div>
                        <div className="flex-between" style={{marginTop: 8}}>
                            <span style={{fontSize: 11, color: 'var(--txt3)'}}>Margen estimado:</span>
                            <span style={{fontWeight: 700, color: currentMargin >= 30 ? 'var(--grn)' : currentMargin >= 15 ? 'var(--amb)' : 'var(--red)'}}>
                                {currentMargin.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recipe Side */}
                <div style={{padding: 32, background: '#f8fafc', overflowY: 'auto'}}>
                    <div className="flex-between mb-24">
                        <h3 style={{fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 8}}>
                        <FiLayers /> Receta y Escandallo de Insumos
                        </h3>
                        <button className="btn btn-outline btn-sm" onClick={addIngredient}><FiPlus /> Agregar Insumo</button>
                    </div>
                    
                    {form.ingredientes.length === 0 ? (
                        <div className="empty-state" style={{background: 'var(--wh)', border: '1px dashed var(--bd)', borderRadius: 'var(--rl)'}}>
                            <p>No hay insumos asociados aún.</p>
                            <button className="btn btn-primary btn-sm" style={{marginTop: 12}} onClick={addIngredient}>Agregar el primero</button>
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                            {form.ingredientes.map((ing, idx) => {
                                const prod = productos.find(p => String(p.id) === String(ing.producto))
                                const lin_total = prod ? (Number(prod.precio_compra) * Number(ing.cantidad)) : 0
                                return (
                                    <div key={idx} className="card" style={{padding: 16, background: '#fff'}}>
                                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end'}}>
                                            <div className="form-group" style={{margin:0}}>
                                                <label>Insumo / Ingrediente</label>
                                                <select className="form-control" value={ing.producto} onChange={e => updateIngredient(idx, 'producto', e.target.value)}>
                                                    <option value="">-- Seleccionar --</option>
                                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{margin:0}}>
                                                <label>Cantidad ({prod?.unidad || '-'})</label>
                                                <input type="number" step="any" className="form-control" placeholder="0.00" value={ing.cantidad} onChange={e => updateIngredient(idx, 'cantidad', e.target.value)} />
                                            </div>
                                            <button className="btn-icon" onClick={() => removeIngredient(idx)} style={{color:'var(--red)', marginBottom: 2}}><FiTrash2 /></button>
                                        </div>
                                        {prod && (
                                            <div className="flex-between" style={{marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 11}}>
                                                <span style={{color:'var(--txt3)'}}>Costo unitario: {fmt(prod.precio_compra)} / {prod.unidad}</span>
                                                <span className="bold">Subtotal: {fmt(lin_total)}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div style={{padding: '20px 32px', background: 'var(--wh)', borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'flex-end', gap: 12}}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{padding: '10px 30px'}} onClick={handleSave}><FiSave /> Guardar Producto Maestro</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .catalogo-container {
            animation: fadeIn 0.3s ease-out;
        }
        .suggestion-item:hover {
            background: rgba(37,99,235,0.05) !important;
            color: var(--acc) !important;
        }
        .modal-overlay {
            backdrop-filter: blur(4px);
        }
      `}} />
    </div>
  )
}
