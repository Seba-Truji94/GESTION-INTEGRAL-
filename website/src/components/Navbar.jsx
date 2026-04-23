import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const LINKS = [
  { label: 'Inicio',   href: '#hero' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Pedidos',  href: '#pedidos' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar({ config = {} }) {
  const nav        = useRef(null)
  const overlayRef = useRef(null)
  const linksRef   = useRef([])
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  // Entry animation (unchanged)
  useEffect(() => {
    gsap.from(nav.current, { y: -80, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' })
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fullscreen overlay open/close animation
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    if (open) {
      document.body.style.overflow = 'hidden'
      gsap.set(overlay, { display: 'flex' })
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(linksRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      )
    } else {
      gsap.to(overlay, {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' })
          document.body.style.overflow = ''
        },
      })
    }
  }, [open])

  useEffect(() => () => { document.body.style.overflow = '' }, [])

  const closeMenu = () => setOpen(false)

  return (
    <>
      <nav
        ref={nav}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#hero" className="font-display text-2xl tracking-widest text-white">
            {config.logo_url
              ? <img src={config.logo_url} alt={config.nombre_marca} className="h-8 object-contain" />
              : config.nombre_marca || 'KRUXEL'
            }
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex gap-10">
            {LINKS.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm tracking-widest uppercase text-white/70 hover:text-[#C9A84C] transition-colors duration-300"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Hamburger — z-[101] stays above overlay */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 relative z-[101]"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            <span className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Fullscreen mobile overlay */}
      <div
        ref={overlayRef}
        className="md:hidden fixed inset-0 z-[100] bg-black/97 backdrop-blur-md"
        style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        aria-hidden={!open}
      >
        <nav className="flex flex-col items-center gap-10">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              ref={el => { linksRef.current[i] = el }}
              onClick={closeMenu}
              className="font-display text-4xl font-bold tracking-widest uppercase text-white hover:text-[#C9A84C] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#C9A84C] to-transparent" />
      </div>
    </>
  )
}
