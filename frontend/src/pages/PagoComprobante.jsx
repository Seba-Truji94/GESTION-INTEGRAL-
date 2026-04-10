import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiPrinter, FiArrowLeft, FiImage } from 'react-icons/fi'
import api, { fmt } from '../services/api'

export default function PagoComprobante() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pago, setPago] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/pagos/${id}/`)
        setPago(res.data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="loading"><span className="spinner"></span>Generando comprobante...</div>
  if (!pago) return <div className="empty-state">Pago no encontrado</div>

  const handlePrint = () => window.print()

  return (
    <div className="impresion-container">
      <div className="no-print impresion-actions">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
        <div className="flex gap-8">
          {pago.evidencia && (
            <a href={pago.evidencia} target="_blank" rel="noreferrer" className="btn btn-outline">
              <FiImage /> Ver Evidencia
            </a>
          )}
          <button className="btn btn-primary" onClick={handlePrint}>
            <FiPrinter /> Imprimir Comprobante
          </button>
        </div>
      </div>

      <div className="impresion-sheet comprobante-sheet">
        <div className="doc-header center">
          <h1 className="doc-title" style={{ fontSize: 24, marginBottom: 4 }}>COMPROBANTE DE PAGO</h1>
          <p className="doc-subtitle">Recibo N° {pago.id.toString().padStart(6, '0')}</p>
        </div>

        <div className="comprobante-body" style={{ marginTop: 40, border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Cliente</label>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{pago.cliente_nombre || '—'}</div>
            </div>
            <div className="right">
              <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Fecha de Pago</label>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{new Date(pago.fecha_pago).toLocaleDateString('es-CL')}</div>
            </div>
          </div>

          <div style={{ marginTop: 32, padding: '20px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0' }}>
            <div className="flex-between">
              <div style={{ fontSize: 15 }}>
                <div style={{ color: '#64748b', fontSize: 13 }}>Por concepto de:</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{pago.evento_nombre}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Presupuesto: {pago.presupuesto_numero}</div>
              </div>
              <div className="right">
                <div style={{ color: '#64748b', fontSize: 13 }}>Monto Recibido:</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{fmt(pago.monto)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <span style={{ fontSize: 13, color: '#64748b' }}>Método de Pago:</span>
              <span style={{ marginLeft: 8, fontWeight: 600 }}>{pago.metodo_pago_display}</span>
            </div>
            {pago.comprobante && (
              <div className="right">
                <span style={{ fontSize: 13, color: '#64748b' }}>Referencia:</span>
                <span style={{ marginLeft: 8, fontWeight: 600 }}>{pago.comprobante}</span>
              </div>
            )}
          </div>

          {pago.observaciones && (
            <div style={{ marginTop: 24, padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
              <strong>Notas:</strong> {pago.observaciones}
            </div>
          )}
        </div>

        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', borderTop: '1px solid #cbd5e1', paddingTop: 8, minWidth: 200 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>Gestión Integral Banquetería</p>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Comprobante de Ingreso</p>
          </div>
        </div>

        <div className="doc-footer" style={{ marginTop: 40, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          Este documento es un comprobante interno de recepción de fondos.
          <br />
          Generado el {new Date().toLocaleString('es-CL')}
        </div>
      </div>
    </div>
  )
}
