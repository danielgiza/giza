import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkleSpeed: number
  twinklePhase: number
}

interface CircuitNode {
  x: number
  y: number
  connections: number[]
  pulsePhase: number
  pulseSpeed: number
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  progress: number
  fromNode: number
  toNode: number
  opacity: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Stars
    const stars: Star[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }))

    // Circuit nodes
    const nodeCount = 12
    const circuitNodes: CircuitNode[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      connections: [],
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
    }))

    // Connect nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = circuitNodes[i].x - circuitNodes[j].x
        const dy = circuitNodes[i].y - circuitNodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 400) {
          circuitNodes[i].connections.push(j)
          circuitNodes[j].connections.push(i)
        }
      }
    }

    // Particles traveling along circuit lines
    const particles: Particle[] = []
    function spawnParticle() {
      if (particles.length > 15) return
      const fromIdx = Math.floor(Math.random() * nodeCount)
      const node = circuitNodes[fromIdx]
      if (node.connections.length === 0) return
      const toIdx = node.connections[Math.floor(Math.random() * node.connections.length)]
      const to = circuitNodes[toIdx]
      particles.push({
        x: node.x,
        y: node.y,
        targetX: to.x,
        targetY: to.y,
        speed: Math.random() * 0.008 + 0.003,
        progress: 0,
        fromNode: fromIdx,
        toNode: toIdx,
        opacity: 1,
      })
    }

    let time = 0

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, width, height)
      time++

      // Spawn particles
      if (time % 60 === 0) spawnParticle()

      // Draw circuit lines
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodeCount; i++) {
        const node = circuitNodes[i]
        for (const j of node.connections) {
          if (j <= i) continue
          const other = circuitNodes[j]
          const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y)
          const alpha = 0.06 + Math.sin(time * 0.01 + i) * 0.02
          gradient.addColorStop(0, `rgba(124, 58, 237, ${alpha})`)
          gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha + 0.03})`)
          gradient.addColorStop(1, `rgba(124, 58, 237, ${alpha})`)
          ctx.strokeStyle = gradient
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      }

      // Draw circuit nodes
      for (const node of circuitNodes) {
        node.pulsePhase += node.pulseSpeed
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5
        const size = 2 + pulse * 1.5
        const alpha = 0.15 + pulse * 0.2

        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124, 58, 237, ${alpha * 0.2})`
        ctx.fill()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          particles.splice(i, 1)
          continue
        }
        p.x = circuitNodes[p.fromNode].x + (p.targetX - circuitNodes[p.fromNode].x) * p.progress
        p.y = circuitNodes[p.fromNode].y + (p.targetY - circuitNodes[p.fromNode].y) * p.progress
        p.opacity = p.progress < 0.1 ? p.progress * 10 : p.progress > 0.9 ? (1 - p.progress) * 10 : 1

        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity * 0.7})`
        ctx.fill()

        // Particle glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity * 0.15})`
        ctx.fill()
      }

      // Draw and animate stars
      for (const star of stars) {
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6
        const alpha = star.opacity * twinkle
        const size = star.size * (0.8 + twinkle * 0.4)

        // Star glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, size + 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.1})`
        ctx.fill()

        // Star core
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()

        // Slow drift
        star.y += star.speed * 0.2
        if (star.y > height + 5) {
          star.y = -5
          star.x = Math.random() * width
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
