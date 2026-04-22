import { useState, useEffect } from 'react'
import { FiSave, FiRotateCcw } from 'react-icons/fi'
import api from '../services/api'
import Balatro from '../components/Balatro/Balatro'
import LineWaves from '../components/LineWaves/LineWaves'
import Hyperspeed, { hyperspeedPresets } from '../components/Hyperspeed/Hyperspeed'

const DEFAULTS = {
  animation_type: 'balatro',
  color1: '#DE443B',
  color2: '#006BB4',
  color3: '#162325',
  pixel_filter: 745,
  is_rotate: false,
  mouse_interaction: true,
  spin_speed: 7.0,
  spin_rotation: -2.0,
  spin_amount: 0.25,
  spin_ease: 1.0,
  contrast: 3.5,
  lighting: 0.4,
  lw_inner_line_count: 32,
  lw_outer_line_count: 36,
  lw_warp_intensity: 1.0,
  lw_rotation: -45.0,
  lw_edge_fade_width: 0.0,
  lw_color_cycle_speed: 1.0,
  lw_brightness: 0.2,
  lw_mouse_influence: 2.0,
  hs_preset: 'one',
  hs_speed_up: 2.0,
  login_titulo: '',
  login_subtitulo: '',
}

const ANIMATIONS = [
  {
    key: 'balatro',
    label: 'Balatro',
    description: 'Fondo fluido con shader WebGL',
  },
  {
    key: 'linewaves',
    label: 'Line Waves',
    description: 'Ondas animadas con interacción',
  },
  {
    key: 'hyperspeed',
    label: 'Hyperspeed',
    description: 'Efecto de viaje a velocidad de la luz',
  },
]

function SliderField({ label, name, value, min, max, step, onChange }) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 13, color: '#94a3b8' }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', minWidth: 40, textAlign: 'right' }}>
          {parseFloat(value).toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(name, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1' }}
      />
    </div>
  )
}

function ColorField({ label, name, value, onChange }) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(name, e.target.value)}
          style={{ width: 44, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }}
        />
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={e => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(name, v)
          }}
          className="form-control"
          style={{ fontFamily: 'monospace', fontSize: 14, flex: 1 }}
        />
        <div style={{ width: 36, height: 36, borderRadius: 6, background: value, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
      </div>
    </div>
  )
}

function ToggleField({ label, name, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#94a3b8' }}>{label}</label>
      <button
        type="button"
        onClick={() => onChange(name, !value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value ? '#6366f1' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: 9,
          background: '#fff', transition: 'left 0.2s', display: 'block',
        }} />
      </button>
    </div>
  )
}

function AnimationPreview({ form }) {
  if (form.animation_type === 'balatro') {
    return (
      <Balatro
        color1={form.color1}
        color2={form.color2}
        color3={form.color3}
        pixelFilter={form.pixel_filter}
        isRotate={form.is_rotate}
        mouseInteraction={form.mouse_interaction}
        spinSpeed={form.spin_speed}
        spinRotation={form.spin_rotation}
        spinAmount={form.spin_amount}
        spinEase={form.spin_ease}
        contrast={form.contrast}
        lighting={form.lighting}
      />
    )
  }
  if (form.animation_type === 'linewaves') {
    return (
      <LineWaves
        color1={form.color1}
        color2={form.color2}
        color3={form.color3}
        speed={form.spin_speed}
        innerLineCount={form.lw_inner_line_count}
        outerLineCount={form.lw_outer_line_count}
        warpIntensity={form.lw_warp_intensity}
        rotation={form.lw_rotation}
        edgeFadeWidth={form.lw_edge_fade_width}
        colorCycleSpeed={form.lw_color_cycle_speed}
        brightness={form.lw_brightness}
        enableMouseInteraction={form.mouse_interaction}
        mouseInfluence={form.lw_mouse_influence}
      />
    )
  }
  if (form.animation_type === 'hyperspeed') {
    return (
      <Hyperspeed
        effectOptions={{
          ...(hyperspeedPresets[form.hs_preset] || hyperspeedPresets.one),
          speedUp: form.hs_speed_up,
          onSpeedUp: () => {},
          onSlowDown: () => {},
        }}
      />
    )
  }
  return null
}

