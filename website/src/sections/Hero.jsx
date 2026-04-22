import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ media = {}, config = {} }) {
  const section  = useRef(null)
  const bgRef    = useRef(null)
  const line1    = useRef(null)
  const line2    = useRef(null)
  const line3    = useRef(null)
  const ctaRef   = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    // Todos los elementos visibles por defecto — animación es un bonus
    const els = [line1.current, line2.current, line3.current]
    gsap.set(els, { opacity: 1, y: 0 })
    gsap.set(ctaRef.current.children, { opacity: 1, y: 0 })

    const tl = gsap.timeline({ delay: 0.2 })
    tl.from(bgRef.current, { scale: 1.12, duration: 2.2, ease: 'power3.out' })
      .from(line1.current, { y: 40, opacity: 0, duration: 0.9, ease: 'power4.out' }, '-=1.6')
      .from(line2.current, { y: 60, opacity: 0, duration: 1,   ease: 'power4.out' }, '-=0.75')
      .from(line3.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
      .from(ctaRef.current.children, { y: 20, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from(scrollRef.current, { opacity: 0, duration: 0.5 }, '-=0.2')

    // Parallax fondo al scroll
    gsap.to(bgRef.current, {
      yPercent: 25, ease: 'none',
      scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true },
    })

    // Texto se va al hacer scroll
    gsap.to(els, {
      y: -50, opacity: 0,
      scrollTrigger: { trigger: section.current, start: 'top top', end: '35% top', scrub: 1 },
    })
  }, [])

  const marca = config.nombre_marca || 'KRUXEL'

  return (
    <section id="hero" ref={section} className="relative h-screen w-full overflow-hidden flex items-center justify-center">

      {/* Fondo */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        {media.hero_video ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={media.hero_video.url} type="video/mp4" />
          </video>
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

        <h1 ref={line2} className="font-display text-7xl md:text-[10rem] lg:text-[13rem] font-bold text-white leading-none tracking-tight mb-4">
          {marca}
        </h1>

        <p ref={line3} className="font-display italic text-2xl md:text-4xl text-white/70 font-light mb-10">
          {config.hero_subtitulo || 'Arte en cada evento'}
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#catalogo" className="btn-gold-fill font-light tracking-widest">Ver catálogo</a>
          <a href="#pedidos" className="btn-gold font-light tracking-widest">Solicitar cotización</a>
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
