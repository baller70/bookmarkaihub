
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Target } from "lucide-react"
import { toast } from "sonner"

interface Goal {
  id: string
  title: string
  description: string | null
  goalType: string
  color: string
  priority: string
  status: string
  progress: number
  deadline: string | null
}

interface AddGoalsModalProps {
  bookmarkId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoalsAdded: () => void
}

export function AddGoalsModal({
  bookmarkId,
  open,
  onOpenChange,
  onGoalsAdded,
}: AddGoalsModalProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  // Fetch all goals
  useEffect(() => {
    if (open) {
      fetchGoals()
    }
  }, [open])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleAddSelected = async () => {
    if (selectedGoalIds.length === 0) {
      toast.error("Please select at least one goal")
      return
    }

    try {
      setAdding(true)
      const response = await fetch(`/api/bookmarks/${bookmarkId}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalIds: selectedGoalIds }),
      })

      if (response.ok) {
        toast.success(`Linked ${selectedGoalIds.length} goal(s)`)
        setSelectedGoalIds([])
        onGoalsAdded()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to link goals")
      }
    } catch (error) {
      console.error("Error linking goals:", error)
      toast.error("Failed to link goals")
    } finally {
      setAdding(false)
    }
  }

  const filteredGoals = goals.filter((goal) => {
    const query = searchQuery.toLowerCase()
    return (
      goal.title.toLowerCase().includes(query) ||
      goal.description?.toLowerCase().includes(query) ||
      goal.goalType.toLowerCase().includes(query)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-xl font-bold">Add Goals</DialogTitle>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Search and select existing goals to associate with this bookmark.
          </p>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search goals by name or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto space-y-2 pr-2">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading goals...</div>
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? "No goals found" : "No goals available"}
              </div>
            ) : (
              filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleToggleGoal(goal.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {goal.goalType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {goal.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Math.round(goal.progress)}% complete
                      </span>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedGoalIds.includes(goal.id)}
                    onCheckedChange={() => handleToggleGoal(goal.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">{selectedGoalIds.length} selected</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedGoalIds.length === 0 || adding}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
