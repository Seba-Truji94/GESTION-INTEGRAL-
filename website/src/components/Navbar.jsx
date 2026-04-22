import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const LINKS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Pedidos', href: '#pedidos' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar({ config = {} }) {
  const nav = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    gsap.from(nav.current, { y: -80, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' })
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
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
            : (config.nombre_marca && config.nombre_marca !== 'KRUXEL') ? config.nombre_marca : 'RyF banqueteria'
          }

        </a>

        {/* Desktop */}
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

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
        >
          <span className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-px bg-white transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-md px-6 py-8 flex flex-col gap-6">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-lg tracking-widest uppercase text-white/80 hover:text-[#C9A84C] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
