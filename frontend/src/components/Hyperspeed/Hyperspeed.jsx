import { useEffect, useRef } from 'react'

export default function Hyperspeed({
  color1 = '#DE443B',
  color2 = '#006BB4',
  color3 = '#162325',
  starCount = 800,
  speed = 5,
  mouseInteraction = true,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = canvas.offsetWidth
    let height = canvas.offsetHeight
    let mouse = { x: 0, y: 0 }
    let animId

    function resize() {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    const c1 = hexToRgb(color1)
    const c2 = hexToRgb(color2)
    const c3 = hexToRgb(color3)

    function pickStarColor(rand) {
      if (rand < 0.5) return c1
      return c2
    }

    class Star {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = (Math.random() - 0.5) * width
        this.y = (Math.random() - 0.5) * height
        this.z = Math.random() * width
        this.pz = this.z
        this.colorRand = Math.random()
      }
      update(spd) {
        this.pz = this.z
        this.z -= spd
        if (this.z <= 0) this.reset()
      }
      draw() {
        const cx = width / 2 + (mouseInteraction ? mouse.x * 0.05 : 0)
        const cy = height / 2 + (mouseInteraction ? mouse.y * 0.05 : 0)

        const sx = (this.x / this.z) * width + cx
        const sy = (this.y / this.z) * height + cy
        const px = (this.x / this.pz) * width + cx
        const py = (this.y / this.pz) * height + cy

        const size = Math.max(0.3, (1 - this.z / width) * 2.5)
        const alpha = Math.pow(1 - this.z / width, 2)
        const c = pickStarColor(this.colorRand)

        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`
        ctx.lineWidth = size
        ctx.stroke()
      }
    }

    const stars = Array.from({ length: starCount }, () => new Star())

    // Scatter initial z values so it doesn't start empty
    stars.forEach(s => { s.z = Math.random() * width; s.pz = s.z })

    function animate() {
      animId = requestAnimationFrame(animate)

      ctx.fillStyle = `rgba(${c3.r},${c3.g},${c3.b},0.2)`
      ctx.fillRect(0, 0, width, height)

      const currentSpeed = speed * (1 + (mouseInteraction ? Math.abs(mouse.x / width) * 0.5 : 0))
      stars.forEach(s => {
        s.update(currentSpeed)
        s.draw()
      })
    }

    animId = requestAnimationFrame(animate)

    function handleMouseMove(e) {
      if (!mouseInteraction) return
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left - width / 2
      mouse.y = e.clientY - rect.top - height / 2
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [color1, color2, color3, starCount, speed, mouseInteraction])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
