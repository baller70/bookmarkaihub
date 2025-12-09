"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FitnessRings, RingData } from "./fitness-rings"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface RingColorCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rings: RingData[]
  onSave: (colors: Record<string, string>) => void
}

const colorPresets = [
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
]

export function RingColorCustomizer({
  open,
  onOpenChange,
  rings,
  onSave,
}: RingColorCustomizerProps) {
  const [selectedRing, setSelectedRing] = useState<string>(rings[0]?.id || "")
  const [colors, setColors] = useState<Record<string, string>>(
    rings.reduce((acc, ring) => ({ ...acc, [ring.id]: ring.color }), {})
  )

  const handleColorSelect = (color: string) => {
    setColors((prev) => ({ ...prev, [selectedRing]: color }))
  }

  const handleSave = () => {
    onSave(colors)
    onOpenChange(false)
  }

  // Create preview rings with current colors
  const previewRings = rings.map((ring) => ({
    ...ring,
    color: colors[ring.id] || ring.color,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-white">
            Customize Ring Colors
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Preview */}
          <div className="mb-6">
            <FitnessRings
              rings={previewRings}
              size={120}
              strokeWidth={12}
              animated={false}
            />
          </div>

          {/* Ring selector */}
          <div className="flex gap-2 mb-4">
            {rings.map((ring) => (
              <button
                key={ring.id}
                onClick={() => setSelectedRing(ring.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedRing === ring.id
                    ? "bg-white text-gray-900"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                {ring.label}
              </button>
            ))}
          </div>

          {/* Color palette */}
          <div className="grid grid-cols-8 gap-2 p-3 bg-gray-800/50 rounded-xl">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleColorSelect(preset.value)}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center",
                  colors[selectedRing] === preset.value && "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                )}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              >
                {colors[selectedRing] === preset.value && (
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-white text-gray-900 hover:bg-gray-200"
          >
            Save Colors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

