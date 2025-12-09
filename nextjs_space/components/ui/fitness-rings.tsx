"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface RingData {
  id: string
  label: string
  value: number
  target: number
  color: string
  icon?: string
}

export interface FitnessRingsProps {
  rings: RingData[]
  size?: number
  strokeWidth?: number
  className?: string
  onClick?: (e: React.MouseEvent) => void
  animated?: boolean
  showCenterValue?: boolean
}

export function FitnessRings({
  rings,
  size = 70,
  strokeWidth = 6,
  className,
  onClick,
  animated = true,
  showCenterValue = true,
}: FitnessRingsProps) {
  const [animatedProgress, setAnimatedProgress] = useState<number[]>(rings.map(() => 0))

  const center = size / 2
  const gap = strokeWidth + 2 // Gap between rings

  // Calculate overall average progress for center display
  const getOverallProgress = () => {
    if (rings.length === 0) return 0
    const total = rings.reduce((sum, ring) => {
      if (ring.target <= 0) return sum
      return sum + Math.min((ring.value / ring.target) * 100, 100)
    }, 0)
    return Math.round(total / rings.length)
  }
  
  // Calculate radius for each ring (outer to inner)
  const getRadius = (index: number) => {
    return center - strokeWidth / 2 - (index * gap)
  }

  // Calculate progress percentage (capped at 100%)
  const getProgress = (ring: RingData) => {
    if (ring.target <= 0) return 0
    return Math.min((ring.value / ring.target) * 100, 100)
  }

  // Calculate stroke dash array for progress arc
  const getStrokeDashArray = (radius: number, progress: number) => {
    const circumference = 2 * Math.PI * radius
    const progressLength = (progress / 100) * circumference
    return `${progressLength} ${circumference}`
  }

  // Animate rings on mount
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(rings.map(getProgress))
      return
    }

    const targets = rings.map(getProgress)
    const duration = 1000 // 1 second animation
    const steps = 60
    const stepDuration = duration / steps
    let step = 0

    const interval = setInterval(() => {
      step++
      const progress = step / steps
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedProgress(targets.map(target => target * eased))

      if (step >= steps) {
        clearInterval(interval)
        setAnimatedProgress(targets)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [rings, animated])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick?.(e)
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-transform hover:scale-105",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="View activity rings details"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {rings.map((ring, index) => {
          const radius = getRadius(index)
          const progress = animatedProgress[index] || 0
          
          return (
            <g key={ring.id}>
              {/* Background ring (gray track) */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Progress ring with rounded end cap */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={getStrokeDashArray(radius, progress)}
                style={{
                  filter: `drop-shadow(0 0 3px ${ring.color}40)`,
                  transition: animated ? 'none' : 'stroke-dasharray 0.3s ease'
                }}
              />
              {/* Rounded end cap at the start */}
              {progress > 0 && (
                <circle
                  cx={center}
                  cy={center - radius}
                  r={strokeWidth / 2}
                  fill={ring.color}
                />
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Center with percentage display */}
      {showCenterValue && (() => {
        // Calculate the inner radius of the innermost ring
        const innermostRingRadius = getRadius(rings.length - 1)
        // Subtract strokeWidth to get inside the ring, plus extra padding
        const padding = strokeWidth * 1.5
        const centerSize = (innermostRingRadius - strokeWidth / 2 - padding) * 2

        return (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              pointerEvents: 'none',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: Math.max(centerSize, 0),
                height: Math.max(centerSize, 0),
              }}
            >
              <span
                className="font-bold text-gray-800 leading-none"
                style={{
                  fontSize: Math.max(size * 0.15, 10),
                }}
              >
                {getOverallProgress()}%
              </span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

