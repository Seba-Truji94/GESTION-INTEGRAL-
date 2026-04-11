import { useEffect, useRef } from 'react'

export default function LineWaves({
  color1 = '#DE443B',
  color2 = '#006BB4',
  color3 = '#162325',
  lineCount = 12,
  speed = 0.8,
  amplitude = 60,
  frequency = 0.012,
  mouseInteraction = true,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = canvas.offsetWidth
    let height = canvas.offsetHeight
    let mouse = { x: width / 2, y: height / 2 }
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

    const colors = [hexToRgb(color1), hexToRgb(color2), hexToRgb(color3)]

    function lerpColor(a, b, t) {
      return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
      }
    }

    function getColor(i, total) {
      const t = i / (total - 1)
      if (t < 0.5) return lerpColor(colors[0], colors[1], t * 2)
      return lerpColor(colors[1], colors[2], (t - 0.5) * 2)
    }

    const offsets = Array.from({ length: lineCount }, (_, i) => i * (Math.PI * 2) / lineCount)

    let time = 0

    function drawWave(waveIndex) {
      const yBase = (height / (lineCount + 1)) * (waveIndex + 1)
      const phase = offsets[waveIndex] + time * speed
      const mouseInfluence = mouseInteraction
        ? ((mouse.y / height) - 0.5) * 0.6
        : 0
      const amp = amplitude * (1 + mouseInfluence * Math.sin(waveIndex * 0.7))

      const c = getColor(waveIndex, lineCount)
      const alpha = 0.25 + 0.5 * (1 - Math.abs(waveIndex / lineCount - 0.5) * 2)

      ctx.beginPath()
      ctx.moveTo(0, yBase)

      const steps = Math.ceil(width / 4)
      for (let x = 0; x <= width; x += steps) {
        const mouseXInfluence = mouseInteraction
          ? Math.sin((x / width - mouse.x / width) * Math.PI) * 0.3
          : 0
        const y =
          yBase +
          Math.sin(x * frequency + phase) * amp +
          Math.sin(x * frequency * 2.3 + phase * 1.4) * (amp * 0.3) +
          mouseXInfluence * amp
        ctx.lineTo(x, y)
      }

      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`
      ctx.lineWidth = 1.5 + waveIndex * 0.1
      ctx.stroke()
    }

    function animate() {
      animId = requestAnimationFrame(animate)
      time += 0.016

      const bg = hexToRgb(color3)
      ctx.fillStyle = `rgb(${bg.r},${bg.g},${bg.b})`
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < lineCount; i++) {
        drawWave(i)
      }
    }

    animId = requestAnimationFrame(animate)

    function handleMouseMove(e) {
      if (!mouseInteraction) return
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [color1, color2, color3, lineCount, speed, amplitude, frequency, mouseInteraction])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
