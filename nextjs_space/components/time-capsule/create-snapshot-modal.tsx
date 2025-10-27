
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

interface CreateSnapshotModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSnapshotModal({ open, onOpenChange }: CreateSnapshotModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [includeSettings, setIncludeSettings] = useState(true)
  const [includeAnalytics, setIncludeAnalytics] = useState(true)

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the snapshot')
      return
    }
    
    // Handle create logic here
    toast.success('Time capsule created successfully!')
    onOpenChange(false)
    setName('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Create Time Capsule
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Q1 2024 Snapshot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this snapshot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeSettings" className="flex-1">
              Include settings
            </Label>
            <Switch
              id="includeSettings"
              checked={includeSettings}
              onCheckedChange={setIncludeSettings}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeAnalytics" className="flex-1">
              Include analytics
            </Label>
            <Switch
              id="includeAnalytics"
              checked={includeAnalytics}
              onCheckedChange={setIncludeAnalytics}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-black text-white hover:bg-black/90">
            Create Capsule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
