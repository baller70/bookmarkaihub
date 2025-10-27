
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GitCompare } from 'lucide-react'

interface Capsule {
  id: string
  title: string
}

interface CompareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  capsules: Capsule[]
}

export function CompareModal({ open, onOpenChange, capsules }: CompareModalProps) {
  const [fromCapsule, setFromCapsule] = useState('')
  const [toCapsule, setToCapsule] = useState('')

  const handleCompare = () => {
    if (!fromCapsule || !toCapsule) {
      return
    }
    // Handle compare logic here
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Capsules
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fromCapsule">From</Label>
            <Select value={fromCapsule} onValueChange={setFromCapsule}>
              <SelectTrigger id="fromCapsule">
                <SelectValue placeholder="Select first capsule" />
              </SelectTrigger>
              <SelectContent>
                {capsules.map((capsule) => (
                  <SelectItem key={capsule.id} value={capsule.id}>
                    {capsule.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toCapsule">To</Label>
            <Select value={toCapsule} onValueChange={setToCapsule}>
              <SelectTrigger id="toCapsule">
                <SelectValue placeholder="Select second capsule" />
              </SelectTrigger>
              <SelectContent>
                {capsules.map((capsule) => (
                  <SelectItem key={capsule.id} value={capsule.id}>
                    {capsule.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompare} 
            disabled={!fromCapsule || !toCapsule}
            className="bg-black text-white hover:bg-black/90"
          >
            Compare
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
