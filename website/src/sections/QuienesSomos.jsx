import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function QuienesSomos() {
  const section = useRef(null)
  const textRef = useRef(null)
  const img1 = useRef(null)
  const img2 = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current.children, {
        y: 60, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: textRef.current, start: 'top 80%' },
      })
      gsap.from(img1.current, {
        y: 80, opacity: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: img1.current, start: 'top 85%' },
      })
      gsap.from(img2.current, {
        y: 120, opacity: 0, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: img2.current, start: 'top 85%' },
      })
      // Parallax on images
      gsap.to(img1.current, {
        y: -60,
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      })
      gsap.to(img2.current, {
        y: -30,
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section id="nosotros" ref={section} className="py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        {/* Text */}
        <div ref={textRef} className="space-y-8">
          <p className="text-[#C9A84C] text-sm tracking-widest uppercase">Quiénes somos</p>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
            Pasión que se transforma en sabor
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            En KRUXEL creamos experiencias gastronómicas únicas para cada celebración.
            Desde bodas íntimas hasta grandes eventos corporativos, nuestra cocina
            combina técnica francesa con ingredientes locales de temporada.
          </p>
          <p className="text-white/60 text-lg leading-relaxed">
            Cada detalle importa — desde la selección de ingredientes hasta la
            presentación final — porque sabemos que los momentos que vivís merecen
            algo verdaderamente especial.
          </p>
          <a href="#catalogo" className="btn-gold inline-block">Conoce nuestro menú</a>
        </div>

        {/* Images with parallax */}
        <div className="relative h-[600px]">
          <div
            ref={img1}
            className="absolute top-0 right-0 w-3/4 h-80 bg-[#1A1A1A] overflow-hidden"
            style={{ backgroundImage: 'url(/videos/foto1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/10 to-transparent" />
          </div>
          <div
            ref={img2}
            className="absolute bottom-0 left-0 w-3/5 h-72 bg-[#1A1A1A] overflow-hidden"
            style={{ backgroundImage: 'url(/videos/foto2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="w-full h-full bg-gradient-to-tl from-black/40 to-transparent" />
          </div>
          {/* Decorative line */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-[#C9A84C]/30" />
        </div>
      </div>
    </section>
  )
}
