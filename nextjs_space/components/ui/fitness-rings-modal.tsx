"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FitnessRings, RingData } from "./fitness-rings"
import { Settings, Eye, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface FitnessRingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rings: RingData[]
  onCustomize?: () => void
}

const ringIcons: Record<string, React.ReactNode> = {
  visits: <Eye className="h-4 w-4" />,
  tasks: <CheckCircle className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
}

export function FitnessRingsModal({
  open,
  onOpenChange,
  rings,
  onCustomize,
}: FitnessRingsModalProps) {
  const getProgressPercentage = (ring: RingData) => {
    if (ring.target <= 0) return 0
    return Math.min((ring.value / ring.target) * 100, 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
            <span>Activity Rings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Large fitness rings display */}
          <div className="mb-6">
            <FitnessRings
              rings={rings}
              size={160}
              strokeWidth={14}
              animated={true}
            />
          </div>

          {/* Ring details */}
          <div className="w-full space-y-3">
            {rings.map((ring) => {
              const percentage = getProgressPercentage(ring)
              return (
                <div
                  key={ring.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  {/* Ring color indicator */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${ring.color}20`, color: ring.color }}
                  >
                    {ringIcons[ring.id] || <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />}
                  </div>

                  {/* Ring info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{ring.label}</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: ring.color }}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {ring.value} / {ring.target} {ring.id === 'time' ? 'min' : ''}
                      </span>
                      <span>
                        {ring.target - ring.value > 0
                          ? `${ring.target - ring.value} to go`
                          : '✓ Complete!'
                        }
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: ring.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Customize button */}
          {onCustomize && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={onCustomize}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize Colors
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

