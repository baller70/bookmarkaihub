
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
  snapshot?: any
}

interface CompareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  capsules: Capsule[]
}

export function CompareModal({ open, onOpenChange, capsules }: CompareModalProps) {
  const [fromCapsule, setFromCapsule] = useState('')
  const [toCapsule, setToCapsule] = useState('')
  const [result, setResult] = useState<{
    summary: string
    counts: {
      bookmarks: number
      categories: number
      tags: number
      favorites: number
    }
    delta: {
      bookmarks: number
      categories: number
      tags: number
      favorites: number
    }
  } | null>(null)

  const handleCompare = () => {
    if (!fromCapsule || !toCapsule) {
      return
    }

    const from = capsules.find((c) => c.id === fromCapsule)
    const to = capsules.find((c) => c.id === toCapsule)

    if (!from || !to) return

    const fromSnap = from.snapshot || {}
    const toSnap = to.snapshot || {}

    const counts = (snap: any) => ({
      bookmarks: snap?.bookmarks?.length || 0,
      categories: snap?.categories?.length || 0,
      tags: snap?.tags?.length || 0,
      favorites: snap?.bookmarks?.filter((b: any) => b.isFavorite)?.length || 0,
    })

    const fromCounts = counts(fromSnap)
    const toCounts = counts(toSnap)

    setResult({
      summary: `${from.title} → ${to.title}`,
      counts: toCounts,
      delta: {
        bookmarks: toCounts.bookmarks - fromCounts.bookmarks,
        categories: toCounts.categories - fromCounts.categories,
        tags: toCounts.tags - fromCounts.tags,
        favorites: toCounts.favorites - fromCounts.favorites,
      },
    })
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

        {result && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="text-sm font-semibold text-gray-900 uppercase">{result.summary}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-xs text-gray-500">Bookmarks</div>
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>{result.counts.bookmarks}</span>
                  <span className={result.delta.bookmarks === 0 ? 'text-gray-500' : result.delta.bookmarks > 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.delta.bookmarks > 0 ? `+${result.delta.bookmarks}` : result.delta.bookmarks}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-xs text-gray-500">Categories</div>
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>{result.counts.categories}</span>
                  <span className={result.delta.categories === 0 ? 'text-gray-500' : result.delta.categories > 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.delta.categories > 0 ? `+${result.delta.categories}` : result.delta.categories}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-xs text-gray-500">Tags</div>
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>{result.counts.tags}</span>
                  <span className={result.delta.tags === 0 ? 'text-gray-500' : result.delta.tags > 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.delta.tags > 0 ? `+${result.delta.tags}` : result.delta.tags}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-xs text-gray-500">Favorites</div>
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>{result.counts.favorites}</span>
                  <span className={result.delta.favorites === 0 ? 'text-gray-500' : result.delta.favorites > 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.delta.favorites > 0 ? `+${result.delta.favorites}` : result.delta.favorites}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
