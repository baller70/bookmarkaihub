
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { Calendar as CalendarIcon, List, Plus, Clock, Folder, FileText, Download, Share2, RotateCcw, Sparkles } from 'lucide-react'
import type { TimeCapsule, CapsuleViewMode } from '@/lib/types'

export default function TimeCapsulePage() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [viewMode, setViewMode] = useState<CapsuleViewMode>('list')
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Create form
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    fetchCapsules()
  }, [])

  const fetchCapsules = async () => {
    try {
      const res = await fetch('/api/dna-profile/time-capsules')
      if (res.ok) {
        const data = await res.json()
        setCapsules(data)
      }
    } catch (error) {
      toast.error('Failed to load time capsules')
    } finally {
      setLoading(false)
    }
  }

  const createCapsule = async () => {
    if (!newTitle) {
      toast.error('Please enter a title')
      return
    }

    try {
      const res = await fetch('/api/dna-profile/time-capsules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          date: newDate?.toISOString()
        })
      })
      
      if (res.ok) {
        toast.success('Time capsule created!')
        setShowCreateModal(false)
        setNewTitle('')
        setNewDescription('')
        setNewDate(new Date())
        fetchCapsules()
      } else {
        toast.error('Failed to create time capsule')
      }
    } catch (error) {
      toast.error('Failed to create time capsule')
    }
  }

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="flex items-center justify-center p-8">Loading time capsules...</div>
        </DashboardLayout>
      </DashboardAuth>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Time Capsule</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Snapshot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Time Capsule</DialogTitle>
                    <DialogDescription>
                      Capture a snapshot of your current bookmarks and categories
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="My Time Capsule"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Describe this snapshot..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={setNewDate}
                        className="rounded-md border"
                      />
                    </div>
                    <Button onClick={createCapsule} className="w-full">Create Snapshot</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>

          {capsules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No time capsules yet</h3>
                <p className="text-muted-foreground mb-4">Create your first snapshot to preserve your bookmarks</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Snapshot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Capsule List */}
              <div className={selectedCapsule ? 'col-span-7' : 'col-span-12'}>
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {capsules.map(capsule => (
                      <Card
                        key={capsule.id}
                        className={`cursor-pointer transition-all ${
                          selectedCapsule?.id === capsule.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedCapsule(capsule)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1">{capsule.title}</h3>
                              <p className="text-sm text-muted-foreground">{capsule.description}</p>
                            </div>
                            <Badge variant="secondary">
                              {new Date(capsule.date).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-semibold">{capsule.totalBookmarks}</div>
                                <div className="text-xs text-muted-foreground">Bookmarks</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-semibold">{capsule.totalFolders}</div>
                                <div className="text-xs text-muted-foreground">Folders</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-semibold">{formatFileSize(capsule.totalSize)}</div>
                                <div className="text-xs text-muted-foreground">Size</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {viewMode === 'calendar' && (
                  <Card>
                    <CardContent className="p-6">
                      <Calendar
                        mode="single"
                        className="rounded-md border"
                        modifiers={{
                          hasCapsule: capsules.map(c => new Date(c.date))
                        }}
                        modifiersStyles={{
                          hasCapsule: {
                            fontWeight: 'bold',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '50%'
                          }
                        }}
                      />
                      <div className="mt-4 space-y-2">
                        {capsules.map(capsule => (
                          <div
                            key={capsule.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedCapsule(capsule)}
                          >
                            <span className="font-medium">{capsule.title}</span>
                            <Badge variant="secondary">
                              {new Date(capsule.date).toLocaleDateString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Detail Panel */}
              {selectedCapsule && (
                <div className="col-span-5 space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Details</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCapsule(null)}
                        >
                          ×
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-semibold mb-1">Title</div>
                          <div className="text-sm text-muted-foreground">{selectedCapsule.title}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-semibold mb-1">Description</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCapsule.description || 'No description'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-1">Date</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedCapsule.date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Summary
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCapsule.aiSummary || 'No summary available'}
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <Button className="w-full" variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3">Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">Bookmarks</span>
                          <span className="font-semibold">{selectedCapsule.totalBookmarks}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">Folders</span>
                          <span className="font-semibold">{selectedCapsule.totalFolders}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">Total Size</span>
                          <span className="font-semibold">{formatFileSize(selectedCapsule.totalSize)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">Created</span>
                          <span className="font-semibold">
                            {new Date(selectedCapsule.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
