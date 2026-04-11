import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiPrinter, FiMessageSquare, FiArrowLeft, FiMail } from 'react-icons/fi'
import api, { fmt } from '../services/api'

export default function PresupuestoImpresion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [presupuesto, setPresupuesto] = useState(null)
  const [datosBanco, setDatosBanco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareConfig, setShareConfig] = useState({ type: 'whatsapp', message: '', subject: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [resP, resB] = await Promise.all([
          api.get(`/presupuestos/${id}/`),
          api.get('/datos-transferencia/?activo=true')
        ])
        setPresupuesto(resP.data)
        // Ensure resB.data is an array (handle DRF pagination results if still present)
        const bankList = Array.isArray(resB.data) ? resB.data : (resB.data?.results || [])
        // Find the first active one, or any as fallback
        setDatosBanco(bankList.find(d => d.activo) || bankList[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="loading"><span className="spinner"></span>Cargando...</div>
  if (!presupuesto) return <div className="empty-state">Presupuesto no encontrado</div>

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const p = presupuesto
    const publicUrl = `${window.location.origin}/p/${p.id}`
    const itemSummary = (p.items || []).map(it => `• *${it.descripcion}* (${fmt(it.venta_unitario)})`).join('\n')
    
    const msg = `🥂 *Hola ${p.cliente_nombre || 'Cliente'}!*\n\n` +
      `Te enviamos el presupuesto *${p.numero}* para tu evento: "${p.evento_nombre}".\n\n` +
      `📋 *Detalle de servicios:* \n${itemSummary}\n\n` +
      `💰 *Total:* ${fmt(p.total)}\n` +
      `💳 *Forma de pago:* ${p.forma_pago_display}\n\n` +
      `🔗 *Ver presupuesto completo aquí:* \n${publicUrl}\n\n` +
      `Quedamos atentos a cualquier consulta para confirmar tu reserva. ✨\n\n` +
      `Saludos,\n*Gestión Integral Banquetería*`
    
    setShareConfig({ type: 'whatsapp', message: msg, subject: '' })
    setShowShareModal(true)
  }

  const handleEmail = () => {
    const p = presupuesto
    const publicUrl = `${window.location.origin}/p/${p.id}`
    const itemSummary = (p.items || []).map(it => `- ${it.descripcion} (${fmt(it.venta_unitario)})`).join('\n')
    
    const subject = `Presupuesto Banquetería - ${p.numero} - ${p.evento_nombre}`
    const body = `Hola ${p.cliente_nombre || ''},\n\n` +
      `Es un gusto saludarte. Adjuntamos los detalles del presupuesto ${p.numero} para el evento "${p.evento_nombre}".\n\n` +
      `Detalle de servicios:\n${itemSummary}\n\n` +
      `Resumen:\n` +
      `- Total: ${fmt(p.total)}\n` +
      `- Forma de pago: ${p.forma_pago_display}\n\n` +
      `Puedes revisar todos los detalles y descargar el documento aquí:\n${publicUrl}\n\n` +
      `Quedamos a tu entera disposición.\n\n` +
      `Saludos cordiales,\nGestión Integral Banquetería`
    
    setShareConfig({ type: 'email', message: body, subject: subject })
    setShowShareModal(true)
  }

  const confirmSend = async () => {
    // Update status to 'enviado' if it's currently 'borrador'
    if (presupuesto.estado === 'borrador') {
      try {
        await api.patch(`/presupuestos/${presupuesto.id}/`, { estado: 'enviado' })
        setPresupuesto({ ...presupuesto, estado: 'enviado', estado_display: 'Enviado' })
      } catch (e) {
        console.error('Error updating status:', e)
      }
    }

    if (shareConfig.type === 'whatsapp') {
      const url = `https://wa.me/?text=` + encodeURIComponent(shareConfig.message)
      window.open(url, '_blank')
    } else {
      const url = `mailto:${presupuesto.cliente_email || ''}?subject=${encodeURIComponent(shareConfig.subject)}&body=${encodeURIComponent(shareConfig.message)}`
      window.location.href = url
    }
    setShowShareModal(false)
  }

  const p = presupuesto
  const emisionDate = new Date(p.created_at)
  const validezDate = new Date(emisionDate)
  validezDate.setDate(validezDate.getDate() + p.validez_dias)

  const items = p.items || []
  const subtotal = Number(p.subtotal)
  const descuentoMonto = subtotal * parseFloat(p.descuento_pct) / 100
  const baseNeto = subtotal - descuentoMonto
  const ivaMonto = p.incluir_iva ? baseNeto * 0.19 : 0
  const total = Number(p.total)

  return (
    <div className="impresion-container">
      {/* Action buttons (hidden on print) */}
      <div className="no-print impresion-actions">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={handleEmail}>
            <FiMail /> Correo
          </button>
          <button className="btn btn-success" onClick={handleWhatsApp}>
            <FiMessageSquare /> WhatsApp
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <FiPrinter /> Imprimir Documento
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="impresion-sheet">
        <div className="doc-header">
          <div className="doc-meta-top">
            <span>{emisionDate.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</span>
            <span>Presupuesto</span>
          </div>

          <div className="doc-title-row">
            <div>
              <h1 className="doc-title">PRESUPUESTO DE BANQUETERIA</h1>
              <p className="doc-subtitle">N° {p.numero}</p>
            </div>
            <div className="doc-dates right">
              <p>Emision: {emisionDate.toLocaleDateString('es-CL')}</p>
              <p>Valido hasta: {validezDate.toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>

        <div className="doc-info-grid">
          <div>
            <h3>DATOS DEL CLIENTE</h3>
            <div className="info-list">
              <div><strong>Nombre:</strong> {p.cliente_nombre || '—'}</div>
              <div><strong>RUT/Doc:</strong> {p.cliente_rut || '—'}</div>
              <div><strong>Email:</strong> {p.cliente_email || '—'}</div>
              <div><strong>Dirección:</strong> {p.cliente_direccion || '—'}</div>
              <div><strong>Comuna/Ciudad:</strong> {p.cliente_comuna || '—'}</div>
            </div>
          </div>
          <div>
            <h3>DATOS DEL EVENTO</h3>
            <div className="info-list">
              <div style={{ gridColumn: '1 / -1' }}><strong>Evento:</strong> {p.evento_nombre}</div>
              <div><strong>Fecha:</strong> {new Date(p.created_at).toLocaleDateString('es-CL')} {/* Replace with Event date later if needed */}</div>
              <div><strong>N° Personas:</strong> {p.pax || '—'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Forma de Pago:</strong> {p.forma_pago_display}</div>
            </div>
          </div>
        </div>

        <table className="doc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Descripcion</th>
              <th className="center">Cant.</th>
              <th className="right">Precio Unit.</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td style={{ color: '#64748b' }}>{i + 1}</td>
                <td>{it.descripcion}</td>
                <td className="center">{Number(it.cantidad)}</td>
                <td className="right">{fmt(it.venta_unitario)}</td>
                <td className="right bold">{fmt(it.cantidad * it.venta_unitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-totals">
          <div className="totals-row">
            <span>Subtotal General</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {p.descuento_pct > 0 && (
            <div className="totals-row">
              <span>Descuento ({p.descuento_pct}%)</span>
              <span>-{fmt(descuentoMonto)}</span>
            </div>
          )}
          
          {(p.descuento_pct > 0 || p.incluir_iva) && (
            <div className="totals-row" style={{borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8, fontWeight: 600}}>
              <span>Monto Neto</span>
              <span>{fmt(baseNeto)}</span>
            </div>
          )}
          
          {p.incluir_iva && (
            <div className="totals-row">
              <span>IVA (19%)</span>
              <span>{fmt(ivaMonto)}</span>
            </div>
          )}
          
          <div className="totals-row total-final">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>TOTAL A PAGAR</span>
              {p.pax > 0 && (
                <span className="pax-price">Precio por persona {fmt(total / p.pax)}</span>
              )}
            </div>
            <span className="total-amount">{fmt(total)}</span>
          </div>
        </div>

        {datosBanco && (
          <div className="doc-bank-box">
            <h3>DATOS PARA TRANSFERENCIA</h3>
            <div className="bank-grid">
              <div className="bank-label">Banco</div>
              <div>{datosBanco.banco} — {datosBanco.tipo_cuenta}</div>
              <div className="bank-label">N° Cuenta</div>
              <div>{datosBanco.numero_cuenta}</div>
              <div className="bank-label">Titular</div>
              <div>{datosBanco.titular} - RUT {datosBanco.rut}</div>
              <div className="bank-label">Email</div>
              <div>{datosBanco.email}</div>
            </div>
          </div>
        )}

        {p.notas && (
          <div style={{ marginTop: 20, fontSize: 13, color: '#475569' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Condiciones Adicionales:</strong>
            <div style={{ whiteSpace: 'pre-wrap' }}>{p.notas}</div>
          </div>
        )}

        <div className="doc-footer">
          Presupuesto valido por {p.validez_dias} dias desde la fecha de emision.
        </div>
      </div>

      {showShareModal && (
        <div className="modal-overlay no-print" onClick={e => e.target === e.currentTarget && setShowShareModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="card-header">
              <h3 className="card-title">
                {shareConfig.type === 'whatsapp' ? 'Personalizar mensaje de WhatsApp' : 'Personalizar mensaje de Correo'}
              </h3>
            </div>
            <div className="card-body" style={{ padding: 20 }}>
              {shareConfig.type === 'email' && (
                <div className="form-group">
                  <label>Asunto</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={shareConfig.subject} 
                    onChange={e => setShareConfig({ ...shareConfig, subject: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Mensaje</label>
                <textarea 
                  className="form-control" 
                  rows="10" 
                  value={shareConfig.message} 
                  onChange={e => setShareConfig({ ...shareConfig, message: e.target.value })}
                  style={{ fontSize: 13, lineHeight: 1.5 }}
                ></textarea>
              </div>
              <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 20 }}>
                {shareConfig.type === 'whatsapp' ? 'ℹ️ Se abrirá WhatsApp Web/App con este texto.' : 'ℹ️ Se abrirá tu aplicación de correo predeterminada.'}
              </p>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowShareModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={confirmSend}>
                  {shareConfig.type === 'whatsapp' ? <><FiMessageSquare /> Enviar WhatsApp</> : <><FiMail /> Enviar Correo</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
