import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import QuienesSomos from './sections/QuienesSomos'
import Galeria from './sections/Galeria'
import Catalogo from './sections/Catalogo'
import Pedido from './sections/Pedido'
import Pago from './sections/Pago'
import Contacto from './sections/Contacto'
import { useMedia } from './services/useMedia'
import { useSiteConfig } from './services/useSiteConfig'

export default function App() {
  const { media, loading } = useMedia()
  const config = useSiteConfig()
  const [seleccion, setSeleccion] = useState([])

  const toggleSeleccion = (prod) => {
    setSeleccion(prev => {
      const exists = prev.find(p => p.id === prod.id)
      if (exists) return prev.filter(p => p.id !== prod.id)
      return [...prev, prod]
    })
  }

  // Recalcula posiciones ScrollTrigger tras cargar imágenes
  useEffect(() => {
    if (!loading) {
      setTimeout(() => ScrollTrigger.refresh(), 200)
    }
  }, [loading])

  return (
    <>
      <Cursor />
      <Navbar config={config} />
      <main>
        <Hero media={media} config={config} />
        <QuienesSomos media={media} config={config} />
        <Galeria media={media} />
        <Catalogo seleccion={seleccion} onToggle={toggleSeleccion} />
        <Pedido seleccion={seleccion} onClear={() => setSeleccion([])} />
        <Pago />
        <Contacto config={config} />
      </main>
      <Footer config={config} />
    </>
  )
}
