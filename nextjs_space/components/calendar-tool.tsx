"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CalendarDays, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Flag,
  Trash2,
  Edit,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  allDay: boolean
  location?: string
  type: "deadline" | "milestone" | "meeting" | "reminder"
  priority: "low" | "medium" | "high"
  description?: string
}

interface CalendarToolProps {
  bookmarkId: string
}

const EVENT_COLORS = {
  deadline: "bg-red-500",
  milestone: "bg-purple-500",
  meeting: "bg-blue-500",
  reminder: "bg-amber-500"
}

const PRIORITY_COLORS = {
  low: "bg-gray-400",
  medium: "bg-amber-400",
  high: "bg-red-400"
}

export function CalendarTool({ bookmarkId }: CalendarToolProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    allDay: false,
    location: "",
    type: "deadline" as CalendarEvent["type"],
    priority: "medium" as CalendarEvent["priority"],
    description: ""
  })

  useEffect(() => {
    loadEvents()
  }, [bookmarkId])

  const loadEvents = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/calendar`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          endDate: e.endDate ? new Date(e.endDate) : undefined
        })))
      }
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    return { daysInMonth, startingDay }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const openNewEvent = (date?: Date) => {
    const targetDate = date || new Date()
    setFormData({
      title: "",
      date: targetDate.toISOString().split("T")[0],
      time: "09:00",
      endDate: "",
      endTime: "",
      allDay: false,
      location: "",
      type: "deadline",
      priority: "medium",
      description: ""
    })
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const openEditEvent = (event: CalendarEvent) => {
    setFormData({
      title: event.title,
      date: event.date.toISOString().split("T")[0],
      time: event.allDay ? "" : event.date.toTimeString().slice(0, 5),
      endDate: event.endDate ? event.endDate.toISOString().split("T")[0] : "",
      endTime: event.endDate && !event.allDay ? event.endDate.toTimeString().slice(0, 5) : "",
      allDay: event.allDay,
      location: event.location || "",
      type: event.type,
      priority: event.priority,
      description: event.description || ""
    })
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  const saveEvent = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Please fill in required fields")
      return
    }

    const eventDate = formData.allDay 
      ? new Date(formData.date)
      : new Date(`${formData.date}T${formData.time || "00:00"}`)

    const endDate = formData.endDate
      ? formData.allDay
        ? new Date(formData.endDate)
        : new Date(`${formData.endDate}T${formData.endTime || "00:00"}`)
      : undefined

    const event: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: formData.title,
      date: eventDate,
      endDate,
      allDay: formData.allDay,
      location: formData.location,
      type: formData.type,
      priority: formData.priority,
      description: formData.description
    }

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? event : e))
      toast.success("Event updated!")
    } else {
      setEvents([...events, event])
      toast.success("Event created!")
    }

    setShowEventDialog(false)

    // Save to API
    try {
      await fetch(`/api/bookmarks/${bookmarkId}/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    toast.success("Event deleted")
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const today = new Date()

  // Upcoming events
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-lg uppercase">CALENDAR</h2>
            <Badge variant="outline" className="ml-2">
              {events.length} events
            </Badge>
          </div>
          <Button size="sm" onClick={() => openNewEvent()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
            {monthName}
          </h3>
          <Button size="sm" variant="ghost" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dayEvents = getEventsForDate(date)
              const isToday = date.toDateString() === today.toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square p-1 border rounded-lg cursor-pointer transition-colors",
                    isToday && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                    isSelected && "ring-2 ring-blue-500",
                    !isToday && "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setSelectedDate(date)}
                  onDoubleClick={() => openNewEvent(date)}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isToday ? "text-blue-600" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-[10px] px-1 rounded truncate text-white",
                          EVENT_COLORS[event.type]
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar - Upcoming events */}
        <div className="w-64 border-l bg-white dark:bg-gray-900 p-4 overflow-auto hidden md:block">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Upcoming
          </h4>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="p-2 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => openEditEvent(event)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      EVENT_COLORS[event.type]
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString()}
                        {!event.allDay && ` at ${event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      PRIORITY_COLORS[event.priority]
                    )} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Event Types
            </h4>
            <div className="space-y-1">
              {Object.entries(EVENT_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded", color)} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {editingEvent ? "Edit Event" : "New Event"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Title *
              </label>
              <Input
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  Time
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={formData.allDay}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">All day event</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Location
              </label>
              <Input
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {editingEvent && (
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => {
                  deleteEvent(editingEvent.id)
                  setShowEventDialog(false)
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveEvent}>
                {editingEvent ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




