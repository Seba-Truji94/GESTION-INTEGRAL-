import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import api, { fmt } from '../services/api'

export default function PresupuestoNuevo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const eventoIdParam = searchParams.get('evento')

  const [eventos, setEventos] = useState([])
  const [productos, setProductos] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [eventoId, setEventoId] = useState(eventoIdParam || '')
  const [items, setItems] = useState([])
  const [nextId, setNextId] = useState(1)
  const [newItem, setNewItem] = useState({ 
    descripcion: '', categoria: 'I', cantidad: 1, costo_unitario: 0, venta_unitario: 0, 
    producto_catalogo: null 
  })
  const [showSugg, setShowSugg] = useState(false)
  const [config, setConfig] = useState({ 
    descuento_pct: 0, forma_pago: '50_50', validez_dias: 15, notas: '', incluir_iva: false,
    cliente_nombre: '', cliente_rut: '', cliente_email: '', cliente_telefono: '', cliente_direccion: '', cliente_comuna: '' 
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    api.get('/eventos/?page_size=200').then(r => setEventos(r.data.results || r.data))
    api.get('/productos/?page_size=1000').then(r => setProductos(r.data.results || r.data))
    api.get('/catalogo/productos/').then(r => setCatalogo(r.data))
    
    if (id) {
      api.get(`/presupuestos/${id}/`).then(res => {
        const p = res.data
        setEventoId(p.evento || '')
        setConfig({
          descuento_pct: parseFloat(p.descuento_pct) || 0,
          forma_pago: p.forma_pago || '50_50',
          validez_dias: p.validez_dias || 15,
          incluir_iva: p.incluir_iva || false,
          notas: p.notas || '',
          cliente_nombre: p.cliente_nombre || '',
          cliente_rut: p.cliente_rut || '',
          cliente_email: p.cliente_email || '',
          cliente_telefono: p.cliente_telefono || '',
          cliente_direccion: p.cliente_direccion || '',
          cliente_comuna: p.cliente_comuna || ''
        })
        if (p.items) {
          setItems(p.items.map((it, idx) => ({ ...it, id: idx + 1 })))
          setNextId(p.items.length + 1)
        }
        setLoading(false)
      }).catch(err => {
        alert('Error cargando presupuesto')
        setLoading(false)
      })
    }
  }, [id])

  const suggs = newItem.descripcion.length >= 3 && showSugg
    ? [
        ...catalogo.filter(c => c.nombre.toLowerCase().includes(newItem.descripcion.toLowerCase())).map(c => ({ ...c, isCatalog: true })),
        ...productos.filter(p => p.nombre.toLowerCase().includes(newItem.descripcion.toLowerCase())).map(p => ({ ...p, isCatalog: false }))
      ]
    : []

  const addItem = () => {
    if (!newItem.descripcion.trim()) return
    setItems([...items, { ...newItem, id: nextId }])
    setNextId(nextId + 1)
    setNewItem({ descripcion: '', categoria: 'I', cantidad: 1, costo_unitario: 0, venta_unitario: 0, producto_catalogo: null })
  }

  const removeItem = (id) => setItems(items.filter(i => i.id !== id))

  const totCosto = items.reduce((s, i) => s + i.cantidad * i.costo_unitario, 0)
  const totVenta = items.reduce((s, i) => s + i.cantidad * i.venta_unitario, 0)
  const ganancia = totVenta - totCosto
  const margen = totVenta > 0 ? (ganancia / totVenta * 100) : 0
  const roi = totCosto > 0 ? (ganancia / totCosto * 100) : 0
  const descMonto = totVenta * config.descuento_pct / 100
  const subtotalNeto = totVenta - descMonto
  const iva = config.incluir_iva ? subtotalNeto * 0.19 : 0
  const total = subtotalNeto + iva

  const catLabel = { I: 'Ingrediente', M: 'Mano de Obra', O: 'Otro' }
  const catTotals = { I: { c: 0, v: 0 }, M: { c: 0, v: 0 }, O: { c: 0, v: 0 } }
  items.forEach(i => { catTotals[i.categoria].c += i.cantidad * i.costo_unitario; catTotals[i.categoria].v += i.cantidad * i.venta_unitario })

  const margenColor = margen >= 30 ? 'var(--grn)' : margen >= 15 ? 'var(--amb)' : 'var(--red)'
  const margenClass = margen >= 30 ? '' : margen >= 15 ? 'amber' : 'red'

  const handleSave = async () => {
    if (!eventoId) { alert('Selecciona un evento'); return }
    if (items.length === 0) { alert('Agrega al menos un item'); return }
    setSaving(true)
    try {
      const payload = {
        evento: parseInt(eventoId),
        descuento_pct: config.descuento_pct,
        forma_pago: config.forma_pago,
        validez_dias: config.validez_dias,
        notas: config.notas,
        cliente_nombre: config.cliente_nombre,
        cliente_rut: config.cliente_rut,
        cliente_email: config.cliente_email,
        cliente_telefono: config.cliente_telefono,
        cliente_direccion: config.cliente_direccion,
        cliente_comuna: config.cliente_comuna,
        incluir_iva: config.incluir_iva,
        items: items.map(i => ({
          descripcion: i.descripcion, 
          categoria: i.categoria,
          cantidad: i.cantidad, 
          costo_unitario: i.costo_unitario, 
          venta_unitario: i.venta_unitario,
          producto_catalogo: i.producto_catalogo
        }))
      }
      
      if (id) {
        await api.put(`/presupuestos/${id}/`, payload)
      } else {
        await api.post('/presupuestos/', payload)
      }
      navigate(eventoIdParam ? `/eventos/${eventoIdParam}` : '/presupuestos')
    } catch (e) {
      alert('Error al guardar: ' + (e.response?.data ? JSON.stringify(e.response.data) : e.message))
    }
    setSaving(false)
  }

  const ev = eventos.find(e => String(e.id) === String(eventoId))

    if (loading) return <div className="loading"><span className="spinner"></span>Cargando...</div>

  return (
    <div>
      <div className="page-header responsive-stack">
        <div className="flex-center gap-12 responsive-stack w-full-mobile">
          <button className="btn-icon mobile-hide" onClick={() => navigate(-1)}><FiArrowLeft /></button>
          <div className="w-full-mobile">
            <h1 className="page-title">{id ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h1>
            <p className="page-subtitle">Calculadora de costos y margen</p>
          </div>
        </div>
        <button className="btn btn-primary w-full-mobile" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Guardando...' : 'Guardar Presupuesto'}
        </button>
      </div>

      {/* Evento selector + KPIs */}
      <div className="card mb-24">
        <div className="card-title">Datos del Evento</div>
        <div className="form-grid form-grid-3">
          <div className="form-group"><label>Evento</label>
            <select className="form-control" value={eventoId} onChange={e => setEventoId(e.target.value)}>
              <option value="">-- Seleccionar evento --</option>
              {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre} - {ev.cliente}</option>)}
            </select></div>
          {ev && <>
            <div className="form-group"><label>Fecha</label><input type="date" className="form-control" readOnly value={ev.fecha ? ev.fecha.substring(0, 10) : ''} /></div>
            <div className="form-group"><label>Pax</label><input className="form-control" readOnly value={ev.pax} /></div>
          </>}
        </div>
      </div>

      {/* KPI Row */}
      <div className="responsive-kpi mb-24">
        <div className="kpi-card amber"><div className="kpi-label">Costo Total</div><div className="kpi-value amber">{fmt(totCosto)}</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Precio Venta</div><div className="kpi-value blue">{fmt(totVenta)}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Ganancia Bruta</div><div className="kpi-value" style={{color:margenColor}}>{fmt(ganancia)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Margen %</div><div className="kpi-value" style={{color:margenColor}}>{margen.toFixed(1)}%</div></div>
        <div className="kpi-card"><div className="kpi-label">ROI</div><div className="kpi-value" style={{color:margenColor}}>{roi.toFixed(1)}%</div></div>
      </div>

      {/* Add Item */}
      <div className="card mb-24">
        <div className="card-title">Agregar Item al Detalle</div>
        <div className="budget-entry-grid">
          <div className="form-group" style={{ position: 'relative' }}><label>Descripción</label>
            <input className="form-control" value={newItem.descripcion} 
              onChange={e => { setNewItem({...newItem, descripcion: e.target.value}); setShowSugg(true); }}
              onBlur={() => setTimeout(() => setShowSugg(false), 200)}
              placeholder="ej: Lomo de res..." onKeyDown={e => e.key === 'Enter' && addItem()} />
            
            {showSugg && suggs.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: '0 0 var(--r) var(--r)', zIndex: 10, maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {suggs.map(p => (
                  <div key={p.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--bd)', fontSize: 13 }}
                    className="suggestion-item"
                    onMouseDown={() => {
                      if (p.isCatalog) {
                        setNewItem({ 
                          ...newItem, 
                          descripcion: p.nombre, 
                          categoria: 'O', // Default 'Other' for composite items
                          costo_unitario: Number(p.costo_base) || 0, 
                          venta_unitario: Number(p.precio_venta) || 0,
                          producto_catalogo: p.id
                        })
                      } else {
                        const cat = (p.categoria === 'ingrediente' || p.categoria === 'insumo') ? 'I' : 'O'
                        setNewItem({ 
                          ...newItem, 
                          descripcion: p.nombre, 
                          categoria: cat, 
                          costo_unitario: Number(p.precio_compra) || 0, 
                          venta_unitario: Number(p.precio_venta) || 0,
                          producto_catalogo: null
                        })
                      }
                      setShowSugg(false)
                    }}
                  >
                    <strong>{p.isCatalog ? '📦' : '🍎'} {p.nombre || p.nombre}</strong> 
                    <span style={{color: 'var(--txt3)', fontSize: 11}}>
                      {p.isCatalog ? ` - Catálogo (${fmt(p.precio_venta)})` : ` - disp: ${Number(p.stock_actual)} ${p.unidad}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(() => {
              const matched = productos.find(x => x.nombre === newItem.descripcion)
              return matched ? (
                <div style={{fontSize: 11, fontWeight: 500, color: matched.stock_bajo ? 'var(--red)' : 'var(--grn)', marginTop: 4}}>
                  Stock disp: {Number(matched.stock_actual)} {matched.unidad} {matched.stock_bajo ? '(Bajo)' : ''}
                </div>
              ) : null
            })()}
          </div>
          <div className="form-group"><label>Categoría</label>
            <select className="form-control" value={newItem.categoria} onChange={e => setNewItem({...newItem, categoria: e.target.value})}>
              <option value="I">Ingrediente / Insumo</option><option value="M">Mano de Obra</option><option value="O">Otro</option>
            </select></div>
          <div className="form-group"><label>Cant.</label>
            <input type="number" className="form-control" value={newItem.cantidad} onChange={e => setNewItem({...newItem, cantidad: parseFloat(e.target.value)||0})} min="0" step="any" /></div>
          <div className="form-group"><label>Costo Unit. ($)</label>
            <input type="number" className="form-control" value={newItem.costo_unitario} onChange={e => setNewItem({...newItem, costo_unitario: parseFloat(e.target.value)||0})} min="0" /></div>
          <div className="form-group"><label>Venta Unit. ($)</label>
            <input type="number" className="form-control" value={newItem.venta_unitario} onChange={e => setNewItem({...newItem, venta_unitario: parseFloat(e.target.value)||0})} min="0"
              onKeyDown={e => e.key === 'Enter' && addItem()} /></div>
          <div className="form-group"><label>&nbsp;</label>
            <button className="btn btn-primary" onClick={addItem}><FiPlus /> Agregar</button></div>
        </div>
      </div>

      {/* Items Table */}
      <div className="table-wrapper mb-24">
        <table>
          <thead><tr>
            <th style={{width:'5%'}}>#</th><th style={{width:'25%'}}>Descripción</th><th style={{width:'12%'}}>Categoría</th>
            <th className="center" style={{width:'7%'}}>Cant.</th><th className="right">Costo Unit.</th><th className="right">Venta Unit.</th>
            <th className="right">Total Costo</th><th className="right">Total Venta</th><th className="right">Margen%</th><th className="center" style={{width:'7%'}}></th>
          </tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="10"><div className="empty-state" style={{padding:30}}><p>Agrega items usando el formulario de arriba</p></div></td></tr>
            ) : items.map((it, i) => {
              const tc = it.cantidad * it.costo_unitario, tv = it.cantidad * it.venta_unitario
              const mg = tv > 0 ? ((tv - tc) / tv * 100) : 0
              return (
                <tr key={it.id}>
                  <td style={{color:'var(--txt3)'}}>{i+1}</td>
                  <td className="bold">{it.descripcion}</td>
                  <td><span className={`badge badge-${it.categoria === 'I' ? 'green' : it.categoria === 'M' ? 'amber' : 'presupuestado'}`}>{catLabel[it.categoria]}</span></td>
                  <td className="center">{it.cantidad}</td>
                  <td className="right">{fmt(it.costo_unitario)}</td>
                  <td className="right">{fmt(it.venta_unitario)}</td>
                  <td className="right">{fmt(tc)}</td>
                  <td className="right bold">{fmt(tv)}</td>
                  <td className="right" style={{fontWeight:600,color:mg>=30?'var(--grn)':mg>=15?'var(--amb)':'var(--red)'}}>{mg.toFixed(1)}%</td>
                  <td className="center"><button className="btn-icon" onClick={() => removeItem(it.id)} style={{color:'var(--red)'}}><FiTrash2 /></button></td>
                </tr>
              )
            })}
          </tbody>
          {items.length > 0 && <tfoot><tr>
            <td colSpan="6" style={{fontWeight:700}}>TOTALES</td>
            <td className="right" style={{fontWeight:700}}>{fmt(totCosto)}</td>
            <td className="right" style={{fontWeight:700}}>{fmt(totVenta)}</td>
            <td className="right" style={{fontWeight:700,color:margenColor}}>{margen.toFixed(1)}%</td>
            <td></td>
          </tr></tfoot>}
        </table>
      </div>

      {/* Breakdown + Margin */}
      {items.length > 0 && (
        <>
          <div className="responsive-kpi mb-24">
            {[['I','Ingredientes / Insumos','var(--grn)'],['M','Mano de Obra','var(--amb)'],['O','Otros','var(--acc)']].map(([key,label,color]) => {
              const d = catTotals[key]; const g = d.v - d.c; const m = d.v > 0 ? (g/d.v*100) : 0
              return (
                <div className="card" key={key}>
                  <div className="flex-center gap-8 mb-16"><div style={{width:8,height:8,borderRadius:'50%',background:color}}></div><div className="card-title" style={{marginBottom:0}}>{label}</div></div>
                  <div style={{fontSize:12,color:'var(--txt2)',display:'grid',gap:6}}>
                    <div className="flex-between"><span>Costo total</span><strong>{fmt(d.c)}</strong></div>
                    <div className="flex-between"><span>Precio venta</span><strong>{fmt(d.v)}</strong></div>
                    <div className="flex-between"><span>Ganancia</span><strong style={{color}}>{fmt(g)}</strong></div>
                    <div className="flex-between"><span>Margen</span><strong style={{color}}>{m.toFixed(1)}%</strong></div>
                  </div>
                  <div className="margin-bar-wrap" style={{marginTop:10}}><div className="margin-bar-fill" style={{width:`${Math.min(d.v/(Math.max(catTotals.I.v,catTotals.M.v,catTotals.O.v,1))*100,100)}%`,background:color}}></div></div>
                </div>
              )
            })}
          </div>

          {/* Global Margin */}
          <div className="card mb-24">
            <div className="flex-between mb-16">
              <strong style={{fontSize:14}}>Margen de Ganancia Global</strong>
              <span style={{padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:700,background:margen>=30?'var(--grn-light)':margen>=15?'var(--amb-light)':'var(--red-light)',
                color:margen>=30?'#065f46':margen>=15?'#78350f':'#7f1d1d'}}>ROI: {roi.toFixed(1)}%</span>
            </div>
            <div className="margin-bar-wrap" style={{height:12,marginBottom:6}}>
              <div className={`margin-bar-fill ${margenClass}`} style={{width:`${Math.min(Math.max(margen,0),100)}%`,height:12}}></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--txt3)',marginBottom:16}}>
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
            {ev && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,textAlign:'center'}}>
                <div><div style={{fontSize:11,color:'var(--txt3)'}}>Costo por persona</div><div style={{fontSize:16,fontWeight:700}}>{ev.pax > 0 ? fmt(totCosto/ev.pax) : '-'}</div></div>
                <div><div style={{fontSize:11,color:'var(--txt3)'}}>Venta por persona</div><div style={{fontSize:16,fontWeight:700,color:'var(--acc)'}}>{ev.pax > 0 ? fmt(totVenta/ev.pax) : '-'}</div></div>
                <div><div style={{fontSize:11,color:'var(--txt3)'}}>Ganancia por persona</div><div style={{fontSize:16,fontWeight:700,color:'var(--grn)'}}>{ev.pax > 0 ? fmt(ganancia/ev.pax) : '-'}</div></div>
                <div><div style={{fontSize:11,color:'var(--txt3)'}}>Total items</div><div style={{fontSize:16,fontWeight:700}}>{items.length}</div></div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Client Data Section */}
      <div className="card mb-24">
        <div className="card-title">DATOS DEL CLIENTE</div>
        <div className="form-grid form-grid-2">
          <div className="form-group"><label>NOMBRE DEL CLIENTE <span style={{color:'var(--red)'}}>*</span></label>
            <input className="form-control" value={config.cliente_nombre} onChange={e => setConfig({...config, cliente_nombre: e.target.value})} placeholder="Ej: PRUEBA" /></div>
          
          <div className="form-group"><label>RUT / DNI / PASAPORTE</label>
            <input className="form-control" value={config.cliente_rut} onChange={e => setConfig({...config, cliente_rut: e.target.value})} placeholder="ej: 12.345.678-9" />
            <div style={{fontSize:11, color:'var(--txt3)', marginTop:4}}>Se formatea automáticamente</div></div>
            
          <div className="form-group"><label>EMAIL <span style={{color:'var(--red)'}}>*</span></label>
            <input type="email" className="form-control" value={config.cliente_email} onChange={e => setConfig({...config, cliente_email: e.target.value})} placeholder="ej: cliente@email.com" />
            <div style={{fontSize:11, color:'var(--txt3)', marginTop:4}}>Para enviar presupuesto por correo</div></div>
            
          <div className="form-group"><label>TELÉFONO / WHATSAPP <span style={{color:'var(--red)'}}>*</span></label>
            <input className="form-control" value={config.cliente_telefono} onChange={e => setConfig({...config, cliente_telefono: e.target.value})} placeholder="ej: +56 9 1234 5678" />
            <div style={{fontSize:11, color:'var(--txt3)', marginTop:4}}>Con código de país para WhatsApp</div></div>
            
          <div className="form-group"><label>DIRECCIÓN DEL EVENTO</label>
            <input className="form-control" value={config.cliente_direccion} onChange={e => setConfig({...config, cliente_direccion: e.target.value})} placeholder="ej: Av. Principal 123" /></div>
            
          <div className="form-group"><label>COMUNA / CIUDAD</label>
            <input className="form-control" value={config.cliente_comuna} onChange={e => setConfig({...config, cliente_comuna: e.target.value})} placeholder="ej: Providencia, Santiago" /></div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="card mb-24">
        <div className="card-title">CONFIGURACIÓN DEL PRESUPUESTO</div>
        <div className="form-grid form-grid-3">
          <div className="form-group"><label>VALIDEZ DEL PRESUPUESTO</label>
            <select className="form-control" value={config.validez_dias} onChange={e => setConfig({...config, validez_dias: parseInt(e.target.value)||15})}>
              <option value="5">5 días</option>
              <option value="7">7 días</option>
              <option value="15">15 días</option>
              <option value="30">30 días</option>
            </select></div>
            
          <div className="form-group"><label>DESCUENTO (%)</label>
            <input type="number" className="form-control" value={config.descuento_pct} onChange={e => setConfig({...config, descuento_pct: parseFloat(e.target.value)||0})} min="0" max="100" /></div>
            
          <div className="form-group"><label>FORMA DE PAGO</label>
            <select className="form-control" value={config.forma_pago} onChange={e => setConfig({...config, forma_pago: e.target.value})}>
              <option value="50_50">50% anticipo, 50% día del evento</option>
              <option value="100_anticipo">100% anticipado</option>
              <option value="30_70">30% anticipo, 70% día del evento</option>
              <option value="al_finalizar">Pago al finalizar</option>
            </select></div>
        </div>
        
        <div className="form-group" style={{background: 'var(--bg)', padding: '12px 16px', borderRadius: 'var(--r)', margin: '16px 0'}}>
          <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0}}>
            <input type="checkbox" checked={config.incluir_iva} onChange={e => setConfig({...config, incluir_iva: e.target.checked})} style={{width: 18, height: 18}} />
            <span style={{fontWeight: 600}}>Incluir IVA (19%)</span>
            <span style={{color: 'var(--txt3)', fontSize: 13, fontWeight: 400}}>(el documento mostrará desglose neto + IVA)</span>
          </label>
        </div>
        
        <div className="form-group"><label>NOTAS / CONDICIONES ADICIONALES</label>
          <textarea className="form-control" rows="3" value={config.notas} onChange={e => setConfig({...config, notas: e.target.value})} placeholder="ej: Incluye montaje y desmontaje. No incluye bebidas alcohólicas."></textarea></div>

        {(config.descuento_pct > 0 || config.incluir_iva) && items.length > 0 && (
          <div style={{background:'var(--bg)',borderRadius:'var(--r)',padding:16,marginTop:20}}>
            <div className="flex-between" style={{fontSize:13, marginBottom: 4}}><span>Subtotal General</span><span>{fmt(totVenta)}</span></div>
            {config.descuento_pct > 0 && (
              <div className="flex-between" style={{fontSize:13,color:'var(--grn)', marginBottom: 4}}><span>Descuento ({config.descuento_pct}%)</span><span>-{fmt(descMonto)}</span></div>
            )}
            <div className="flex-between" style={{fontSize:14, fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid var(--bd)'}}><span>Monto Neto Ajustado</span><span>{fmt(subtotalNeto)}</span></div>
            {config.incluir_iva && (
              <div className="flex-between" style={{fontSize:13, color: 'var(--acc)', paddingTop: 8}}><span>IVA (19%)</span><span>{fmt(iva)}</span></div>
            )}
            <div className="flex-between" style={{fontSize:18,fontWeight:800,color:'var(--acc)',marginTop:8,paddingTop:8,borderTop:'1px solid var(--bd)'}}><span>TOTAL FINAL</span><span>{fmt(total)}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
