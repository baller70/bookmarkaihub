
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Clock, Bell, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"

interface Schedule {
  id: string
  title: string
  description?: string
  reminderDate: string
  reminderTime: string
  frequency: string
  notifyVia: string[]
  isActive: boolean
  createdAt: string
}

interface SchedulerTabProps {
  bookmarkId: string
  bookmarkTitle: string
}

export function SchedulerTab({ bookmarkId, bookmarkTitle }: SchedulerTabProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [frequency, setFrequency] = useState("ONCE")

  useEffect(() => {
    fetchSchedules()
  }, [bookmarkId])

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/notifications/scheduler/${bookmarkId}`)
      if (res.ok) {
        const data = await res.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !reminderDate || !reminderTime) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const url = editingId
        ? `/api/notifications/scheduler/${bookmarkId}/${editingId}`
        : `/api/notifications/scheduler/${bookmarkId}`
      
      const method = editingId ? "PATCH" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          reminderDate,
          reminderTime,
          frequency,
          notifyVia: ["app"],
        }),
      })

      if (res.ok) {
        toast.success(editingId ? "Reminder updated" : "Reminder created")
        resetForm()
        fetchSchedules()
      } else {
        toast.error("Failed to save reminder")
      }
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Delete this reminder?")) return

    try {
      const res = await fetch(`/api/notifications/scheduler/${bookmarkId}/${scheduleId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Reminder deleted")
        fetchSchedules()
      } else {
        toast.error("Failed to delete reminder")
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast.error("An error occurred")
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id)
    setTitle(schedule.title)
    setDescription(schedule.description || "")
    setReminderDate(schedule.reminderDate.split("T")[0])
    setReminderTime(schedule.reminderTime)
    setFrequency(schedule.frequency)
    setShowForm(true)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setReminderDate("")
    setReminderTime("09:00")
    setFrequency("ONCE")
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase">NOTIFICATIONS & REMINDERS</h3>
          <p className="text-sm text-gray-500">Schedule reminders for &quot;{bookmarkTitle}&quot;</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="!bg-white border-gray-300 hover:!bg-gray-50 !text-gray-900 uppercase"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "New Reminder"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <h4 className="font-bold uppercase">{editingId ? "Edit" : "Create"} Reminder</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">TITLE *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review this bookmark"
              required
              className="!bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">DESCRIPTION</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about the reminder"
              className="!bg-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">DATE *</label>
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                required
                className="!bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TIME *</label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                required
                className="!bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">FREQUENCY</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="!bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONCE">Once</SelectItem>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingId ? "Update" : "Create"} Reminder
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Scheduled Reminders List */}
      <div className="space-y-3">
        <h4 className="font-bold uppercase">SCHEDULED REMINDERS ({schedules.length})</h4>
        
        {schedules.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium mb-2">NO REMINDERS YET</h4>
            <p className="text-sm text-gray-500">
              Create your first reminder to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold">{schedule.title}</h5>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(schedule.reminderDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.reminderTime}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs uppercase">
                        {schedule.frequency}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(schedule)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
