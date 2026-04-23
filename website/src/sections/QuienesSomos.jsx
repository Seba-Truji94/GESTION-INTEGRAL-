import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function QuienesSomos({ media = {}, config = {} }) {
  const section = useRef(null)

  // Animaciones de texto — siempre corren, no dependen de media
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.text-line', {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-text', start: 'top 75%' },
      })
      gsap.from('.stat-num', {
        textContent: 0, duration: 2, ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: { trigger: '.stats-row', start: 'top 85%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  // Animaciones de imágenes — corren cuando media carga
  useEffect(() => {
    if (!media.nosotros_banner && !media.nosotros_foto1 && !media.nosotros_foto2) return
    const ctx = gsap.context(() => {
      gsap.from('.reveal-img', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.4, ease: 'power4.inOut', stagger: 0.2,
        scrollTrigger: { trigger: '.reveal-img', start: 'top 80%' },
      })
      gsap.to('.parallax-slow', {
        yPercent: -15, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      })
      gsap.to('.parallax-fast', {
        yPercent: -25, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      })
      ScrollTrigger.refresh()
    }, section)
    return () => ctx.revert()
  }, [media])

  return (
    <section id="nosotros" ref={section} className="bg-[#0A0A0A] overflow-hidden">
      <div className="relative h-[70vh] overflow-hidden">
        <div className="parallax-slow absolute inset-0 scale-110">
          {media.nosotros_banner?.url && (
            media.nosotros_banner.tipo === 'video' ? (
              <video 
                src={media.nosotros_banner.url}
                autoPlay 
                muted 
                loop 
                playsInline
                className="reveal-img w-full h-full object-cover"
                style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              />
            ) : (
              <img
                src={media.nosotros_banner.url}
                alt="Evento"
                className="reveal-img w-full h-full object-cover"
                style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              />
            )
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 h-full flex items-center px-8 md:px-20 max-w-7xl mx-auto">
          <div className="qs-text max-w-xl">
            <p className="text-line text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Quiénes somos</p>
            <h2 className="text-line font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              {config.nosotros_titulo || 'Pasión que se transforma en sabor'}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        <div className="qs-text px-8 md:px-16 py-20 flex flex-col justify-center">
          <p className="text-line text-white/50 text-lg leading-relaxed mb-6">
            {config.nosotros_texto1 || 'En RyF banqueteria creamos experiencias gastronómicas únicas para cada celebración.'}
          </p>
          <p className="text-line text-white/50 text-lg leading-relaxed mb-10">
            {config.nosotros_texto2 || 'Cada detalle importa — desde la selección de ingredientes hasta la presentación final.'}
          </p>
          <div className="stats-row grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { num: config.stat1_num ?? 8,   label: config.stat1_label || 'Años de experiencia' },
              { num: config.stat2_num ?? 500, label: config.stat2_label || 'Eventos realizados' },
              { num: config.stat3_num ?? 12,  label: config.stat3_label || 'Chefs especializados' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-4xl text-[#C9A84C] font-bold">
                  <span className="stat-num">{s.num}</span>+
                </p>
                <p className="text-white/30 text-xs tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-rows-2 h-[400px] md:h-[600px]">
          <div className="overflow-hidden relative bg-[#1a1a1a]">
            <div className="parallax-fast absolute inset-0 scale-125">
              {media.nosotros_foto1?.url ? (
                media.nosotros_foto1.tipo === 'video' ? (
                  <video 
                    src={media.nosotros_foto1.url}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="reveal-img w-full h-full object-cover"
                    style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                  />
                ) : (
                  <img src={media.nosotros_foto1.url} alt="Cocina"
                    className="reveal-img w-full h-full object-cover"
                    style={{ clipPath: 'inset(0% 0% 0% 0%)' }} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'repeating-linear-gradient(45deg,#1a1a1a 0,#1a1a1a 10px,#222 10px,#222 20px)' }}>
                  <p style={{ color:'rgba(255,255,255,.08)', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase' }}>Foto 1</p>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-hidden relative bg-[#111]">
            <div className="parallax-slow absolute inset-0 scale-125">
              {media.nosotros_foto2?.url ? (
                media.nosotros_foto2.tipo === 'video' ? (
                  <video 
                    src={media.nosotros_foto2.url}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="reveal-img w-full h-full object-cover"
                    style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                  />
                ) : (
                  <img src={media.nosotros_foto2.url} alt="Tabla"
                    className="reveal-img w-full h-full object-cover"
                    style={{ clipPath: 'inset(0% 0% 0% 0%)' }} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'repeating-linear-gradient(45deg,#111 0,#111 10px,#181818 10px,#181818 20px)' }}>
                  <p style={{ color:'rgba(255,255,255,.08)', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase' }}>Foto 2</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
