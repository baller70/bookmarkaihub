"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Check, X, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface HabitCheckIn {
  id: string
  date: Date
  completed: boolean
  count: number
}

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  targetCount: number
  checkins: HabitCheckIn[]
}

interface HabitsToolProps {
  bookmarkId: string
}

export function HabitsTool({ bookmarkId }: HabitsToolProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitDesc, setNewHabitDesc] = useState("")
  const [newHabitColor, setNewHabitColor] = useState("#3B82F6")
  const [newHabitFreq, setNewHabitFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')

  useEffect(() => {
    if (bookmarkId) {
      fetchHabits()
    }
  }, [bookmarkId])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/habits/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) {
      toast.error('Please enter a habit name')
      return
    }

    try {
      const response = await fetch(`/api/habits/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabitName.trim(),
          description: newHabitDesc.trim() || null,
          color: newHabitColor,
          frequency: newHabitFreq,
          targetCount: 1
        })
      })

      if (response.ok) {
        const newHabit = await response.json()
        setHabits([...habits, { ...newHabit, checkins: [] }])
        setNewHabitName("")
        setNewHabitDesc("")
        setNewHabitColor("#3B82F6")
        setNewHabitFreq('DAILY')
        setShowAddForm(false)
        toast.success('Habit created!')
      }
    } catch (error) {
      console.error('Error adding habit:', error)
      toast.error('Failed to create habit')
    }
  }

  const handleCheckIn = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${bookmarkId}/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          completed: true,
          count: 1
        })
      })

      if (response.ok) {
        await fetchHabits()
        toast.success('✅ Habit checked in!')
      }
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error('Failed to check in')
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      const response = await fetch(`/api/habits/${bookmarkId}/${habitId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setHabits(habits.filter(h => h.id !== habitId))
        toast.success('Habit deleted')
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast.error('Failed to delete habit')
    }
  }

  const calculateStreak = (checkins: HabitCheckIn[]) => {
    if (checkins.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sortedCheckins = [...checkins].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date)
      checkinDate.setHours(0, 0, 0, 0)
      
      const dayDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === i && sortedCheckins[i].completed) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const isCheckedInToday = (checkins: HabitCheckIn[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return checkins.some(checkin => {
      const checkinDate = new Date(checkin.date)
      checkinDate.setHours(0, 0, 0, 0)
      return checkinDate.getTime() === today.getTime() && checkin.completed
    })
  }

  const colors = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#EF4444", label: "Red" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#EC4899", label: "Pink" },
  ]

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Loading habits...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 uppercase">Habit Tracker</h3>
          <p className="text-sm text-gray-500">{habits.length} active habits</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Add habit form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <Input
            placeholder="Habit name..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="!bg-white border-gray-300"
          />
          <Textarea
            placeholder="Description (optional)..."
            value={newHabitDesc}
            onChange={(e) => setNewHabitDesc(e.target.value)}
            className="!bg-white border-gray-300 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Select value={newHabitColor} onValueChange={setNewHabitColor}>
              <SelectTrigger className="w-[120px] !bg-white border-gray-300">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: newHabitColor }}
                  />
                  <span>Color</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {colors.map(color => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newHabitFreq} onValueChange={(v: any) => setNewHabitFreq(v)}>
              <SelectTrigger className="w-[130px] !bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddHabit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Habit
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddForm(false)
              setNewHabitName("")
              setNewHabitDesc("")
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Habits list */}
      {habits.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">No habits yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            Click "New Habit" to start tracking your habits
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.checkins)
            const checkedInToday = isCheckedInToday(habit.checkins)
            
            return (
              <div
                key={habit.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                style={{ borderLeftWidth: '4px', borderLeftColor: habit.color }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{habit.name}</h4>
                    {habit.description && (
                      <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold uppercase" style={{ color: habit.color }}>
                        {streak}
                      </div>
                      <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600 uppercase">
                        {habit.checkins.filter(c => c.completed).length}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleCheckIn(habit.id)}
                    disabled={checkedInToday}
                    className={cn(
                      "rounded-full w-12 h-12 p-0",
                      checkedInToday
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-white border-2 hover:bg-gray-50"
                    )}
                    style={{ 
                      borderColor: checkedInToday ? '#10B981' : habit.color,
                      color: checkedInToday ? '#10B981' : habit.color
                    }}
                  >
                    {checkedInToday ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                <div className="text-xs text-gray-400 capitalize">
                  {habit.frequency.toLowerCase()} • Last 30 days: {habit.checkins.length} check-ins
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
