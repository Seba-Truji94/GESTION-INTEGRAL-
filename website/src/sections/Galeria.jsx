import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function MobileGallery({ fotos }) {
  return (
    <div style={{ background: '#111111', padding: '48px 16px' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 10 }}>
          Nuestra obra
        </p>
        <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(2rem,8vw,3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, margin: 0 }}>
          Cada<br />
          <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.4)' }}>detalle</span><br />
          importa
        </h2>
      </div>

      {fotos.length === 0 ? (
        <div style={{ width: '100%', height: 180, border: '1px dashed rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Sin fotos — agregar desde Admin → Media
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {fotos.map((f, i) => {
            const featured = i % 3 === 0
            return (
              <div
                key={f.id ?? i}
                style={{
                  position: 'relative',
                  gridColumn: featured ? 'span 2' : 'span 1',
                  height: featured ? '52vw' : '40vw',
                  overflow: 'hidden',
                  background: '#1a1a1a',
                }}
              >
                {f.tipo === 'video' ? (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
                    <source src={f.url} type="video/mp4" />
                  </video>
                ) : (
                  <img src={f.url} alt={f.label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 9, fontWeight: 300 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DesktopGallery({ fotos, pinRef, trackRef }) {
  return (
    <div ref={pinRef} style={{ background: '#111111', overflow: 'hidden' }}>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
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

          {fotos.length === 0 ? (
            <div style={{ width: '70vw', height: '30vh', border: '1px dashed rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Sin fotos de galería — agregar desde Admin → Media
              </p>
            </div>
          ) : fotos.map((f, i) => (
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
              <div
                style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 50%)', opacity: 0, transition: 'opacity .4s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                  <p style={{ color: '#fff', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>{f.label}</p>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 10, fontWeight: 300 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}

          <div style={{ flexShrink: 0, width: 80 }} />
        </div>
      </div>
    </div>
  )
}

export default function Galeria({ media = {} }) {
  const FOTOS = media.galeria?.length ? media.galeria : []
  const VIDEO = media.galeria_video ?? null

  const pinRef   = useRef(null)
  const trackRef = useRef(null)
  const videoRef = useRef(null)

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  // Debounced resize listener
  useEffect(() => {
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setIsMobile(window.innerWidth < 768), 150)
    }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [])

  // Desktop only: GSAP horizontal pin (unchanged logic)
  useLayoutEffect(() => {
    if (FOTOS.length === 0 || isMobile) return

    const track = trackRef.current
    const pin   = pinRef.current
    if (!track || !pin) return

    const ctx = gsap.context(() => {
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
  }, [FOTOS.length, isMobile])

  // Video showcase animation (both mobile + desktop)
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
      {isMobile
        ? <MobileGallery fotos={FOTOS} />
        : <DesktopGallery fotos={FOTOS} pinRef={pinRef} trackRef={trackRef} />
      }

      {/* Video showcase — same on mobile and desktop */}
      <section ref={videoRef} style={{ background: '#0a0a0a', padding: '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="gal-video-label" style={{ marginBottom: 32 }}>
            <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>
              En movimiento
            </p>
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>
              Así vivimos<br />
              <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.4)' }}>cada evento</span>
            </h2>
          </div>

          <div className="gal-video-inner" style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#1a1a1a' }}>
            {VIDEO ? (
              <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
                <source src={VIDEO.url} type="video/mp4" />
              </video>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,.08)', gap: 12, minHeight: 200 }}>
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
