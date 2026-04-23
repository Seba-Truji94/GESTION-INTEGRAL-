import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getDatosTransferencia } from '../services/api'
import { FiCopy, FiCheck } from 'react-icons/fi'

gsap.registerPlugin(ScrollTrigger)

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5">
      <div>
        <p className="text-xs tracking-widest uppercase text-white/30 mb-1">{label}</p>
        <p className="text-white text-lg">{value}</p>
      </div>
      <button onClick={copy} className="p-2 text-white/30 hover:text-[#C9A84C] transition-colors" aria-label="Copiar">
        {copied ? <FiCheck className="text-[#C9A84C]" /> : <FiCopy />}
      </button>
    </div>
  )
}

export default function Pago() {
  const section = useRef(null)
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    getDatosTransferencia()
      .then(r => {
        const lista = r.data.results || r.data
        const activo = lista.find(d => d.activo)
        setDatos(activo || null)
      })
      .catch(() => setDatos(null))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pago-content > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 80%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section id="pago" ref={section} className="py-20 md:py-32 px-6 bg-[#111111]">
      <div className="max-w-2xl mx-auto pago-content">
        <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-3">Pago</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Datos de transferencia
        </h2>
        <p className="text-white/50 mb-12">
          Una vez coordinado tu evento, realiza el pago mediante transferencia bancaria con los siguientes datos.
          Envía el comprobante al coordinarte con nosotros.
        </p>

        {!datos ? (
          <p className="text-white/30 text-center py-12">Cargando datos bancarios...</p>
        ) : (
          <div className="bg-[#1A1A1A] border border-white/10 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#C9A84C]" />
              <p className="text-[#C9A84C] font-display text-xl">{datos.banco}</p>
            </div>
            <CopyField label="Titular" value={datos.titular} />
            <CopyField label="RUT" value={datos.rut} />
            <CopyField label="Tipo de cuenta" value={datos.tipo_cuenta} />
            <CopyField label="N° de cuenta" value={datos.numero_cuenta} />
            {datos.email && <CopyField label="Email de confirmación" value={datos.email} />}
          </div>
        )}

        <p className="text-white/30 text-sm mt-6 text-center">
          Siempre incluye tu nombre y fecha de evento en el comentario de la transferencia.
        </p>
      </div>
    </section>
  )
}
