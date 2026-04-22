import { useState, useEffect, useRef, memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Balatro from '../components/Balatro/Balatro'
import LineWaves from '../components/LineWaves/LineWaves'
import Hyperspeed, { hyperspeedPresets } from '../components/Hyperspeed/Hyperspeed'

// Memoized so it never re-renders when the form state (username/password) changes
const AnimationBackground = memo(function AnimationBackground({ config }) {
  const hyperspeedOptions = useMemo(() => {
    if (!config || config.animation_type !== 'hyperspeed') return null
    return {
      ...(hyperspeedPresets[config.hs_preset] || hyperspeedPresets.one),
      speedUp: config.hs_speed_up ?? 2,
      onSpeedUp: () => {},
      onSlowDown: () => {},
    }
  }, [config])

  if (!config) return null

  if (config.animation_type === 'balatro') {
    return (
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
    )
  }

  if (config.animation_type === 'linewaves') {
    return (
      <LineWaves
        color1={config.color1}
        color2={config.color2}
        color3={config.color3}
        speed={config.spin_speed}
        innerLineCount={config.lw_inner_line_count}
        outerLineCount={config.lw_outer_line_count}
        warpIntensity={config.lw_warp_intensity}
        rotation={config.lw_rotation}
        edgeFadeWidth={config.lw_edge_fade_width}
        colorCycleSpeed={config.lw_color_cycle_speed}
        brightness={config.lw_brightness}
        enableMouseInteraction={config.mouse_interaction}
        mouseInfluence={config.lw_mouse_influence}
      />
    )
  }

  if (config.animation_type === 'hyperspeed') {
    return <Hyperspeed effectOptions={hyperspeedOptions} />
  }

  return null
})

export default function Login({ onLogin }) {
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
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
      const tokenRes = await api.post('/auth/login/', {
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      })
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
      <AnimationBackground config={config} />

      <div className="login-card login-glass">
        <div className="login-logo">{config?.login_titulo ? config.login_titulo.slice(0, 2).toUpperCase() : 'GI'}</div>
        <h1 className="login-title">{config?.login_titulo || 'Gestión Integral'}</h1>
        <p className="login-sub">{config?.login_subtitulo || 'Sistema ERP de Banquetería'}</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              ref={usernameRef}
              type="text"
              className="form-control"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              placeholder="Ingresa tu usuario"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              ref={passwordRef}
              type="password"
              className="form-control"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
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
