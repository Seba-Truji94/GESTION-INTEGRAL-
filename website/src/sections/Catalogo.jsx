import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCatalogo } from '../services/api'

gsap.registerPlugin(ScrollTrigger)

const CATEGORIAS = [
  { key: '', label: 'Todos' },
  { key: 'banqueteria', label: 'Banquetería' },
  { key: 'reposteria', label: 'Repostería' },
  { key: 'cocteleria', label: 'Coctelería' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'otro', label: 'Otro' },
]

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default function Catalogo() {
  const section = useRef(null)
  const grid = useRef(null)
  const [productos, setProductos] = useState([])
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getCatalogo(categoria)
      .then(r => setProductos(r.data))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }, [categoria])

  useEffect(() => {
    if (loading || !grid.current) return
    const cards = grid.current.querySelectorAll('.producto-card')
    gsap.from(cards, {
      y: 50, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: grid.current, start: 'top 85%', once: true },
    })
  }, [loading, productos])

  return (
    <section id="catalogo" ref={section} className="py-32 px-6 bg-[#111111]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-3">Nuestro menú</p>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white">Catálogo</h2>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button
                key={c.key}
                onClick={() => setCategoria(c.key)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-300 border ${
                  categoria === c.key
                    ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                    : 'border-white/20 text-white/50 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <p className="text-white/30 text-center py-24 text-lg">No hay productos en esta categoría.</p>
        ) : (
          <div ref={grid} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map(p => (
              <div
                key={p.id}
                className="producto-card group relative bg-[#1A1A1A] border border-white/5 hover:border-[#C9A84C]/40 transition-all duration-500 overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-0 h-px bg-[#C9A84C] group-hover:w-full transition-all duration-500" />

                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] tracking-widest uppercase text-[#C9A84C]/60 border border-[#C9A84C]/20 px-2 py-1">
                      {CATEGORIAS.find(c => c.key === p.categoria)?.label || p.categoria}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3 group-hover:text-[#C9A84C] transition-colors duration-300">
                    {p.nombre}
                  </h3>
                  {p.descripcion && (
                    <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">
                      {p.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[#C9A84C] font-light text-xl">
                      {fmt(p.precio_venta)}
                    </span>
                    <a
                      href="#pedidos"
                      className="text-xs tracking-widest uppercase text-white/40 hover:text-[#C9A84C] transition-colors"
                    >
                      Cotizar →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
