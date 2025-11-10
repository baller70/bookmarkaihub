
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Mail, Smartphone, MessageSquare, Bell, Clock } from "lucide-react"
import { toast } from "sonner"

interface Preference {
  id: string
  emailEnabled: boolean
  emailDaily: boolean
  emailWeekly: boolean
  emailImportant: boolean
  appPush: boolean
  appReminders: boolean
  appUpdates: boolean
  smsEnabled: boolean
  smsImportantOnly: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

interface PreferenceTabProps {
  bookmarkId: string
}

export function PreferenceTab({ bookmarkId }: PreferenceTabProps) {
  const [preferences, setPreferences] = useState<Preference | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreferences()
  }, [bookmarkId])

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`/api/notifications/preference/${bookmarkId}`)
      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updates: Partial<Preference>) => {
    if (!preferences) return

    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)

    try {
      const res = await fetch(`/api/notifications/preference/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success("Preferences updated")
      } else {
        toast.error("Failed to update preferences")
        fetchPreferences() // Revert on error
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("An error occurred")
      fetchPreferences() // Revert on error
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!preferences) {
    return <div className="text-center py-8">No preferences found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold uppercase">NOTIFICATION PREFERENCES</h3>
        <p className="text-sm text-gray-500">Customize how you receive notifications</p>
      </div>

      {/* Email Notifications */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold uppercase">EMAIL NOTIFICATIONS</h4>
        </div>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enable Email Notifications</label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => handleUpdate({ emailEnabled: checked })}
            />
          </div>

          {preferences.emailEnabled && (
            <>
              <div className="flex items-center justify-between">
                <label>Daily Digest</label>
                <Switch
                  checked={preferences.emailDaily}
                  onCheckedChange={(checked) => handleUpdate({ emailDaily: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label>Weekly Summary</label>
                <Switch
                  checked={preferences.emailWeekly}
                  onCheckedChange={(checked) => handleUpdate({ emailWeekly: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label>Important Reminders Only</label>
                <Switch
                  checked={preferences.emailImportant}
                  onCheckedChange={(checked) => handleUpdate({ emailImportant: checked })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* App Notifications */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          <h4 className="font-bold uppercase">APP NOTIFICATIONS</h4>
        </div>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <label>Push Notifications</label>
            <Switch
              checked={preferences.appPush}
              onCheckedChange={(checked) => handleUpdate({ appPush: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label>Reminder Alerts</label>
            <Switch
              checked={preferences.appReminders}
              onCheckedChange={(checked) => handleUpdate({ appReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label>App Updates</label>
            <Switch
              checked={preferences.appUpdates}
              onCheckedChange={(checked) => handleUpdate({ appUpdates: checked })}
            />
          </div>
        </div>
      </div>

      {/* SMS Notifications (Premium) */}
      <div className="border rounded-lg p-4 space-y-4 bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold uppercase">SMS NOTIFICATIONS</h4>
          </div>
          <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded font-medium">PREMIUM</span>
        </div>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between opacity-50">
            <label>Enable SMS Notifications</label>
            <Switch disabled checked={preferences.smsEnabled} />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <label>Important Only</label>
            <Switch disabled checked={preferences.smsImportantOnly} />
          </div>
        </div>
        
        <p className="text-sm text-amber-800 pl-7">
          Upgrade to Premium to receive SMS notifications
        </p>
      </div>

      {/* Quiet Hours */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <h4 className="font-bold uppercase">QUIET HOURS</h4>
        </div>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enable Quiet Hours</label>
              <p className="text-sm text-gray-500">Mute notifications during specific times</p>
            </div>
            <Switch
              checked={preferences.quietHoursEnabled}
              onCheckedChange={(checked) => handleUpdate({ quietHoursEnabled: checked })}
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">START TIME</label>
                <Input
                  type="time"
                  value={preferences.quietHoursStart || "22:00"}
                  onChange={(e) => handleUpdate({ quietHoursStart: e.target.value })}
                  className="!bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">END TIME</label>
                <Input
                  type="time"
                  value={preferences.quietHoursEnd || "08:00"}
                  onChange={(e) => handleUpdate({ quietHoursEnd: e.target.value })}
                  className="!bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
