import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiCheck, FiX, FiSave } from 'react-icons/fi'
import api from '../services/api'

export default function ConfiguracionTransferencia() {
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await api.get('/datos-transferencia/')
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      setDatos(list)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm(item)
    setIsAdding(false)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/datos-transferencia/${editingId}/`, editForm)
      } else {
        await api.post('/datos-transferencia/', editForm)
      }
      setEditingId(null)
      setIsAdding(false)
      load()
    } catch (e) {
      alert('Error al guardar los datos')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar estos datos de transferencia?')) return
    try {
      await api.delete(`/datos-transferencia/${id}/`)
      load()
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  const toggleActivo = async (item) => {
    try {
      await api.patch(`/datos-transferencia/${item.id}/`, { activo: !item.activo })
      load()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="loading"><span className="spinner"></span>Cargando...</div>

  return (
    <div className="page-container">
      <div className="page-header responsive-stack">
        <div>
          <h1 className="page-title">Configuración de Transferencias</h1>
          <p className="page-subtitle">Gestiona los datos bancarios que aparecen en los presupuestos</p>
        </div>
        {!isAdding && !editingId && (
          <button className="btn btn-primary w-full-mobile" onClick={() => { setIsAdding(true); setEditForm({ activo: true }) }}>
            <FiPlus /> Nueva Cuenta
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card" style={{ marginBottom: 30, maxWidth: 600 }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria'}</h3>
          </div>
          <div className="form-grid" style={{ padding: 20 }}>
            <div className="form-group">
              <label>Banco</label>
              <input 
                type="text" 
                className="form-control" 
                value={editForm.banco || ''} 
                onChange={e => setEditForm({...editForm, banco: e.target.value})}
                placeholder="Ej: Banco Santander"
              />
            </div>
            <div className="form-group">
              <label>Tipo de Cuenta</label>
              <input 
                type="text" 
                className="form-control" 
                value={editForm.tipo_cuenta || ''} 
                onChange={e => setEditForm({...editForm, tipo_cuenta: e.target.value})}
                placeholder="Ej: Cuenta Corriente"
              />
            </div>
            <div className="form-group">
              <label>N° Cuenta</label>
              <input 
                type="text" 
                className="form-control" 
                value={editForm.numero_cuenta || ''} 
                onChange={e => setEditForm({...editForm, numero_cuenta: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Titular</label>
              <input 
                type="text" 
                className="form-control" 
                value={editForm.titular || ''} 
                onChange={e => setEditForm({...editForm, titular: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>RUT</label>
              <input 
                type="text" 
                className="form-control" 
                value={editForm.rut || ''} 
                onChange={e => setEditForm({...editForm, rut: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Confirmación</label>
              <input 
                type="email" 
                className="form-control" 
                value={editForm.email || ''} 
                onChange={e => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="btn btn-primary" onClick={handleSave}>
                <FiSave /> Guardar
              </button>
              <button className="btn btn-outline" onClick={() => { setEditingId(null); setIsAdding(false) }}>
                <FiX /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid responsive-kpi">
        {datos.map(item => (
          <div key={item.id} className={`card ${item.activo ? 'border-primary' : ''}`}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">{item.banco}</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>{item.tipo_cuenta}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  className={`btn btn-icon ${item.activo ? 'btn-success' : 'btn-outline'}`} 
                  onClick={() => toggleActivo(item)}
                  title={item.activo ? 'Desactivar' : 'Activar para presupuestos'}
                >
                  <FiCheck />
                </button>
                <button className="btn btn-icon btn-outline" onClick={() => handleEdit(item)}>
                  <FiSave style={{ opacity: 0.5 }} /> {/* Using Save icon for edit as placeholder if no edit icon */}
                </button>
                <button className="btn btn-icon btn-danger" onClick={() => handleDelete(item.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 15 }}>
              <div style={{ marginBottom: 5 }}><strong>N°:</strong> {item.numero_cuenta}</div>
              <div style={{ marginBottom: 5 }}><strong>Titular:</strong> {item.titular}</div>
              <div style={{ marginBottom: 5 }}><strong>RUT:</strong> {item.rut}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{item.email}</div>
            </div>
          </div>
        ))}
        {datos.length === 0 && !isAdding && (
          <div className="empty-state">No hay datos de transferencia configurados</div>
        )}
      </div>
    </div>
  )
}
