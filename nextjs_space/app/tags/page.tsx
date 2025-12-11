"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardAuth } from "@/components/dashboard-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Tag, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  RefreshCw,
  Hash,
  BookOpen,
  Sparkles,
  BarChart3,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Layers
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Tag as TagType } from "@/types/bookmark"

type ViewMode = 'grid' | 'alphabetical' | 'cloud'

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'bookmarks'>('bookmarks')
  const [viewMode, setViewMode] = useState<ViewMode>('alphabetical')

  // Expanded sections for alphabetical view
  const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set())

  // Create tag modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#8B5CF6")

  // Edit tag modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [editTagName, setEditTagName] = useState("")
  const [editTagColor, setEditTagColor] = useState("")

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
        // Auto-expand first 3 letters that have tags
        const letters = new Set<string>()
        data.slice(0, 20).forEach((tag: TagType) => {
          const letter = tag.name.charAt(0).toUpperCase()
          if (letters.size < 3) letters.add(letter)
        })
        setExpandedLetters(letters)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
      toast.error("Failed to load tags")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = () => {
    setNewTagName("")
    setNewTagColor("#8B5CF6")
    setShowCreateModal(true)
  }

  const submitCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      })

      if (response.ok) {
        toast.success("Tag created successfully!")
        fetchTags()
        setShowCreateModal(false)
        setNewTagName("")
        setNewTagColor("#8B5CF6")
      } else {
        toast.error("Failed to create tag")
      }
    } catch {
      toast.error("Failed to create tag")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditTag = (tag: TagType) => {
    setEditingTag(tag)
    setEditTagName(tag.name)
    setEditTagColor(tag.color || "#8B5CF6")
    setShowEditModal(true)
  }

  const submitEditTag = async () => {
    if (!editingTag || !editTagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTagName.trim(), color: editTagColor }),
      })

      if (response.ok) {
        toast.success("Tag updated successfully!")
        fetchTags()
        setShowEditModal(false)
        setEditingTag(null)
      } else {
        toast.error("Failed to update tag")
      }
    } catch {
      toast.error("Failed to update tag")
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setTagToDelete(tagId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      const response = await fetch(`/api/tags/${tagToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Tag deleted successfully")
        fetchTags()
      } else {
        toast.error("Failed to delete tag")
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast.error("Failed to delete tag")
    } finally {
      setShowDeleteDialog(false)
      setTagToDelete(null)
    }
  }

  const toggleLetter = (letter: string) => {
    setExpandedLetters(prev => {
      const next = new Set(prev)
      if (next.has(letter)) {
        next.delete(letter)
      } else {
        next.add(letter)
      }
      return next
    })
  }

  const expandAllLetters = () => {
    const allLetters = new Set(
      filteredTags.map(t => t.name.charAt(0).toUpperCase())
    )
    setExpandedLetters(allLetters)
  }

  const collapseAllLetters = () => {
    setExpandedLetters(new Set())
  }

  const filteredTags = useMemo(() => {
    return tags
      .filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'bookmarks') {
          return (b._count?.bookmarks || 0) - (a._count?.bookmarks || 0)
        }
        return a.name.localeCompare(b.name)
      })
  }, [tags, searchQuery, sortBy])

  // Group tags by first letter
  const groupedTags = useMemo(() => {
    const groups: Record<string, TagType[]> = {}
    
    filteredTags.forEach(tag => {
      const letter = tag.name.charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(tag)
    })
    
    // Sort letters alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredTags])

  // Top tags (most used)
  const topTags = useMemo(() => {
    return [...tags]
      .filter(t => (t._count?.bookmarks || 0) > 0)
      .sort((a, b) => (b._count?.bookmarks || 0) - (a._count?.bookmarks || 0))
      .slice(0, 10)
  }, [tags])

  // Recent/unused tags
  const unusedTags = useMemo(() => {
    return tags.filter(t => (t._count?.bookmarks || 0) === 0)
  }, [tags])

  const totalBookmarks = tags.reduce((acc, tag) => acc + (tag._count?.bookmarks || 0), 0)
  const activeTags = tags.filter(t => (t._count?.bookmarks ?? 0) > 0).length
  const mostUsedTag = topTags[0]
  const maxBookmarks = mostUsedTag?._count?.bookmarks || 1

  // Render tag card
  const renderTagCard = (tag: TagType, compact: boolean = false) => {
    const bookmarkCount = tag._count?.bookmarks || 0
    const usagePercent = Math.min((bookmarkCount / maxBookmarks) * 100, 100)

    if (compact) {
      return (
        <div
          key={tag.id}
          className="group flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tag.color || '#8b5cf6'}20` }}
            >
              <Hash className="h-3.5 w-3.5" style={{ color: tag.color || '#8b5cf6' }} />
            </div>
            <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {tag.name}
            </span>
            <Badge variant="secondary" className="text-xs ml-1">
              {bookmarkCount}
            </Badge>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => { e.stopPropagation(); handleEditTag(tag); }}
            >
              <Pencil className="h-3 w-3 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id); }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Card
        key={tag.id}
        className="group p-4 bg-white dark:bg-slate-800 hover:shadow-lg transition-all border-gray-200 dark:border-slate-700"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tag.color || '#8b5cf6'}20` }}
            >
              <Hash className="h-5 w-5" style={{ color: tag.color || '#8b5cf6' }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {tag.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEditTag(tag)}
            >
              <Pencil className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => handleDeleteTag(tag.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Usage</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {usagePercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: tag.color || '#8b5cf6',
                width: `${usagePercent}%`,
              }}
            />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <DashboardAuth>
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Main Container with light black background */}
          <div className="max-w-7xl mx-auto bg-gray-900/5 dark:bg-gray-950/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Hash className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                      Tags
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Organize bookmarks with flexible labels
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTags}
                    className="h-9"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    className="h-9 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Tag
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tags.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeTags}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Most Used</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                      {mostUsedTag?.name || '—'}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unused Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{unusedTags.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Search, Filter, and View Mode */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('alphabetical')}
                    className={cn(
                      "h-8 px-3",
                      viewMode === 'alphabetical' && "bg-white dark:bg-slate-700 shadow-sm"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "h-8 px-3",
                      viewMode === 'grid' && "bg-white dark:bg-slate-700 shadow-sm"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('cloud')}
                    className={cn(
                      "h-8 px-3",
                      viewMode === 'cloud' && "bg-white dark:bg-slate-700 shadow-sm"
                    )}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Sort */}
                <Button
                  variant={sortBy === 'bookmarks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('bookmarks')}
                  className={cn("h-9", sortBy === 'bookmarks' && "bg-purple-600 hover:bg-purple-700")}
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Usage
                </Button>
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('name')}
                  className={cn("h-9", sortBy === 'name' && "bg-purple-600 hover:bg-purple-700")}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  A-Z
                </Button>
              </div>
            </div>

            {/* Top Tags Section */}
            {topTags.length > 0 && viewMode !== 'cloud' && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Top Tags
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    Most Used
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleEditTag(tag)}
                      className="group flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                    >
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: tag.color || '#8b5cf6' }}
                      >
                        <Hash className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {tag.name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        {tag._count?.bookmarks || 0}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Content */}
            {isLoading ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading tags...</p>
                </div>
              </div>
            ) : filteredTags.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Tags Found' : 'No Tags Yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {searchQuery ? 'Try adjusting your search query' : 'Create your first tag to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateTag} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                  </Button>
                )}
              </Card>
            ) : (
              <>
                {/* Cloud View */}
                {viewMode === 'cloud' && (
                  <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Tag Cloud
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {filteredTags.length} tags
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {filteredTags.map(tag => {
                        const bookmarkCount = tag._count?.bookmarks || 0
                        const sizeClass = bookmarkCount > maxBookmarks * 0.7 ? 'text-xl px-4 py-2' :
                                         bookmarkCount > maxBookmarks * 0.4 ? 'text-base px-3 py-1.5' :
                                         bookmarkCount > maxBookmarks * 0.2 ? 'text-sm px-2.5 py-1' :
                                         'text-xs px-2 py-1'
                        
                        return (
                          <button
                            key={tag.id}
                            onClick={() => handleEditTag(tag)}
                            className={cn(
                              "group rounded-full transition-all hover:shadow-md hover:scale-105",
                              sizeClass
                            )}
                            style={{ 
                              backgroundColor: `${tag.color || '#8b5cf6'}15`,
                              color: tag.color || '#8b5cf6',
                              borderWidth: 1,
                              borderColor: `${tag.color || '#8b5cf6'}30`
                            }}
                          >
                            <span className="font-medium">{tag.name}</span>
                            <span className="ml-1.5 opacity-60">({bookmarkCount})</span>
                          </button>
                        )
                      })}
                    </div>
                  </Card>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        {searchQuery ? 'Search Results' : 'All Tags'}
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTags.map((tag) => renderTagCard(tag))}
                    </div>
                  </>
                )}

                {/* Alphabetical View */}
                {viewMode === 'alphabetical' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        {searchQuery ? 'Search Results' : 'All Tags (A-Z)'}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={expandAllLetters}
                          className="h-7 text-xs"
                        >
                          Expand All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={collapseAllLetters}
                          className="h-7 text-xs"
                        >
                          Collapse All
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {filteredTags.length} tags
                        </Badge>
                      </div>
                    </div>

                    {/* Letter Navigation */}
                    <div className="flex flex-wrap gap-1 mb-6 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                      {groupedTags.map(([letter, letterTags]) => (
                        <button
                          key={letter}
                          onClick={() => toggleLetter(letter)}
                          className={cn(
                            "h-8 w-8 rounded-lg font-semibold text-sm transition-all",
                            expandedLetters.has(letter)
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          )}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    {/* Grouped Tags */}
                    <div className="space-y-4">
                      {groupedTags.map(([letter, letterTags]) => (
                        <Card
                          key={letter}
                          className="overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                        >
                          <button
                            onClick={() => toggleLetter(letter)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                {letter}
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {letter}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {letterTags.length} tag{letterTags.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {expandedLetters.has(letter) ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          
                          {expandedLetters.has(letter) && (
                            <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-4">
                                {letterTags.map(tag => renderTagCard(tag, true))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Unused Tags Section */}
                {unusedTags.length > 0 && viewMode !== 'cloud' && !searchQuery && (
                  <div className="mt-8">
                    <Card className="overflow-hidden bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-sm tracking-wider">
                              Unused Tags
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {unusedTags.length} tag{unusedTags.length !== 1 ? 's' : ''} with no bookmarks
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                          Consider cleaning up
                        </Badge>
                      </div>
                      <div className="px-4 pb-4 border-t border-amber-200 dark:border-amber-800/50">
                        <div className="flex flex-wrap gap-2 pt-4">
                          {unusedTags.slice(0, 20).map(tag => (
                            <div
                              key={tag.id}
                              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                            >
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: tag.color || '#8b5cf6' }}
                              />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {tag.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          {unusedTags.length > 20 && (
                            <Badge variant="secondary" className="text-xs">
                              +{unusedTags.length - 20} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>

      {/* Create Tag Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Create Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                onKeyDown={(e) => e.key === 'Enter' && submitCreateTag()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagColor">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tagColor"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateTag} disabled={isCreating} className="bg-purple-600 hover:bg-purple-700">
              {isCreating ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name and color.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTagName">Name</Label>
              <Input
                id="editTagName"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTagColor">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="editTagColor"
                  type="color"
                  value={editTagColor}
                  onChange={(e) => setEditTagColor(e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={editTagColor}
                  onChange={(e) => setEditTagColor(e.target.value)}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditTag} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This action cannot be undone.
              The tag will be removed from all bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardAuth>
  )
}
