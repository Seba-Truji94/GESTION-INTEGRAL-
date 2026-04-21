import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FiInstagram, FiFacebook, FiMail, FiPhone } from 'react-icons/fi'

gsap.registerPlugin(ScrollTrigger)

export default function Contacto() {
  const section = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contacto-item', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 80%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contacto" ref={section} className="py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-3 contacto-item">Contacto</p>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 contacto-item">
              Estamos para ti
            </h2>
            <p className="text-white/50 text-lg mb-12 contacto-item">
              ¿Tienes preguntas o quieres coordinar tu evento? Escríbenos por el canal que prefieras.
            </p>

            <div className="space-y-6">
              <a href="mailto:contacto@kruxel.cl" className="contacto-item flex items-center gap-4 text-white/60 hover:text-[#C9A84C] transition-colors group">
                <span className="w-10 h-10 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center transition-colors">
                  <FiMail />
                </span>
                <span>contacto@kruxel.cl</span>
              </a>
              <a href="tel:+56900000000" className="contacto-item flex items-center gap-4 text-white/60 hover:text-[#C9A84C] transition-colors group">
                <span className="w-10 h-10 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center transition-colors">
                  <FiPhone />
                </span>
                <span>+56 9 0000 0000</span>
              </a>
              <a href="https://instagram.com/kruxel" target="_blank" rel="noopener noreferrer" className="contacto-item flex items-center gap-4 text-white/60 hover:text-[#C9A84C] transition-colors group">
                <span className="w-10 h-10 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center transition-colors">
                  <FiInstagram />
                </span>
                <span>@kruxel</span>
              </a>
              <a href="https://facebook.com/kruxel" target="_blank" rel="noopener noreferrer" className="contacto-item flex items-center gap-4 text-white/60 hover:text-[#C9A84C] transition-colors group">
                <span className="w-10 h-10 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center transition-colors">
                  <FiFacebook />
                </span>
                <span>KRUXEL</span>
              </a>
            </div>
          </div>

          {/* ManyChat widget placeholder */}
          <div className="contacto-item">
            <div className="bg-[#1A1A1A] border border-white/5 p-8">
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-4">Chat en vivo</p>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                También puedes escribirnos directamente por Instagram o Facebook Messenger.
                Nuestro equipo responde en horario hábil.
              </p>
              {/* ManyChat: reemplaza el div de abajo con el script de ManyChat cuando lo configures */}
              <div id="manychat-widget" className="min-h-[120px] flex items-center justify-center border border-dashed border-white/10">
                <p className="text-white/20 text-xs tracking-widest uppercase">Widget ManyChat aquí</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
