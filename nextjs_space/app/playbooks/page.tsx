
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardAuth } from '@/components/dashboard-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Sparkles, Plus, Clock } from 'lucide-react'
import type { Playbook } from '@/lib/types'

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  
  // Create playbook form
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([])

  useEffect(() => {
    fetchPlaybooks()
    fetchBookmarks()
  }, [])

  const fetchPlaybooks = async () => {
    try {
      const res = await fetch('/api/dna-profile/playbooks')
      if (res.ok) {
        const data = await res.json()
        setPlaybooks(data)
        if (data.length > 0) {
          setActivePlaybook(data[0])
        }
      }
    } catch (error) {
      toast.error('Failed to load playbooks')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks')
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Failed to load bookmarks')
    }
  }

  const createPlaybook = async () => {
    if (!newTitle || selectedBookmarks.length === 0) {
      toast.error('Please enter a title and select at least one bookmark')
      return
    }

    try {
      const res = await fetch('/api/dna-profile/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          bookmarkIds: selectedBookmarks
        })
      })
      
      if (res.ok) {
        toast.success('Playbook created!')
        setShowCreateModal(false)
        setNewTitle('')
        setNewDescription('')
        setNewCategory('')
        setSelectedBookmarks([])
        fetchPlaybooks()
      } else {
        toast.error('Failed to create playbook')
      }
    } catch (error) {
      toast.error('Failed to create playbook')
    }
  }

  const toggleBookmark = (id: string) => {
    setSelectedBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextItem = () => {
    if (activePlaybook && currentIndex < activePlaybook.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <DashboardAuth>
        <DashboardLayout>
          <div className="flex items-center justify-center p-8">Loading playbooks...</div>
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
            <h1 className="text-3xl font-bold">PLAYBOOKS</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playbook
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Playbook</DialogTitle>
                    <DialogDescription>Select bookmarks to add to your playbook</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="My Playbook"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Describe your playbook..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Work, Learning, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Select Bookmarks ({selectedBookmarks.length})</Label>
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {bookmarks.map(bookmark => (
                          <div
                            key={bookmark.id}
                            className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-muted"
                            onClick={() => toggleBookmark(bookmark.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBookmarks.includes(bookmark.id)}
                              readOnly
                              className="w-4 h-4"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{bookmark.title}</div>
                              <div className="text-sm text-muted-foreground truncate">{bookmark.url}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={createPlaybook} className="w-full">Create Playbook</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {playbooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">NO PLAYBOOKS YET</h3>
                <p className="text-muted-foreground mb-4">Create your first playbook to get started</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Playbook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="font-semibold mb-4">MY PLAYBOOKS</h3>
                {playbooks.map(playbook => (
                  <Card
                    key={playbook.id}
                    className={`cursor-pointer transition-all ${
                      activePlaybook?.id === playbook.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setActivePlaybook(playbook)
                      setCurrentIndex(0)
                      setIsPlaying(false)
                    }}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold truncate">{playbook.title}</h4>
                      <p className="text-sm text-muted-foreground">{playbook.items.length} items</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        {formatDuration(playbook.duration)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Player */}
              <div className="lg:col-span-9 space-y-4 sm:space-y-6">
                {activePlaybook && (
                  <>
                    {/* Now Playing */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-bold">{activePlaybook.title}</h2>
                            <p className="text-muted-foreground">{activePlaybook.description}</p>
                          </div>
                          {activePlaybook.category && (
                            <Badge variant="secondary">{activePlaybook.category}</Badge>
                          )}
                        </div>
                        
                        {activePlaybook.items[currentIndex] && (
                          <div className="bg-muted rounded-lg p-6 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center">
                                {activePlaybook.items[currentIndex].bookmark.favicon ? (
                                  <img
                                    src={activePlaybook.items[currentIndex].bookmark.favicon}
                                    alt=""
                                    className="w-10 h-10"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-primary/10 rounded" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold">
                                  {activePlaybook.items[currentIndex].bookmark.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {activePlaybook.items[currentIndex].bookmark.url}
                                </p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDuration(activePlaybook.items[currentIndex].duration)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="ghost" size="icon">
                            <Shuffle className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={prevItem} disabled={currentIndex === 0}>
                            <SkipBack className="w-5 h-5" />
                          </Button>
                          <Button size="icon" onClick={togglePlay}>
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextItem}
                            disabled={currentIndex === activePlaybook.items.length - 1}
                          >
                            <SkipForward className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Repeat className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Progress */}
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                          Item {currentIndex + 1} of {activePlaybook.items.length}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Playlist */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">PLAYLIST</h3>
                        <div className="space-y-2">
                          {activePlaybook.items.map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                index === currentIndex ? 'bg-primary/10' : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setCurrentIndex(index)
                                setIsPlaying(true)
                              }}
                            >
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{item.bookmark.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">{item.bookmark.url}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">{formatDuration(item.duration)}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardAuth>
  )
}
