"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Save, Timer } from "lucide-react"
import { toast } from "sonner"

interface SettingsTabProps {
  bookmarkId: string
}

export function SettingsTab({ bookmarkId }: SettingsTabProps) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [isEnabled, setIsEnabled] = useState(true)
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreak, setShortBreak] = useState(5)
  const [longBreak, setLongBreak] = useState(15)
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (bookmarkId) {
      fetchSettings()
    }
  }, [bookmarkId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/timer-settings/${bookmarkId}`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        // Update form state
        setIsEnabled(data.isEnabled)
        setWorkDuration(Math.round(data.workDuration / 60))
        setShortBreak(Math.round(data.shortBreak / 60))
        setLongBreak(Math.round(data.longBreak / 60))
        setAutoStartBreaks(data.autoStartBreaks)
        setAutoStartPomodoros(data.autoStartPomodoros)
        setSoundEnabled(data.soundEnabled)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/timer-settings/${bookmarkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled,
          workDuration: workDuration * 60,
          shortBreak: shortBreak * 60,
          longBreak: longBreak * 60,
          autoStartBreaks,
          autoStartPomodoros,
          soundEnabled
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setSettings(updated)
        toast.success('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timer Enable/Disable */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Pomodoro Timer</h3>
              <p className="text-sm text-gray-500">Turn the timer feature on or off</p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {/* Timer Durations */}
      <div className="border rounded-lg p-6 bg-white space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" />
          Timer Durations (in minutes)
        </h3>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Work Duration
          </label>
          <Input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 25 minutes</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Short Break
          </label>
          <Input
            type="number"
            min="1"
            max="30"
            value={shortBreak}
            onChange={(e) => setShortBreak(parseInt(e.target.value) || 5)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 5 minutes</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Long Break
          </label>
          <Input
            type="number"
            min="1"
            max="60"
            value={longBreak}
            onChange={(e) => setLongBreak(parseInt(e.target.value) || 15)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 15 minutes</p>
        </div>
      </div>

      {/* Auto-start Options */}
      <div className="border rounded-lg p-6 bg-white space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-start Options</h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Auto-start Breaks</p>
            <p className="text-xs text-gray-500">Automatically start break timer after work session</p>
          </div>
          <Switch
            checked={autoStartBreaks}
            onCheckedChange={setAutoStartBreaks}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Auto-start Pomodoros</p>
            <p className="text-xs text-gray-500">Automatically start next work session after break</p>
          </div>
          <Switch
            checked={autoStartPomodoros}
            onCheckedChange={setAutoStartPomodoros}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Sound Notifications</p>
            <p className="text-xs text-gray-500">Play sound when timer completes</p>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-8"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
