
'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface ScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleModal({ open, onOpenChange }: ScheduleModalProps) {
  const { data, isLoading, mutate } = useSWR(open ? '/api/time-capsule/settings' : null, fetcher)
  const [frequency, setFrequency] = useState('weekly')
  const [maxCapsules, setMaxCapsules] = useState('10')
  const [enableAutoSnapshots, setEnableAutoSnapshots] = useState(true)
  const [autoCleanup, setAutoCleanup] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setFrequency(data.frequency || 'weekly')
      setMaxCapsules(String(data.maxCapsules ?? '10'))
      setEnableAutoSnapshots(Boolean(data.enableAutoSnapshots ?? true))
      setAutoCleanup(Boolean(data.autoCleanup ?? true))
    }
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/time-capsule/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency,
          maxCapsules: Number(maxCapsules) || 10,
          enableAutoSnapshots,
          autoCleanup,
        }),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      await mutate()
      toast.success('Schedule saved')
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving time capsule settings:', error)
      toast.error('Could not save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapsules">Max Capsules</Label>
            <Input
              id="maxCapsules"
              type="number"
              value={maxCapsules}
              onChange={(e) => setMaxCapsules(e.target.value)}
              min={1}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enableAutoSnapshots" className="flex-1">
              Enable automatic snapshots
            </Label>
            <Switch
              id="enableAutoSnapshots"
              checked={enableAutoSnapshots}
              onCheckedChange={setEnableAutoSnapshots}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoCleanup" className="flex-1">
              Auto cleanup old capsules
            </Label>
            <Switch
              id="autoCleanup"
              checked={autoCleanup}
              onCheckedChange={setAutoCleanup}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-black text-white hover:bg-black/90">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
