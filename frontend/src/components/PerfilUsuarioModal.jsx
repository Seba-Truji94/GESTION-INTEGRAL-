import { useState, useRef } from 'react'
import { FiX, FiUpload, FiUser } from 'react-icons/fi'
import api from '../services/api'

export default function PerfilUsuarioModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telefono: user?.telefono || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // We must use FormData because we are sending a file via multipart/form-data
    const data = new FormData()
    data.append('first_name', formData.first_name)
    data.append('last_name', formData.last_name)
    data.append('telefono', formData.telefono)
    if (avatarFile) {
      data.append('avatar', avatarFile)
    }

    try {
      const res = await api.put('/auth/me/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      onUpdate(res.data)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error al actualizar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="flex-between mb-24">
          <h3 style={{ margin: 0 }}>Mi Perfil</h3>
          <button className="btn-icon" onClick={onClose}><FiX size={20}/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="center mb-24" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{
                width: 90, height: 90, borderRadius: '50%', backgroundColor: 'var(--blue)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold',
                overflow: 'hidden', marginBottom: 12, border: '3px solid var(--border)', cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.first_name?.[0] || user?.username?.[0] || 'U'
              )}
              <div 
                className="avatar-overlay"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <FiUpload size={14} />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Haz clic en la foto para cambiarla</div>
          </div>

          <div className="form-group">
            <label>Usuario / Login (Solo lectura)</label>
            <div className="form-control" style={{ background: 'var(--bg)', color: 'var(--txt2)' }}>
              <FiUser style={{ marginRight: 8 }}/> {user?.username} ({user?.rol})
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label>Nombre</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Teléfono de Contacto</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div className="modal-actions mt-24">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
