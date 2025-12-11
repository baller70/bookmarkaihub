"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Clock, 
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  BarChart3,
  Tag
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TimeEntry {
  id: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  category: string
  billable: boolean
  hourlyRate?: number
}

interface TimeTrackingToolProps {
  bookmarkId: string
}

const CATEGORIES = [
  "Development",
  "Design",
  "Research",
  "Meetings",
  "Admin",
  "Other"
]

export function TimeTrackingTool({ bookmarkId }: TimeTrackingToolProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Development")
  const [billable, setBillable] = useState(false)
  const [hourlyRate, setHourlyRate] = useState(50)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualData, setManualData] = useState({
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    category: "Development",
    billable: false
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadEntries()
  }, [bookmarkId])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const loadEntries = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/time-tracking`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : undefined
        })))
      }
    } catch (error) {
      console.error("Error loading time entries:", error)
    }
  }

  const startTimer = () => {
    const entry: TimeEntry = {
      id: `entry-${Date.now()}`,
      description: description || "Untitled",
      startTime: new Date(),
      duration: 0,
      category,
      billable,
      hourlyRate: billable ? hourlyRate : undefined
    }
    setCurrentEntry(entry)
    setIsRunning(true)
    setElapsedTime(0)
  }

  const stopTimer = () => {
    if (!currentEntry) return

    const endTime = new Date()
    const completedEntry: TimeEntry = {
      ...currentEntry,
      endTime,
      duration: elapsedTime,
      description: description || "Untitled"
    }

    setEntries([completedEntry, ...entries])
    setCurrentEntry(null)
    setIsRunning(false)
    setElapsedTime(0)
    setDescription("")
    toast.success("Time entry saved!")

    // Save to API
    try {
      fetch(`/api/bookmarks/${bookmarkId}/time-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completedEntry)
      })
    } catch (error) {
      console.error("Error saving time entry:", error)
    }
  }

  const addManualEntry = () => {
    const startDate = new Date(`${manualData.date}T${manualData.startTime}`)
    const endDate = new Date(`${manualData.date}T${manualData.endTime}`)
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)

    if (duration <= 0) {
      toast.error("End time must be after start time")
      return
    }

    const entry: TimeEntry = {
      id: `entry-${Date.now()}`,
      description: manualData.description || "Manual entry",
      startTime: startDate,
      endTime: endDate,
      duration,
      category: manualData.category,
      billable: manualData.billable,
      hourlyRate: manualData.billable ? hourlyRate : undefined
    }

    setEntries([entry, ...entries])
    setShowManualEntry(false)
    setManualData({
      description: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      category: "Development",
      billable: false
    })
    toast.success("Manual entry added!")
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
    toast.success("Entry deleted")
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2)
  }

  const exportReport = () => {
    const csv = [
      ["Date", "Description", "Category", "Duration (hrs)", "Billable", "Amount"].join(","),
      ...entries.map(e => [
        e.startTime.toLocaleDateString(),
        `"${e.description}"`,
        e.category,
        formatHours(e.duration),
        e.billable ? "Yes" : "No",
        e.billable && e.hourlyRate
          ? `$${((e.duration / 3600) * e.hourlyRate).toFixed(2)}`
          : ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `time-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported!")
  }

  // Stats
  const totalTime = entries.reduce((acc, e) => acc + e.duration, 0)
  const billableTime = entries.filter(e => e.billable).reduce((acc, e) => acc + e.duration, 0)
  const totalEarnings = entries
    .filter(e => e.billable && e.hourlyRate)
    .reduce((acc, e) => acc + (e.duration / 3600) * (e.hourlyRate || 0), 0)

  // Group by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.startTime.toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, TimeEntry[]>)

  return (
    <div className="h-full flex flex-col">
      {/* Header with Timer */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" />
            <h2 className="font-bold text-lg uppercase">TIME TRACKING</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowManualEntry(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Manual
            </Button>
            <Button size="sm" variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-4">
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1"
              disabled={isRunning}
            />
            <Select value={category} onValueChange={setCategory} disabled={isRunning}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="rounded"
                disabled={isRunning}
              />
              <DollarSign className="h-4 w-4 text-gray-400" />
            </label>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
              {formatDuration(elapsedTime)}
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={startTimer}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={stopTimer}
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatHours(totalTime)}h
            </div>
            <div className="text-xs text-gray-500 uppercase">Total Time</div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {formatHours(billableTime)}h
            </div>
            <div className="text-xs text-gray-500 uppercase">Billable</div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-2xl font-bold text-violet-600">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 uppercase">Earnings</div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-auto p-4">
        {Object.keys(entriesByDate).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              NO TIME ENTRIES
            </h3>
            <p className="text-sm text-gray-400">
              Start the timer to track your time
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(entriesByDate).map(([date, dateEntries]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">
                    {date}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {formatHours(dateEntries.reduce((acc, e) => acc + e.duration, 0))}h
                  </span>
                </div>
                <div className="space-y-2">
                  {dateEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {entry.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {entry.category}
                          </Badge>
                          {entry.billable && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Billable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {entry.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {entry.endTime && ` - ${entry.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {formatDuration(entry.duration)}
                        </p>
                        {entry.billable && entry.hourlyRate && (
                          <p className="text-sm text-green-600">
                            ${((entry.duration / 3600) * entry.hourlyRate).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEntry(entry.id)}
                        className="h-8 w-8 p-0 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Manual Time Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Description
              </label>
              <Input
                placeholder="What did you work on?"
                value={manualData.description}
                onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Date
              </label>
              <Input
                type="date"
                value={manualData.date}
                onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={manualData.startTime}
                  onChange={(e) => setManualData({ ...manualData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  End Time
                </label>
                <Input
                  type="time"
                  value={manualData.endTime}
                  onChange={(e) => setManualData({ ...manualData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Category
              </label>
              <Select
                value={manualData.category}
                onValueChange={(value) => setManualData({ ...manualData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={manualData.billable}
                onChange={(e) => setManualData({ ...manualData, billable: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Billable</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={addManualEntry}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