export default function ConfiguracionLogin() {
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/auth/login-config/')
        setForm({ ...DEFAULTS, ...res.data })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchConfig()
  }, [])

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => setForm(DEFAULTS)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/login-config/', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert('Error al guardar la configuración')
    }
    setSaving(false)
  }

  if (loading) return <div className="loading"><span className="spinner"></span>Cargando...</div>

  const isBalatro = form.animation_type === 'balatro'

  return (
    <div className="page-container">
      <div className="page-header responsive-stack">
        <div>
          <h1 className="page-title">Visual del Login</h1>
          <p className="page-subtitle">Elige la animación y personaliza colores e interacciones</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline w-full-mobile" onClick={handleReset}>
            <FiRotateCcw /> Restablecer
          </button>
          <button className="btn btn-primary w-full-mobile" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} />Guardando...</>
              : saved ? '✓ Guardado'
              : <><FiSave /> Guardar</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px,380px) 1fr', gap: 24, alignItems: 'start' }}>

        {/* Panel de controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selector de animación */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tipo de animación</h3>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ANIMATIONS.map(anim => (
                <button
                  key={anim.key}
                  type="button"
                  onClick={() => handleChange('animation_type', anim.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: form.animation_type === anim.key
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    outline: form.animation_type === anim.key
                      ? '1.5px solid rgba(99,102,241,0.7)'
                      : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: form.animation_type === anim.key ? '#6366f1' : 'rgba(255,255,255,0.2)',
                    boxShadow: form.animation_type === anim.key ? '0 0 6px #6366f1' : 'none',
                  }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: form.animation_type === anim.key ? '#c7d2fe' : '#e2e8f0' }}>
                      {anim.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{anim.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Texto de la tarjeta */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Texto del login</h3>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Nombre de la empresa</label>
                <input
                  type="text"
                  value={form.login_titulo}
                  onChange={e => handleChange('login_titulo', e.target.value)}
                  placeholder="Ej: RyF Banquetería"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Slogan / descripción</label>
                <input
                  type="text"
                  value={form.login_subtitulo}
                  onChange={e => handleChange('login_subtitulo', e.target.value)}
                  placeholder="Ej: Arte en cada evento"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Colores */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Colores</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <ColorField label="Color primario" name="color1" value={form.color1} onChange={handleChange} />
              <ColorField label="Color secundario" name="color2" value={form.color2} onChange={handleChange} />
              <ColorField label="Color de fondo" name="color3" value={form.color3} onChange={handleChange} />
            </div>
          </div>

          {/* Movimiento */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Movimiento</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <ToggleField label="Interacción con mouse" name="mouse_interaction" value={form.mouse_interaction} onChange={handleChange} />
              <SliderField label="Velocidad" name="spin_speed" value={form.spin_speed} min={0} max={20} step={0.5} onChange={handleChange} />
              {isBalatro && <>
                <ToggleField label="Rotación continua" name="is_rotate" value={form.is_rotate} onChange={handleChange} />
                <SliderField label="Cantidad de giro" name="spin_amount" value={form.spin_amount} min={0} max={1} step={0.05} onChange={handleChange} />
                <SliderField label="Rotación base" name="spin_rotation" value={form.spin_rotation} min={-10} max={10} step={0.5} onChange={handleChange} />
                <SliderField label="Suavizado del giro" name="spin_ease" value={form.spin_ease} min={0.1} max={3} step={0.1} onChange={handleChange} />
              </>}
            </div>
          </div>

          {/* Controles específicos LineWaves */}
          {form.animation_type === 'linewaves' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Parámetros Line Waves</h3>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <SliderField label="Líneas internas" name="lw_inner_line_count" value={form.lw_inner_line_count} min={4} max={80} step={1} onChange={handleChange} />
                <SliderField label="Líneas externas" name="lw_outer_line_count" value={form.lw_outer_line_count} min={4} max={80} step={1} onChange={handleChange} />
                <SliderField label="Intensidad de warp" name="lw_warp_intensity" value={form.lw_warp_intensity} min={0} max={5} step={0.1} onChange={handleChange} />
                <SliderField label="Rotación (°)" name="lw_rotation" value={form.lw_rotation} min={-180} max={180} step={5} onChange={handleChange} />
                <SliderField label="Fade de borde" name="lw_edge_fade_width" value={form.lw_edge_fade_width} min={0} max={1} step={0.05} onChange={handleChange} />
                <SliderField label="Velocidad de color" name="lw_color_cycle_speed" value={form.lw_color_cycle_speed} min={0} max={5} step={0.1} onChange={handleChange} />
                <SliderField label="Brillo" name="lw_brightness" value={form.lw_brightness} min={0.01} max={1} step={0.01} onChange={handleChange} />
                <SliderField label="Influencia del mouse" name="lw_mouse_influence" value={form.lw_mouse_influence} min={0} max={10} step={0.5} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Controles específicos Hyperspeed */}
          {form.animation_type === 'hyperspeed' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Presets Hyperspeed</h3>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'one',   label: 'Preset 1', desc: 'Turbulento — Violeta / Cyan' },
                  { key: 'two',   label: 'Preset 2', desc: 'Montaña — Rojo / Gris' },
                  { key: 'three', label: 'Preset 3', desc: 'XY — Rojo / Dorado' },
                  { key: 'four',  label: 'Preset 4', desc: 'Long Race — Rosa / Turquesa' },
                  { key: 'five',  label: 'Preset 5', desc: 'Turbulento — Naranja / Azul' },
                  { key: 'six',   label: 'Preset 6', desc: 'Deep — Rojo / Crema' },
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleChange('hs_preset', p.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: form.hs_preset === p.key
                        ? 'rgba(99,102,241,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      outline: form.hs_preset === p.key
                        ? '1.5px solid rgba(99,102,241,0.7)'
                        : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: form.hs_preset === p.key ? '#6366f1' : 'rgba(255,255,255,0.2)',
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: form.hs_preset === p.key ? '#c7d2fe' : '#e2e8f0' }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <SliderField label="Velocidad de aceleración" name="hs_speed_up" value={form.hs_speed_up} min={0.5} max={8} step={0.5} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Imagen — solo Balatro */}
          {isBalatro && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Imagen</h3>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <SliderField label="Contraste" name="contrast" value={form.contrast} min={0.5} max={8} step={0.1} onChange={handleChange} />
                <SliderField label="Iluminación" name="lighting" value={form.lighting} min={0} max={1} step={0.05} onChange={handleChange} />
                <SliderField label="Filtro de píxeles" name="pixel_filter" value={form.pixel_filter} min={100} max={2000} step={10} onChange={handleChange} />
              </div>
            </div>
          )}
        </div>

        {/* Panel de preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <h3 className="card-title">Vista previa — {ANIMATIONS.find(a => a.key === form.animation_type)?.label}</h3>
            </div>
            <div style={{ position: 'relative', height: 480, background: '#0f172a' }}>
              <AnimationPreview form={form} />
              {/* Mini login card */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(15,23,42,0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16, padding: '28px 32px',
                width: 240, textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px', fontSize: 18, fontWeight: 700, color: '#fff',
                }}>{(form.login_titulo || 'GI').slice(0, 2).toUpperCase()}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 3 }}>{form.login_titulo || 'Gestión Integral'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>{form.login_subtitulo || 'Sistema ERP de Banquetería'}</div>
                <div style={{ height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
                <div style={{ height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                <div style={{ height: 32, borderRadius: 6, background: 'rgba(99,102,241,0.7)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
