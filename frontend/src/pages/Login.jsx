import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Balatro from '../components/Balatro/Balatro'
import LineWaves from '../components/LineWaves/LineWaves'
import Hyperspeed from '../components/Hyperspeed/Hyperspeed'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/auth/login-config/')
        setConfig(res.data)
      } catch (err) {
        console.error("Error fetching login config", err)
      }
    }
    fetchConfig()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokenRes = await api.post('/auth/login/', { username, password })
      const tokens = tokenRes.data
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      const userRes = await api.get('/auth/me/')
      onLogin(userRes.data, tokens)
      navigate('/')
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {config && config.animation_type === 'balatro' && (
        <Balatro
          color1={config.color1}
          color2={config.color2}
          color3={config.color3}
          pixelFilter={config.pixel_filter}
          isRotate={config.is_rotate}
          mouseInteraction={config.mouse_interaction}
          spinSpeed={config.spin_speed}
          spinRotation={config.spin_rotation}
          spinAmount={config.spin_amount}
          spinEase={config.spin_ease}
          contrast={config.contrast}
          lighting={config.lighting}
        />
      )}
      {config && config.animation_type === 'linewaves' && (
        <LineWaves
          color1={config.color1}
          color2={config.color2}
          color3={config.color3}
          mouseInteraction={config.mouse_interaction}
          speed={config.spin_speed * 0.1}
        />
      )}
      {config && config.animation_type === 'hyperspeed' && (
        <Hyperspeed
          color1={config.color1}
          color2={config.color2}
          color3={config.color3}
          mouseInteraction={config.mouse_interaction}
          speed={config.spin_speed * 0.7}
        />
      )}
      
      <div className="login-card login-glass">
        <div className="login-logo">KR</div>
        <h1 className="login-title">Kruxel</h1>
        <p className="login-sub">Tu Gestión Integral de Software</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              className="form-control"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2,marginRight:8}}></span> Ingresando...</> : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  )
}
