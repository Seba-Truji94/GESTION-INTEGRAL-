import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const moveCursor = (e) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0 })
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.15 })
    }
    const grow = () => gsap.to(ring.current, { scale: 2.5, duration: 0.2 })
    const shrink = () => gsap.to(ring.current, { scale: 1, duration: 0.2 })

    window.addEventListener('mousemove', moveCursor)
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <>
      <div ref={dot} className="fixed top-0 left-0 w-2 h-2 bg-[#C9A84C] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={ring} className="fixed top-0 left-0 w-8 h-8 border border-[#C9A84C] rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-60" />
    </>
  )
}
