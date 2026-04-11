import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api, { fmt } from '../services/api'

export default function PresupuestoPublico() {
  const { id } = useParams()
  const [presupuesto, setPresupuesto] = useState(null)
  const [datosBanco, setDatosBanco] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const resP = await api.get(`/presupuestos/publico/${id}/`)
        setPresupuesto(resP.data)
      } catch (e) {
        console.error(e)
      }
      try {
        const resB = await api.get('/cobros/datos-transferencia/')
        const bankList = Array.isArray(resB.data) ? resB.data : (resB.data?.results || [])
        setDatosBanco(bankList.find(d => d.activo) || bankList[0] || null)
      } catch {
        // datos bancarios no disponibles para usuarios públicos — no es crítico
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="loading"><span className="spinner"></span>Cargando presupuesto...</div>
  if (!presupuesto) return <div className="empty-state">Presupuesto no disponible o no encontrado</div>

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
    <div className="impresion-container public-view">
      <div className="impresion-sheet">
        <div className="doc-header">
          <div className="doc-meta-top">
            <span>{emisionDate.toLocaleDateString('es-CL')}</span>
            <span>Documento de Cotización</span>
          </div>

          <div className="doc-title-row">
            <div>
              <h1 className="doc-title">PRESUPUESTO DE BANQUETERIA</h1>
              <p className="doc-subtitle">N° {p.numero}</p>
            </div>
            <div className="doc-dates right">
              <p>Valido hasta: {validezDate.toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>

        <div className="doc-info-grid">
          <div>
            <h3>DATOS DEL CLIENTE</h3>
            <div className="info-list">
              <div><strong>Nombre:</strong> {p.cliente_nombre || '—'}</div>
              <div><strong>Email:</strong> {p.cliente_email || '—'}</div>
            </div>
          </div>
          <div>
            <h3>DATOS DEL EVENTO</h3>
            <div className="info-list">
              <div style={{ gridColumn: '1 / -1' }}><strong>Evento:</strong> {p.evento_nombre}</div>
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
          Muchas gracias por preferir Gestión Integral Banquetería.
          <br/>
          Presupuesto valido por {p.validez_dias} dias desde su emision.
        </div>
      </div>
    </div>
  )
}
