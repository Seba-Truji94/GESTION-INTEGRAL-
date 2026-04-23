import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCatalogo } from '../services/api'
import { FiShoppingBag } from 'react-icons/fi'

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

export default function Catalogo({ media = {}, seleccion, onToggle }) {
  const section = useRef(null)
  const gridRef = useRef(null)
  const [productos, setProductos] = useState([])
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [revealed, setRevealed] = useState(false)

  // Carga inicial y cambios de categoría
  useEffect(() => {
    setLoading(true)
    // Forzamos un pequeño retraso para asegurar que la animación se vea bien al cambiar
    getCatalogo(categoria)
      .then(r => {
        setProductos(r.data)
        // Refresh ScrollTrigger because content changed
        setTimeout(() => ScrollTrigger.refresh(), 100)
      })
      .catch(() => setProductos(categoria ? DEMO_PRODUCTOS.filter(p => p.categoria === categoria) : DEMO_PRODUCTOS))
      .finally(() => setLoading(false))
  }, [categoria])

  // Animación de entrada de la sección
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cat-header > *', {
        y: 60, opacity: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out',
        scrollTrigger: { trigger: '.cat-header', start: 'top 80%' },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  // Animación de aparición de productos
  useEffect(() => {
    if (loading || !revealed || productos.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.prod-card', {
        y: 100,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'all'
      })
    }, gridRef)
    return () => ctx.revert()
  }, [loading, revealed, productos.length, categoria])

  const handleReveal = () => {
    setRevealed(true)
    setTimeout(() => {
        const el = document.getElementById('menu-start')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <section id="catalogo" ref={section} className="relative bg-[#050505]">
      
      {/* 1. PORTADA INTERACTIVA DEL CATÁLOGO */}
      {!revealed && (
        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden group">
            {/* Fondo con zoom sutil */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img 
                    src={media.catalogo_fondo?.url || "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop"} 
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                    alt="Catalogo Background"
                />
            </div>
            
            <div className="relative z-20 text-center px-6">
                <p className="text-[#C9A84C] text-xs tracking-[0.6em] uppercase mb-6 animate-pulse">Explora el sabor</p>
                <h2 className="font-display text-6xl md:text-8xl font-bold text-white mb-10 leading-none">Nuestra Carta</h2>
                <button 
                    onClick={handleReveal}
                    className="group relative px-12 py-5 border border-white/20 text-white tracking-[0.3em] text-xs uppercase overflow-hidden transition-all hover:border-[#C9A84C]"
                >
                    <span className="relative z-10 group-hover:text-black transition-colors duration-300">Descubrir Menú</span>
                    <div className="absolute inset-0 bg-[#C9A84C] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[power4.inOut]" />
                </button>
            </div>
            
            {/* Decoración lateral */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
      )}

      {/* 2. EL CATÁLOGO (Solo se muestra o activa al revelar) */}
      <div id="menu-start" className={`transition-all duration-1000 ${revealed ? 'opacity-100 visible' : 'opacity-0 invisible h-0 overflow-hidden'}`}>
        
        {/* Header con Filtros */}
        <div className="cat-header pt-32 pb-16 px-8 md:px-20 max-w-7xl mx-auto border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="max-w-xl">
                    <p className="text-[#C9A84C] text-[10px] tracking-[0.5em] uppercase mb-4 font-bold">Selección Gourmet</p>
                    <h2 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">Categorías</h2>
                    <p className="mt-6 text-white/40 font-light text-sm">Cada plato es una obra de arte creada con ingredientes de la más alta calidad.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {CATEGORIAS.map(c => (
                        <button
                            key={c.key}
                            onClick={() => setCategoria(c.key)}
                            className={`px-6 py-2.5 text-[9px] tracking-[0.25em] uppercase transition-all duration-500 border rounded-full ${
                                categoria === c.key
                                    ? 'bg-white text-black border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                    : 'border-white/10 text-white/30 hover:border-white/40 hover:text-white'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Listado de Productos */}
        <div className="min-h-[60vh] pb-32">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase">Preparando selección...</span>
                </div>
            ) : productos.length === 0 ? (
                <div className="text-center py-48">
                    <p className="text-white/20 tracking-[0.5em] uppercase text-xs italic">Próximamente más delicias en esta categoría</p>
                </div>
            ) : (
                <div ref={gridRef} className="prod-grid max-w-7xl mx-auto px-4 md:px-20 mt-12 grid gap-4">
                   {productos.map((p, i) => (
                    <div
                        key={`${categoria}-${p.id}`}
                        className={`prod-card group relative flex items-center gap-3 p-4 md:gap-6 md:p-8 transition-all duration-500 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 md:hover:-translate-y-1 ${
                            seleccion.find(s => s.id === p.id) ? 'border-[#C9A84C]/40 bg-[#C9A84C]/5' : ''
                        }`}
                        onClick={() => setExpanded(expanded === i ? null : i)}
                    >
                        {/* Miniatura */}
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 group-hover:border-[#C9A84C]/30 transition-colors">
                            {p.imagen ? (
                                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/5">
                                    <FiShoppingBag size={24} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-display text-xl md:text-2xl text-white truncate group-hover:text-[#C9A84C] transition-colors">{p.nombre}</h3>
                                {p.categoria && <span className="text-[8px] tracking-widest uppercase px-2 py-0.5 bg-white/5 text-white/30 rounded-sm hidden sm:block">{p.categoria}</span>}
                            </div>
                            <p className={`text-white/40 text-xs md:text-sm font-light transition-all duration-500 ${expanded === i ? '' : 'line-clamp-1'}`}>
                                {p.descripcion || 'Especialidad de la casa preparada con ingredientes frescos del día.'}
                            </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2 flex-shrink-0 w-[88px] md:w-[130px]">
                            <span className="font-display text-xs md:text-2xl text-white/80 whitespace-nowrap leading-tight">{fmt(p.precio_venta)}</span>
                            <button
                                onClick={e => { e.stopPropagation(); onToggle(p) }}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                                    seleccion.find(s => s.id === p.id)
                                        ? 'bg-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.5)]'
                                        : 'bg-white/5 text-white/20 border border-white/10 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                                }`}
                            >
                                {seleccion.find(s => s.id === p.id) ? '✓' : '+'}
                            </button>
                        </div>
                    </div>
                   ))}
                </div>
            )}
        </div>

        {/* Footer del Catálogo */}
        <div className="bg-gradient-to-b from-transparent to-black py-24 text-center border-t border-white/5">
            <p className="text-white/30 text-sm mb-8 font-light italic">¿No encuentras lo que buscas? Podemos crear un menú a tu medida.</p>
            <a href="#pedidos" className="btn-gold px-16 py-5">Solicitar cotización personalizada</a>
        </div>
      </div>
    </section>
  )
}

