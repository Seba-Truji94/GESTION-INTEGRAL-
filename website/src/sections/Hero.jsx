import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const container = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 })
    tl.from(overlayRef.current, { opacity: 1, duration: 1.2, ease: 'power2.inOut' })
      .from(titleRef.current.children, {
        y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: 'power4.out',
      }, '-=0.4')
      .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
  }, [])

  return (
    <section id="hero" ref={container} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div ref={overlayRef} className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div ref={titleRef} className="overflow-hidden mb-6">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-none tracking-tight">
            <span className="block">Arte en</span>
            <span className="block text-[#C9A84C] italic">cada evento</span>
          </h1>
        </div>
        <p ref={subtitleRef} className="text-white/70 text-lg md:text-xl font-light tracking-wide mb-10 max-w-xl mx-auto">
          Banquetería y repostería de alta categoría para momentos que merecen lo mejor
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#catalogo" className="btn-gold-fill">Ver catálogo</a>
          <a href="#pedidos" className="btn-gold">Solicitar cotización</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
