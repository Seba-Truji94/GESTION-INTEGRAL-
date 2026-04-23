import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCatalogo } from '../services/api'
import { FiShoppingBag, FiArrowUp } from 'react-icons/fi'

gsap.registerPlugin(ScrollTrigger)

const U = (id) => `https://images.unsplash.com/photo-${id}?w=400&auto=format&fit=crop&q=80`

const DEMO_PRODUCTOS = [
  { id: 1, nombre: 'Torta Naked Cake', descripcion: 'Torta de bizcocho húmedo con relleno de manjar y frutos rojos frescos. Decoración rústica con flores comestibles.', imagen: U('1565299543923-37dd37887442'), categoria: 'reposteria', precio_venta: 38000, ingredientes: [] },
  { id: 2, nombre: 'Macarons Franceses', descripcion: 'Selección de 12 macarons artesanales en sabores de temporada: frambuesa, chocolate, pistacho y vainilla.', imagen: U('1558326567-6cb58d57c6c0'), categoria: 'reposteria', precio_venta: 18000, ingredientes: [] },
  { id: 3, nombre: 'Cheesecake de Berries', descripcion: 'Base crocante de galleta, relleno cremoso de queso Philadelphia y coulis de berries casero.', imagen: U('1571115177098-24ec42ed204d'), categoria: 'reposteria', precio_venta: 28000, ingredientes: [] },
  { id: 4, nombre: 'Cena 3 Tiempos', descripcion: 'Entrada, plato de fondo y postre. Menú personalizable según temporada. Incluye mise en place completo.', imagen: U('1414235077428-338989a2e8c0'), categoria: 'banqueteria', precio_venta: 18500, ingredientes: [] },
  { id: 5, nombre: 'Brunch Gourmet', descripcion: 'Mesa de brunch completa con huevos benedictinos, pan artesanal, fruta de temporada y jugos naturales. Por persona.', imagen: U('1504674900247-0877df9cc836'), categoria: 'banqueteria', precio_venta: 12000, ingredientes: [] },
  { id: 6, nombre: 'Finger Foods x 20', descripcion: 'Selección de 20 piezas: brochetas, mini sándwiches, crostini y tartaletas saladas. Ideal para cócteles.', imagen: U('1555244162-803834f70033'), categoria: 'banqueteria', precio_venta: 22000, ingredientes: [] },
  { id: 7, nombre: 'Asado Cordero al Palo', descripcion: 'Cordero entero a las brasas, 8 horas de cocción lenta. Incluye ensaladas, panes y chimichurri casero. Por persona.', imagen: U('1467003909585-2f8a72700288'), categoria: 'banqueteria', precio_venta: 25000, ingredientes: [] },
  { id: 8, nombre: 'Pisco Sour Premium', descripcion: 'Pisco ABA 40°, limón de pica, clara de huevo y angostura. Preparación en vivo por barman. Por persona por hora.', imagen: U('1527529482837-4698179dc6ce'), categoria: 'cocteleria', precio_venta: 8500, ingredientes: [] },
  { id: 9, nombre: 'Barra de Cócteles', descripcion: 'Barra completa con 5 cócteles de la carta + mocktails. Barman con hielos, vasos y decoraciones. 3 horas.', imagen: U('1551782450-a2132b4ba21d'), categoria: 'cocteleria', precio_venta: 95000, ingredientes: [] },
  { id: 10, nombre: 'Sangría de la Casa', descripcion: 'Sangría artesanal con vino tinto, naranja, manzana, canela y toque de brandy. Jarra de 2 litros.', imagen: U('1544145945-f90425340c7e'), categoria: 'bebidas', precio_venta: 14000, ingredientes: [] },
  { id: 11, nombre: 'Aguas Saborizadas x6', descripcion: 'Set de 6 botellas de agua saborizada natural: pepino-menta, limón-jengibre y frutos rojos. Sin azúcar.', imagen: U('1548839038-88977e52aa90'), categoria: 'bebidas', precio_venta: 9000, ingredientes: [] },
  { id: 12, nombre: 'Mesa de Dulces', descripcion: 'Montaje decorativo con torta central, cupcakes, galletas decoradas, trufas y candy bar. Para 30 personas.', imagen: U('1565299624946-b28f40a0ae38'), categoria: 'otro', precio_venta: 85000, ingredientes: [] },
]

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
  const gridRef = useRef(null)
  const [productos, setProductos] = useState([])
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    setLoading(true)
    getCatalogo(categoria)
      .then(r => setProductos(r.data))
      .catch(() => setProductos(categoria ? DEMO_PRODUCTOS.filter(p => p.categoria === categoria) : DEMO_PRODUCTOS))
      .finally(() => setLoading(false))
  }, [categoria])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cat-header > *', {
        y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.cat-header', start: 'top 85%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (loading || productos.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.prod-card', {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', clearProps: 'all',
      })
    }, gridRef)
    return () => ctx.revert()
  }, [loading, productos.length, categoria])

  return (
    <section id="catalogo" ref={section} className="relative bg-[#050505]">

      {/* Header */}
      <div className="cat-header pt-20 pb-8 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <a
            href="#hero"
            className="flex items-center gap-2 text-white/30 hover:text-[#C9A84C] transition-colors text-xs tracking-widest uppercase"
          >
            <FiArrowUp size={14} />
            Volver
          </a>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[#C9A84C] text-[10px] tracking-[0.5em] uppercase mb-3 font-bold">Selección Gourmet</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-none">Nuestra Carta</h2>
            <p className="mt-3 text-white/40 font-light text-sm max-w-md">Cada plato es una obra de arte creada con ingredientes de la más alta calidad.</p>
          </div>

          {/* Filtros — scroll horizontal en mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-end scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIAS.map(c => (
              <button
                key={c.key}
                onClick={() => { setCategoria(c.key); setExpanded(null) }}
                className={`flex-shrink-0 px-4 py-2 text-[9px] tracking-[0.25em] uppercase transition-all duration-300 border rounded-full ${
                  categoria === c.key
                    ? 'bg-white text-black border-white'
                    : 'border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="min-h-[50vh] pb-24 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase">Preparando...</span>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-white/20 tracking-[0.5em] uppercase text-xs italic">Próximamente más delicias en esta categoría</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
          >
            {productos.map((p, i) => {
              const enSeleccion = seleccion.find(s => s.id === p.id)
              const isOpen = expanded === i
              return (
                <div
                  key={`${categoria}-${p.id}`}
                  className={`prod-card group flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                    enSeleccion
                      ? 'border-[#C9A84C]/40 bg-[#C9A84C]/5'
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  {/* Imagen */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5 flex-shrink-0">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <FiShoppingBag size={32} />
                      </div>
                    )}
                    {p.categoria && (
                      <span className="absolute top-3 left-3 text-[8px] tracking-widest uppercase px-2 py-1 bg-black/60 text-white/50 rounded-sm backdrop-blur-sm">
                        {p.categoria}
                      </span>
                    )}
                    {enSeleccion && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#C9A84C] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h3 className="font-display text-base sm:text-lg text-white group-hover:text-[#C9A84C] transition-colors leading-tight">
                      {p.nombre}
                    </h3>
                    <p className={`text-white/40 text-xs font-light leading-relaxed transition-all duration-300 ${isOpen ? '' : 'line-clamp-2'}`}>
                      {p.descripcion || 'Especialidad de la casa preparada con ingredientes frescos del día.'}
                    </p>

                    {/* Precio + botón */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <span className="font-display text-base sm:text-lg text-white/80 whitespace-nowrap">
                        {fmt(p.precio_venta)}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); onToggle(p) }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-light transition-all duration-300 flex-shrink-0 ${
                          enSeleccion
                            ? 'bg-[#C9A84C] text-black shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                            : 'bg-white/5 text-white/40 border border-white/10 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                        }`}
                      >
                        {enSeleccion ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-b from-transparent to-black py-20 text-center border-t border-white/5 px-4">
        <p className="text-white/30 text-sm mb-8 font-light italic">¿No encuentras lo que buscas? Podemos crear un menú a tu medida.</p>
        <a href="#pedidos" className="btn-gold px-10 py-4 text-sm">Solicitar cotización personalizada</a>
      </div>
    </section>
  )
}
