"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  AlarmClock, 
  Plus, 
  Bell,
  BellOff,
  Calendar,
  Clock,
  Repeat,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Reminder {
  id: string
  title: string
  description?: string
  dateTime: Date
  isRecurring: boolean
  recurringType?: "daily" | "weekly" | "monthly"
  isActive: boolean
  notifyVia: ("app" | "email")[]
  completed: boolean
}

interface RemindersToolProps {
  bookmarkId: string
}

export function RemindersTool({ bookmarkId }: RemindersToolProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    isRecurring: false,
    recurringType: "daily" as "daily" | "weekly" | "monthly",
    notifyApp: true,
    notifyEmail: false
  })

  useEffect(() => {
    loadReminders()
  }, [bookmarkId])

  const loadReminders = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/reminders`)
      if (response.ok) {
        const data = await response.json()
        setReminders(data.map((r: any) => ({
          ...r,
          dateTime: new Date(r.dateTime)
        })))
      }
    } catch (error) {
      console.error("Error loading reminders:", error)
    }
  }

  const saveReminder = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields")
      return
    }

    const notifyVia: ("app" | "email")[] = []
    if (formData.notifyApp) notifyVia.push("app")
    if (formData.notifyEmail) notifyVia.push("email")

    const reminder: Reminder = {
      id: editingId || `rem-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      dateTime: new Date(`${formData.date}T${formData.time}`),
      isRecurring: formData.isRecurring,
      recurringType: formData.isRecurring ? formData.recurringType : undefined,
      isActive: true,
      notifyVia,
      completed: false
    }

    if (editingId) {
      setReminders(reminders.map(r => r.id === editingId ? reminder : r))
      toast.success("Reminder updated!")
    } else {
      setReminders([reminder, ...reminders])
      toast.success("Reminder created!")
    }

    resetForm()

    // Save to API
    try {
      await fetch(`/api/bookmarks/${bookmarkId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminder)
      })
    } catch (error) {
      console.error("Error saving reminder:", error)
    }
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id))
    toast.success("Reminder deleted")
  }

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    ))
  }

  const toggleActive = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ))
  }

  const editReminder = (reminder: Reminder) => {
    setEditingId(reminder.id)
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      date: reminder.dateTime.toISOString().split("T")[0],
      time: reminder.dateTime.toTimeString().slice(0, 5),
      isRecurring: reminder.isRecurring,
      recurringType: reminder.recurringType || "daily",
      notifyApp: reminder.notifyVia.includes("app"),
      notifyEmail: reminder.notifyVia.includes("email")
    })
    setShowDialog(true)
  }

  const resetForm = () => {
    setShowDialog(false)
    setEditingId(null)
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      isRecurring: false,
      recurringType: "daily",
      notifyApp: true,
      notifyEmail: false
    })
  }

  const upcomingReminders = reminders
    .filter(r => !r.completed && r.dateTime > new Date())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())

  const pastReminders = reminders
    .filter(r => r.completed || r.dateTime <= new Date())
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())

  const isOverdue = (dateTime: Date) => dateTime < new Date()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-orange-600" />
            <h2 className="font-bold text-lg uppercase">REMINDERS</h2>
            <Badge variant="outline" className="ml-2">
              {upcomingReminders.length} upcoming
            </Badge>
          </div>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-auto p-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <AlarmClock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              NO REMINDERS SET
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Create reminders to stay on top of follow-ups
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Upcoming
                </h3>
                <div className="space-y-2">
                  {upcomingReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggleComplete={toggleComplete}
                      onToggleActive={toggleActive}
                      onEdit={editReminder}
                      onDelete={deleteReminder}
                      isOverdue={isOverdue(reminder.dateTime)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past/Completed */}
            {pastReminders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Past / Completed
                </h3>
                <div className="space-y-2 opacity-60">
                  {pastReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggleComplete={toggleComplete}
                      onToggleActive={toggleActive}
                      onEdit={editReminder}
                      onDelete={deleteReminder}
                      isOverdue={isOverdue(reminder.dateTime)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {editingId ? "Edit Reminder" : "New Reminder"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Title *
              </label>
              <Input
                placeholder="Follow up with client"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="Add more details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Time *
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
            </div>

            {formData.isRecurring && (
              <Select
                value={formData.recurringType}
                onValueChange={(value) => setFormData({ ...formData, recurringType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notify via
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifyApp}
                    onChange={(e) => setFormData({ ...formData, notifyApp: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">App</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifyEmail}
                    onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Email</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={saveReminder}>
              {editingId ? "Update" : "Create"} Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Reminder Card Component
function ReminderCard({
  reminder,
  onToggleComplete,
  onToggleActive,
  onEdit,
  onDelete,
  isOverdue
}: {
  reminder: Reminder
  onToggleComplete: (id: string) => void
  onToggleActive: (id: string) => void
  onEdit: (reminder: Reminder) => void
  onDelete: (id: string) => void
  isOverdue: boolean
}) {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all hover:shadow-md bg-white dark:bg-gray-800",
        reminder.completed && "opacity-60",
        isOverdue && !reminder.completed && "border-red-200 bg-red-50 dark:bg-red-900/10"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
            reminder.completed
              ? "border-green-500 bg-green-500"
              : isOverdue
              ? "border-red-500"
              : "border-gray-300 hover:border-gray-400"
          )}
          onClick={() => onToggleComplete(reminder.id)}
        >
          {reminder.completed && (
            <CheckCircle2 className="h-4 w-4 text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "font-semibold text-gray-900 dark:text-white",
              reminder.completed && "line-through"
            )}>
              {reminder.title}
            </h4>
            {reminder.isRecurring && (
              <Badge variant="outline" className="text-xs">
                <Repeat className="h-3 w-3 mr-1" />
                {reminder.recurringType}
              </Badge>
            )}
            {isOverdue && !reminder.completed && (
              <Badge className="bg-red-100 text-red-700 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {reminder.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {reminder.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {reminder.dateTime.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {reminder.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-1">
              {reminder.isActive ? (
                <Bell className="h-3 w-3" />
              ) : (
                <BellOff className="h-3 w-3" />
              )}
              {reminder.notifyVia.join(", ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(reminder.id)}
            className="h-8 w-8 p-0"
          >
            {reminder.isActive ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(reminder)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(reminder.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}




