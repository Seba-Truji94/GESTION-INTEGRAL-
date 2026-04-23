import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ media = {}, config = {} }) {
  const section = useRef(null)
  const bgRef = useRef(null)
  const line1 = useRef(null)
  const line2 = useRef(null)
  const line3 = useRef(null)
  const ctaRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Estado inicial: TODO visible y en su sitio
      const els = [line1.current, line2.current, line3.current, ctaRef.current]
      gsap.set(els, { opacity: 1, y: 0 })
      
      // Animación de entrada mucho más sutil o instantánea
      gsap.from(els, { 
        opacity: 0, 
        y: 10, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: 'power2.out' 
      })

      // Parallax fondo al scroll
      gsap.to(bgRef.current, {
        yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      // Animación de SALIDA (hacia arriba y transparente) ajustada
      gsap.to([line1.current, line3.current, ctaRef.current], {
        opacity: 0,
        y: -100,
        scrollTrigger: {
          trigger: section.current,
          start: '5% top', // Empieza a desaparecer casi de inmediato al bajar
          end: '40% top',
          scrub: 1
        }
      })

      // El nombre principal se desvanece un poco después
      gsap.to(line2.current, {
        opacity: 0,
        scale: 0.85,
        y: -50,
        scrollTrigger: {
          trigger: section.current,
          start: '15% top',
          end: '60% top',
          scrub: 1.5
        }
      })
    })

    return () => ctx.revert()
  }, [])


  const marca = (config.nombre_marca && config.nombre_marca !== 'KRUXEL') 
                ? config.nombre_marca 
                : 'RyF banqueteria'


  return (
    <section id="hero" ref={section} className="relative h-screen w-full overflow-hidden flex items-center justify-center">

      {/* Fondo */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        {media.hero_video ? (
          <video 
            src={media.hero_video.url}
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : media.hero_imagen ? (
          <img src={media.hero_imagen.url} alt={marca} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#111]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
      </div>

      {/* Contenido — sin overflow-hidden para evitar clip */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto w-full">
        <p ref={line1} className="text-[#C9A84C] text-sm md:text-base tracking-[0.4em] uppercase mb-6">
          {config.eslogan || 'Banquetería & Repostería'}
        </p>

        <h1 ref={line2} className="font-display font-bold text-white leading-none tracking-tight mb-4"
          style={{ fontSize: 'clamp(2.8rem, 10vw, 11rem)' }}>
          {marca}
        </h1>

        <p ref={line3} className="font-display italic text-2xl md:text-4xl text-white/70 font-light mb-10">
          {config.hero_subtitulo || 'Arte en cada evento'}
        </p>

        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-6 mt-4">
          <a href="#catalogo" className="btn-gold-fill tracking-[0.2em]">Ver catálogo</a>
          <a href="#pedidos" className="btn-gold tracking-[0.2em]">Solicitar cotización</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">Descubrir</span>
        <div className="relative w-px h-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C] to-transparent animate-[fall_1.5s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  )
}
