export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-display text-2xl tracking-widest">
          KR<span className="text-[#C9A84C]">U</span>XEL
        </span>
        <p className="text-white/30 text-sm text-center">
          © {new Date().getFullYear()} KRUXEL — Banquetería & Repostería. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm text-white/40">
          <a href="#catalogo" className="hover:text-[#C9A84C] transition-colors">Catálogo</a>
          <a href="#pedidos" className="hover:text-[#C9A84C] transition-colors">Pedidos</a>
          <a href="#contacto" className="hover:text-[#C9A84C] transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  )
}
