import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCatalogo } from '../services/api'
import { FiShoppingBag } from 'react-icons/fi'

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

export default function Catalogo({ seleccion, onToggle }) {
  const section = useRef(null)
  const titleRef = useRef(null)
  const [productos, setProductos] = useState([])
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    setLoading(true)
    getCatalogo(categoria)
      .then(r => setProductos(r.data))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }, [categoria])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cat-title > *', {
        y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.cat-title', start: 'top 80%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from('.prod-card', {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: '.prod-grid', start: 'top 85%', once: true },
      })
    }, section)
    return () => ctx.revert()
  }, [loading, productos])

  return (
    <section id="catalogo" ref={section} className="py-32 bg-[#0A0A0A]">
      {/* Header */}
      <div className="cat-title px-8 md:px-20 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-7xl mx-auto">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Nuestro menú</p>
          <h2 className="font-display text-6xl md:text-8xl font-bold text-white leading-none">Catálogo</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map(c => (
            <button
              key={c.key}
              onClick={() => setCategoria(c.key)}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 border ${
                categoria === c.key
                  ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                  : 'border-white/15 text-white/40 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/5 mb-0" />

      {/* Grid tipo lista elegante */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-6 h-6 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : productos.length === 0 ? (
        <p className="text-white/20 text-center py-32 tracking-widest uppercase text-sm">Sin productos en esta categoría</p>
      ) : (
        <div className="prod-grid max-w-7xl mx-auto">
          {productos.map((p, i) => (
            <div
              key={p.id}
              className={`prod-card relative border-b border-white/5 transition-all duration-300 cursor-pointer ${
                seleccion.find(s => s.id === p.id) ? 'bg-[#C9A84C]/5 border-[#C9A84C]/20' : 'hover:border-white/10 hover:bg-white/[0.02]'
              }`}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-center justify-between px-8 md:px-20 py-8 gap-6">
                {/* Imagen/Miniatura */}
                <div className="hidden sm:block w-12 h-12 flex-shrink-0 overflow-hidden relative">
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className="w-full h-full object-cover opacity-60 transition-opacity duration-500" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10">
                      <FiShoppingBag size={14} />
                    </div>
                  )}
                </div>

                {/* Nombre */}
                <h3 className="flex-1 font-display text-2xl md:text-3xl text-white transition-colors duration-300">
                  {p.nombre}
                </h3>

                {/* Descripción corta siempre visible */}
                {p.descripcion && (
                  <span className="hidden lg:block text-white/30 text-xs max-w-xs truncate flex-shrink-0">
                    {p.descripcion}
                  </span>
                )}

                {/* Categoría */}
                <span className="hidden md:block text-[10px] tracking-[0.3em] uppercase text-white/25 flex-shrink-0">
                  {CATEGORIAS.find(c => c.key === p.categoria)?.label || p.categoria}
                </span>

                {/* Precio */}
                <span className="font-light text-xl text-white/60 transition-colors duration-300 flex-shrink-0">
                  {fmt(p.precio_venta)}
                </span>

                {/* Expand indicator */}
                {p.descripcion && (
                  <span className="text-white/20 text-xs flex-shrink-0 transition-transform duration-300" style={{ transform: expanded === i ? 'rotate(45deg)' : 'none' }}>+</span>
                )}

                {/* CTA Agregar */}
                <button
                  onClick={e => { e.stopPropagation(); onToggle(p) }}
                  className={`flex-shrink-0 w-10 h-10 border flex items-center justify-center transition-all duration-300 ${
                    seleccion.find(s => s.id === p.id)
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-black'
                      : 'border-white/10 text-white/20 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]'
                  }`}
                  title={seleccion.find(s => s.id === p.id) ? 'Quitar de la lista' : 'Agregar a la cotización'}
                >
                  {seleccion.find(s => s.id === p.id) ? '✓' : '+'}
                </button>
              </div>

              {/* Descripción completa expandible al click */}
              {p.descripcion && (
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{ maxHeight: expanded === i ? 120 : 0 }}
                >
                  <p className="px-8 md:px-20 pb-8 text-white/40 text-sm leading-relaxed pl-[4.5rem] md:pl-[5.5rem] border-t border-white/5 pt-4">
                    {p.descripcion}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA inferior */}
      <div className="text-center mt-20">
        <a href="#pedidos" className="btn-gold">Solicitar cotización personalizada</a>
      </div>
    </section>
  )
}
