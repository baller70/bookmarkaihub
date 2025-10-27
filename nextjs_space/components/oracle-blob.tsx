"use client"

import { useEffect, useRef } from "react"

interface OracleBlobProps {
  primaryColor: string
  secondaryColor: string
  size: number
  roundness: number
  fluidness: number
  morphingSpeed: number
  pulseEffect: boolean
  pulseIntensity: number
  glowEffect: boolean
  glowIntensity: number
  blobOpacity: number
  idleAnimation: boolean
  animationSpeed: number
  showVoiceViz: boolean
  numBars: number
  barHeight: number
  barSpacing: number
  voiceReactivity: number
}

export function OracleBlob({
  primaryColor,
  secondaryColor,
  size,
  roundness,
  fluidness,
  morphingSpeed,
  pulseEffect,
  pulseIntensity,
  glowEffect,
  glowIntensity,
  blobOpacity,
  idleAnimation,
  animationSpeed,
  showVoiceViz,
  numBars,
  barHeight,
  barSpacing,
  voiceReactivity
}: OracleBlobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = size

      // Create gradient
      const gradient = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
      )
      gradient.addColorStop(0, primaryColor)
      gradient.addColorStop(1, secondaryColor)

      // Draw blob shape
      ctx.beginPath()
      const points = 8
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const variation = Math.sin(time * morphingSpeed + i) * (fluidness / 100) * 20
        const r = radius + variation
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()

      // Apply glow effect
      if (glowEffect) {
        ctx.shadowBlur = glowIntensity
        ctx.shadowColor = primaryColor
      }

      // Apply pulse effect
      const pulseScale = pulseEffect
        ? 1 + Math.sin(time * 2) * (pulseIntensity / 100) * 0.1
        : 1

      ctx.globalAlpha = blobOpacity / 100
      ctx.fillStyle = gradient
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(pulseScale, pulseScale)
      ctx.translate(-centerX, -centerY)
      ctx.fill()
      ctx.restore()

      // Draw voice visualization bars
      if (showVoiceViz) {
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        const totalWidth = numBars * barSpacing
        const startX = centerX - totalWidth / 2

        for (let i = 0; i < numBars; i++) {
          const x = startX + i * barSpacing
          const height = (Math.sin(time * 3 + i) * 0.5 + 0.5) * barHeight
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fillRect(x, centerY - height / 2, 3, height)
        }
      }

      if (idleAnimation) {
        time += 0.02 * (animationSpeed / 100)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [
    primaryColor,
    secondaryColor,
    size,
    roundness,
    fluidness,
    morphingSpeed,
    pulseEffect,
    pulseIntensity,
    glowEffect,
    glowIntensity,
    blobOpacity,
    idleAnimation,
    animationSpeed,
    showVoiceViz,
    numBars,
    barHeight,
    barSpacing,
    voiceReactivity
  ])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-full"
    />
  )
}
