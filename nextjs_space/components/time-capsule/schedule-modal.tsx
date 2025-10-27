
'use client'

import { useState } from 'react'
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

interface ScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleModal({ open, onOpenChange }: ScheduleModalProps) {
  const [frequency, setFrequency] = useState('weekly')
  const [maxCapsules, setMaxCapsules] = useState('10')
  const [enableAutoSnapshots, setEnableAutoSnapshots] = useState(true)
  const [autoCleanup, setAutoCleanup] = useState(true)

  const handleSave = () => {
    // Handle save logic here
    onOpenChange(false)
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
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-black/90">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
