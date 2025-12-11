
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
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateSnapshotModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateSnapshotModal({ open, onOpenChange, onSuccess }: CreateSnapshotModalProps) {
  const [name, setName] = useState('Q1 2024 Snapshot')
  const [description, setDescription] = useState('')
  const [includeSettings, setIncludeSettings] = useState(true)
  const [includeAnalytics, setIncludeAnalytics] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the snapshot')
      return
    }
    
    setIsCreating(true)
    
    try {
      const response = await fetch('/api/time-capsule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          description: description || null,
          includeSettings,
          includeAnalytics
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create time capsule')
      }

      toast.success('Time capsule created successfully!')
      onOpenChange(false)
      setName('Q1 2024 Snapshot')
      setDescription('')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating time capsule:', error)
      toast.error('Failed to create time capsule')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    setName('Q1 2024 Snapshot')
    setDescription('')
    onOpenChange(false)
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
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating} className="bg-black text-white hover:bg-black/90">
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Capsule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
