import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { crearSolicitud } from '../services/api'

gsap.registerPlugin(ScrollTrigger)

const emptyForm = () => ({
  nombre_cliente: '',
  email: '',
  telefono: '',
  fecha_evento: '',
  pax: '',
  descripcion: '',
})

export default function Pedido({ onPedidoEnviado, seleccion, onClear }) {
  const section = useRef(null)
  const formRef = useRef(null)
  const [form, setForm] = useState(emptyForm())
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pedido-content > *', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 75%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      // Concatenar productos seleccionados a la descripción
      const listaProductos = seleccion.length > 0 
        ? `\n\nPRODUCTOS INTERÉS:\n- ${seleccion.map(p => p.nombre).join('\n- ')}`
        : ''
      
      const payload = { 
        ...form, 
        pax: Number(form.pax) || 0,
        descripcion: form.descripcion + listaProductos
      }

      await crearSolicitud(payload)
      setSent(true)
      setForm(emptyForm())
      onClear?.() // Limpiar selección al éxito
      onPedidoEnviado?.()
    } catch {
      setError('Hubo un problema al enviar tu solicitud. Intenta de nuevo.')
    }
    setSending(false)
  }

  return (
    <section id="pedidos" ref={section} className="py-20 md:py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto pedido-content">
        <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-3">Hablemos</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
          Solicita tu cotización
        </h2>
        <p className="text-white/50 mb-12 text-lg">
          Cuéntanos sobre tu evento y te respondemos a la brevedad con una propuesta personalizada.
        </p>

        {sent ? (
          <div className="border border-[#C9A84C]/40 bg-[#C9A84C]/5 p-10 text-center">
            <p className="font-display text-3xl text-[#C9A84C] mb-3">¡Solicitud enviada!</p>
            <p className="text-white/60 mb-8">
              Recibimos tu pedido. Nos contactaremos contigo muy pronto para coordinar los detalles.
            </p>
            <a href="#pago" className="btn-gold-fill">Ver datos de transferencia</a>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Lista de productos seleccionados */}
            {seleccion.length > 0 && (
              <div className="mb-8 p-6 border border-[#C9A84C]/20 bg-[#C9A84C]/5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C] mb-4">Tu selección de productos:</p>
                <div className="flex flex-wrap gap-2">
                  {seleccion.map(p => (
                    <span key={p.id} className="text-xs px-3 py-1 bg-white/5 text-white/70 border border-white/10">
                      {p.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Nombre completo" name="nombre_cliente" value={form.nombre_cliente} onChange={handleChange} required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+56 9 ..." />
              <Field label="Fecha del evento" name="fecha_evento" type="date" value={form.fecha_evento} onChange={handleChange} required />
              <Field label="N° de personas (pax)" name="pax" type="number" min="1" value={form.pax} onChange={handleChange} placeholder="Ej: 50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest uppercase text-white/40">
                ¿Qué necesitas? <span className="text-[#C9A84C]">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe el tipo de evento, servicio que buscas, productos de interés..."
                className="bg-[#1A1A1A] border border-white/10 focus:border-[#C9A84C] text-white placeholder-white/20 px-5 py-4 text-sm outline-none transition-colors duration-300 resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={sending} className="btn-gold-fill w-full">
              {sending ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function Field({ label, name, type = 'text', value, onChange, required, placeholder, min }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-widest uppercase text-white/40">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        className="bg-[#1A1A1A] border border-white/10 focus:border-[#C9A84C] text-white placeholder-white/20 px-5 py-4 text-sm outline-none transition-colors duration-300"
      />
    </div>
  )
}
