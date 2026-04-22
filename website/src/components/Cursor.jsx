import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.05 })
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' })
    }

    const enter = (e) => {
      const isLink = e.target.closest('a, button')
      const isImg = e.target.closest('img, .gal-item')
      if (isImg) {
        gsap.to(ring.current, { scale: 3.5, opacity: 0.3, duration: 0.3, borderColor: '#C9A84C' })
        gsap.to(dot.current, { scale: 0, duration: 0.2 })
      } else if (isLink) {
        gsap.to(ring.current, { scale: 2.5, duration: 0.25 })
        gsap.to(dot.current, { scale: 1.5, duration: 0.2 })
      }
    }

    const leave = () => {
      gsap.to(ring.current, { scale: 1, opacity: 0.5, duration: 0.3, borderColor: '#C9A84C' })
      gsap.to(dot.current, { scale: 1, duration: 0.2 })
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', enter)
    document.addEventListener('mouseout', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', enter)
      document.removeEventListener('mouseout', leave)
    }
  }, [])

  return (
    <>
      <div
        ref={dot}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C9A84C] rounded-full pointer-events-none z-[9999]"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={ring}
        className="fixed top-0 left-0 w-9 h-9 border border-[#C9A84C] rounded-full pointer-events-none z-[9998] opacity-50"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  )
}
