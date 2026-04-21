import { useState } from 'react'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import QuienesSomos from './sections/QuienesSomos'
import Catalogo from './sections/Catalogo'
import Pedido from './sections/Pedido'
import Pago from './sections/Pago'
import Contacto from './sections/Contacto'

export default function App() {
  const [showPago, setShowPago] = useState(false)

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <QuienesSomos />
        <Catalogo />
        <Pedido onPedidoEnviado={() => setShowPago(true)} />
        {/* Pago siempre visible — al enviar pedido hace scroll automático */}
        <Pago />
        <Contacto />
      </main>
      <Footer />
    </>
  )
}
