"use client"

import { useEffect, useRef } from "react"

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let resizeRaf = 0
    let time = 0

    // Floating particles configuration for subtle animation
    const particles = [
      { x: 0, y: 0, vx: 0.3, vy: -0.2, opacity: 0.1, size: 2 },
      { x: 0, y: 0, vx: -0.2, vy: -0.3, opacity: 0.08, size: 1.5 },
      { x: 0, y: 0, vx: 0.4, vy: -0.1, opacity: 0.12, size: 2.5 },
      { x: 0, y: 0, vx: -0.3, vy: -0.25, opacity: 0.09, size: 1.8 },
    ]

    function resizeCanvas() {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Initialize particle positions
      particles.forEach((particle) => {
        particle.x = Math.random() * width
        particle.y = Math.random() * height
      })
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x > width + 10) particle.x = -10
        if (particle.x < -10) particle.x = width + 10
        if (particle.y > height + 10) particle.y = -10
        if (particle.y < -10) particle.y = height + 10

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`
        ctx.fill()
      })
    }

    function animate() {
      time += 0.016 // ~60fps
      drawParticles()
      raf = requestAnimationFrame(animate)
    }

    function scheduleResize() {
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(resizeCanvas)
    }

    window.addEventListener("resize", scheduleResize, { passive: true })
    scheduleResize()

    if (!prefersReduced) {
      raf = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeRaf)
      window.removeEventListener("resize", scheduleResize)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Graduation ceremony background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D9%85%D9%84%D9%81%20%D8%A7%D9%84%D8%B1%D8%B9%D8%A7%D8%A9%20switch.pdf%20%282%29-isi5v2Uc7gRffpXESKBVjfi0MN7O37.png')`,
        }}
      />

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      {/* Subtle floating particles animation */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-40" />

      {/* Elegant vignette effect */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 70%)`,
        }}
      />
    </div>
  )
}
