import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Galeria({ media = {} }) {
  const FOTOS = media.galeria?.length ? media.galeria : []
  const VIDEO = media.galeria_video ?? null

  const pinRef   = useRef(null)   // elemento que se pina
  const trackRef = useRef(null)   // track que se mueve horizontal

  const videoRef  = useRef(null)  // sección video (fuera del pin)

  // Scroll horizontal pinned
  useEffect(() => {
    if (FOTOS.length === 0) return

    const track = trackRef.current
    const pin   = pinRef.current

    const ctx = gsap.context(() => {
      // Esperamos un tick para que el DOM tenga tamaño real
      ScrollTrigger.refresh()
      const distance = track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => ctx.revert()
  }, [FOTOS.length])

  // Animación de entrada video showcase
  useEffect(() => {
    if (!VIDEO) return
    const ctx = gsap.context(() => {
      gsap.from('.gal-video-inner', {
        scale: 1.08, opacity: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: videoRef.current, start: 'top 80%' },
      })
      gsap.from('.gal-video-label > *', {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: videoRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [VIDEO])

  return (
    <>
      {/* ── SECCIÓN PINNED (scroll horizontal) ── */}
      <div ref={pinRef} style={{ background: '#111111', overflow: 'hidden' }}>
        <div style={{ height: FOTOS.length === 0 ? '40vh' : '100vh', display: 'flex', alignItems: 'center' }}>

          {/* Track: header + fotos en fila */}
          <div
            ref={trackRef}
            style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 0, willChange: 'transform', flexShrink: 0 }}
          >
            {/* Header lateral */}
            <div style={{ flexShrink: 0, width: 280, paddingLeft: 64, paddingRight: 24 }}>
              <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>
                Nuestra obra
              </p>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, margin: 0 }}>
                Cada<br />
                <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.4)' }}>detalle</span><br />
                importa
              </h2>
            </div>

            {/* Fotos */}
            {FOTOS.length === 0 ? (
              <div style={{ width: '70vw', height: '30vh', border: '1px dashed rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                  Sin fotos de galería — agregar desde Admin → Media
                </p>
              </div>
            ) : FOTOS.map((f, i) => (
              <div
                key={f.id ?? i}
                className="gal-item"
                style={{
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  width: i % 3 === 0 ? '42vw' : '30vw',
                  height: i % 2 === 0 ? '72vh' : '60vh',
                  borderRadius: 4,
                }}
              >
                {f.tipo === 'video' ? (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s', display: 'block' }}>
                    <source src={f.url} type="video/mp4" />
                  </video>
                ) : (
                  <img src={f.url} alt={f.label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s', display: 'block' }} />
                )}
                {/* Overlay hover */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 50%)', opacity: 0, transition: 'opacity .4s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                    <p style={{ color: '#fff', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>{f.label}</p>
                  </div>
                </div>
                {/* Número */}
                <div style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 10, fontWeight: 300 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}

            {/* Padding final para que la última foto llegue a buen punto */}
            <div style={{ flexShrink: 0, width: 80 }} />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN VIDEO SHOWCASE ── */}
      <section ref={videoRef} style={{ background: '#0a0a0a', padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
          <div className="gal-video-label" style={{ marginBottom: 40 }}>
            <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>
              En movimiento
            </p>
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>
              Así vivimos<br />
              <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.4)' }}>cada evento</span>
            </h2>
          </div>

          <div className="gal-video-inner" style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#1a1a1a' }}>
            {VIDEO ? (
              <video
                autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              >
                <source src={VIDEO.url} type="video/mp4" />
              </video>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,.08)', gap: 12, minHeight: 300 }}>
                <div style={{ width: 56, height: 56, border: '1px solid rgba(255,255,255,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 20 }}>▶</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,.15)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
                  Sube un video en Admin → Galería — Video showcase
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
