"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { FallbackImage } from "@/components/ui/fallback-image"
import {
  Folder, MoreVertical, User, ArrowLeft, ExternalLink, Star, Eye, MoreHorizontal,
  Briefcase, Code, Music, Camera, Book, Heart,
  Rocket, Trophy, Target, Zap, Crown, Gift, Coffee,
  Home, Settings, Users, Bell, Mail, MessageSquare, Phone,
  Calendar, Clock, TrendingUp, BarChart, PieChart, Activity,
  ShoppingBag, ShoppingCart, CreditCard, DollarSign, Percent,
  Globe, MapPin, Navigation, Compass, Map, Plane,
  Film, Tv, Headphones, Radio, Mic, Volume2,
  Package, Box, Send, Download,
  FileText, Clipboard, File, FileCheck,
  Video, Monitor, Smartphone, Tablet, Laptop, Watch, Bluetooth,
  Wifi, Cloud, Database, Server, HardDrive, Cpu,
  Lock, Unlock, Key, Shield,
  Check, X, Plus, Minus, AlertCircle, AlertTriangle,
  Info, HelpCircle, Flag, Bookmark, Tag, Hash,
  Sun, Moon, CloudRain, CloudSnow, Wind, Umbrella,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown,
  Gamepad, Dumbbell, Truck, Bus, Car,
  Pizza, Utensils, Wine, Beer, IceCream, Cookie,
  Shirt, Award, Medal, Gem, Sparkles, Feather,
  FileAudio, FileVideo, Inbox, Edit2, Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { FitnessRings, RingData } from "@/components/ui/fitness-rings"
import { FitnessRingsModal } from "@/components/ui/fitness-rings-modal"
import { RingColorCustomizer } from "@/components/ui/ring-color-customizer"
import { toast } from "sonner"

// Default ring colors for fitness rings
const DEFAULT_RING_COLORS = {
  visits: "#EF4444", // Red
  tasks: "#22C55E",  // Green
  time: "#06B6D4",   // Cyan
}

// Icon mapping for all available icons
const iconMap: Record<string, any> = {
  folder: Folder,
  briefcase: Briefcase,
  code: Code,
  music: Music,
  camera: Camera,
  book: Book,
  heart: Heart,
  rocket: Rocket,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  crown: Crown,
  gift: Gift,
  coffee: Coffee,
  home: Home,
  settings: Settings,
  users: Users,
  user: User,
  bell: Bell,
  mail: Mail,
  'message-square': MessageSquare,
  phone: Phone,
  calendar: Calendar,
  clock: Clock,
  'trending-up': TrendingUp,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  activity: Activity,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'credit-card': CreditCard,
  'dollar-sign': DollarSign,
  percent: Percent,
  globe: Globe,
  'map-pin': MapPin,
  navigation: Navigation,
  compass: Compass,
  map: Map,
  plane: Plane,
  film: Film,
  tv: Tv,
  headphones: Headphones,
  radio: Radio,
  mic: Mic,
  'volume-2': Volume2,
  package: Package,
  box: Box,
  send: Send,
  download: Download,
  'file-text': FileText,
  clipboard: Clipboard,
  file: File,
  'file-check': FileCheck,
  video: Video,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  watch: Watch,
  bluetooth: Bluetooth,
  wifi: Wifi,
  cloud: Cloud,
  database: Database,
  server: Server,
  'hard-drive': HardDrive,
  cpu: Cpu,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  shield: Shield,
  check: Check,
  x: X,
  plus: Plus,
  minus: Minus,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
  'help-circle': HelpCircle,
  flag: Flag,
  bookmark: Bookmark,
  tag: Tag,
  hash: Hash,
  sun: Sun,
  moon: Moon,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  wind: Wind,
  umbrella: Umbrella,
  smile: Smile,
  frown: Frown,
  meh: Meh,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  gamepad: Gamepad,
  dumbbell: Dumbbell,
  truck: Truck,
  bus: Bus,
  car: Car,
  pizza: Pizza,
  utensils: Utensils,
  wine: Wine,
  beer: Beer,
  'ice-cream': IceCream,
  cookie: Cookie,
  shirt: Shirt,
  award: Award,
  medal: Medal,
  gem: Gem,
  sparkles: Sparkles,
  feather: Feather,
  'file-audio': FileAudio,
  'file-video': FileVideo,
  inbox: Inbox,
  'edit-2': Edit2,
}

interface BookmarkListProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkList({ bookmarks, onUpdate }: BookmarkListProps) {
  const { data: session } = useSession() || {}
  const [selectedCategory, setSelectedCategory] = useState<{id: string; name: string; color: string; backgroundColor?: string; icon?: string} | null>(null)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [folderColor, setFolderColor] = useState("#22c55e")
  const [backgroundColor, setBackgroundColor] = useState("#dcfce7")
  
  // Categories fetched independently (like compact view)
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryBookmarks, setCategoryBookmarks] = useState<any[]>([])
  const [categoryBookmarksLoading, setCategoryBookmarksLoading] = useState(false)
  const [globalCustomLogo, setGlobalCustomLogo] = useState<string | null>(null)
  
  // Subfolder state
  const [subfolders, setSubfolders] = useState<any[]>([])
  const [selectedSubfolder, setSelectedSubfolder] = useState<any>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [editingSubfolder, setEditingSubfolder] = useState<any>(null)
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // Fitness rings modal state
  const [showRingsModal, setShowRingsModal] = useState(false)
  const [showColorCustomizer, setShowColorCustomizer] = useState(false)
  const [selectedBookmarkForRings, setSelectedBookmarkForRings] = useState<any>(null)

  const FOLDER_COLORS = [
    "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
    "#EC4899", "#14B8A6", "#6B7280", "#F97316", "#06B6D4",
  ]

  // Ring colors for fitness rings
  const ringColors = DEFAULT_RING_COLORS

  // Create ring data for a bookmark
  const createRingsData = (bookmark: any): RingData[] => {
    return [
      {
        id: "visits",
        label: "Visits",
        value: bookmark.analytics?.[0]?.totalVisits || bookmark.visitCount || 0,
        target: 100,
        color: ringColors.visits,
      },
      {
        id: "tasks",
        label: "Tasks",
        value: bookmark.analytics?.[0]?.engagementScore || 0,
        target: 100,
        color: ringColors.tasks,
      },
      {
        id: "time",
        label: "Time",
        value: bookmark.analytics?.[0]?.avgTimeSpent || 0,
        target: 60,
        color: ringColors.time,
      },
    ]
  }

  // Fetch all categories and global logo on mount (like compact view)
  useEffect(() => {
    fetchCategories()
    fetchGlobalLogo()
  }, [])

  const fetchGlobalLogo = async () => {
    try {
      const response = await fetch('/api/user/custom-logo')
      if (response.ok) {
        const data = await response.json()
        if (data.customLogoUrl) {
          setGlobalCustomLogo(data.customLogoUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching global custom logo:', error)
    }
  }

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch("/api/categories", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        const categoriesArray = data?.categories || data
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Fetch bookmarks when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryBookmarks(selectedCategory.id)
      if (selectedCategory.id !== 'uncategorized' && selectedCategory.id !== 'all') {
        fetchSubfolders(selectedCategory.id)
      } else {
        setSubfolders([])
      }
    } else {
      setCategoryBookmarks([])
      setSubfolders([])
    }
    setSelectedSubfolder(null)
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }, [selectedCategory])

  const fetchCategoryBookmarks = async (categoryId: string) => {
    setCategoryBookmarksLoading(true)
    try {
      const url = categoryId === 'all' 
        ? '/api/bookmarks'
        : `/api/bookmarks?categoryId=${categoryId}`
      const response = await fetch(url, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setCategoryBookmarks(Array.isArray(data) ? data : data.bookmarks || [])
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setCategoryBookmarksLoading(false)
    }
  }

  const fetchSubfolders = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/bookmark-folders?categoryId=${categoryId}`)
      if (res.ok) {
        const data = await res.json()
        setSubfolders(data)
      }
    } catch (e) {
      setSubfolders([])
    }
  }

  const openCreateFolderDialog = () => {
    setNewFolderName("")
    setNewFolderColor("#3B82F6")
    setEditingSubfolder(null)
    setIsCreateFolderOpen(true)
  }

  const openEditFolderDialog = (folder: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setNewFolderName(folder.name)
    setNewFolderColor(folder.color || "#3B82F6")
    setEditingSubfolder(folder)
    setIsCreateFolderOpen(true)
  }

  const createOrUpdateFolder = async () => {
    if (!selectedCategory || !newFolderName.trim()) return
    setIsCreatingFolder(true)
    try {
      if (editingSubfolder) {
        const res = await fetch(`/api/bookmark-folders`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSubfolder.id, name: newFolderName.trim(), color: newFolderColor })
        })
        if (res.ok) {
          await fetchSubfolders(selectedCategory.id)
          toast.success("Folder updated")
          setIsCreateFolderOpen(false)
        } else {
          toast.error("Failed to update folder")
        }
      } else {
        const res = await fetch(`/api/bookmark-folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newFolderName.trim(), categoryId: selectedCategory.id, color: newFolderColor })
        })
        if (res.ok) {
          await fetchSubfolders(selectedCategory.id)
          toast.success("Folder created")
          setIsCreateFolderOpen(false)
        } else {
          toast.error("Failed to create folder")
        }
      }
    } catch (e) {
      toast.error("Failed to save folder")
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const deleteSubfolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this folder? Bookmarks inside will be moved out.")) return
    try {
      const res = await fetch(`/api/bookmark-folders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId })
      })
      if (res.ok) {
        await fetchSubfolders(selectedCategory!.id)
        onUpdate()
        toast.success("Folder deleted")
      } else {
        toast.error("Failed to delete folder")
      }
    } catch (e) {
      toast.error("Failed to delete folder")
    }
  }

  const toggleSelection = (bookmarkId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      return newSet
    })
  }

  const moveSelectedToFolder = async (folderId: string | null) => {
    if (selectedIds.size === 0) return
    const promises = Array.from(selectedIds).map(async (bookmarkId) => {
      try {
        const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId })
        })
        return res.ok
      } catch {
        return false
      }
    })
    const results = await Promise.all(promises)
    const successCount = results.filter(Boolean).length
    if (successCount > 0) {
      toast.success(`Moved ${successCount} bookmark${successCount > 1 ? 's' : ''}`)
      setSelectedIds(new Set())
      setIsSelectionMode(false)
      onUpdate()
    } else {
      toast.error("Failed to move bookmarks")
    }
  }

  // Save folder colors
  const handleSaveFolderColors = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          color: folderColor,
          backgroundColor: backgroundColor
        }),
      })

      if (!response.ok) throw new Error("Failed to update colors")

      toast.success("Folder colors updated!")
      setShowColorPicker(false)
      fetchCategories() // Refresh categories
      onUpdate()
    } catch (error) {
      toast.error("Failed to update colors")
    }
  }

  const handleToggleFavorite = async (bookmarkId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      })

      if (!response.ok) throw new Error("Failed to update bookmark")

      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
      onUpdate()
    } catch (error) {
      toast.error("Failed to update bookmark")
    }
  }

  // Get filtered bookmarks based on subfolder selection (must be before any returns)
  const displayedBookmarks = useMemo(() => {
    if (selectedSubfolder) {
      return categoryBookmarks.filter((b: any) => b.folderId === selectedSubfolder.id)
    }
    return categoryBookmarks
  }, [categoryBookmarks, selectedSubfolder])

  // Calculate total bookmarks count
  const totalBookmarksCount = bookmarks?.length || 0

  // Loading state for categories
  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Folder className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
        <p className="text-gray-500">Create your first category to organize bookmarks</p>
      </div>
    )
  }

  // Second level: Show individual bookmarks as full-width horizontal cards
  if (selectedCategory) {
    const handleBack = () => {
      if (selectedSubfolder) {
        setSelectedSubfolder(null)
      } else {
        setSelectedCategory(null)
      }
    }

    // Show loading when fetching bookmarks
    if (categoryBookmarksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Folders</span>
            </Button>
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6" style={{ color: selectedCategory.color }} />
              <h2 className="text-lg font-bold uppercase">{selectedCategory.name}</h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
              onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
              <span>{selectedSubfolder ? `Back to ${selectedCategory.name}` : 'Back to Folders'}</span>
          </Button>
          <div className="flex items-center gap-3">
            <Folder
              className="w-6 h-6"
                style={{ color: selectedSubfolder?.color || selectedCategory.color }}
                fill={selectedSubfolder?.color || selectedCategory.color}
              fillOpacity={0.15}
            />
              <h2 className="text-lg font-bold uppercase">{selectedSubfolder?.name || selectedCategory.name}</h2>
              <Badge variant="secondary">{displayedBookmarks.length} BOOKMARKS</Badge>
          </div>
          </div>
          {!selectedSubfolder && selectedCategory.id !== 'uncategorized' && (
            <Button onClick={openCreateFolderDialog} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Subfolder
            </Button>
          )}
        </div>

        {/* Subfolders section */}
        {!selectedSubfolder && subfolders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Subfolders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {subfolders.map((folder) => {
                const folderCount = categoryBookmarks.filter((b: any) => b.folderId === folder.id).length
                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedSubfolder(folder)}
                    className="bg-white border-2 border-gray-300 hover:border-black rounded-lg p-3 hover:shadow-md transition-all cursor-pointer relative group"
                  >
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={(e) => openEditFolderDialog(folder, e)} className="p-1 bg-white rounded shadow hover:bg-gray-100">
                        <Edit2 className="w-3 h-3 text-gray-600" />
                      </button>
                      <button onClick={(e) => deleteSubfolder(folder.id, e)} className="p-1 bg-white rounded shadow hover:bg-red-100">
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: folder.color || selectedCategory.color || '#60A5FA' }}
                      >
                        <Folder className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs uppercase truncate">{folder.name}</h4>
                        <p className="text-[10px] text-gray-500">{folderCount} bookmark{folderCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Selection controls */}
        {subfolders.length > 0 && !selectedSubfolder && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode)
                if (isSelectionMode) setSelectedIds(new Set())
              }}
            >
              {isSelectionMode ? "Cancel Selection" : "Select Bookmarks"}
            </Button>
            {isSelectionMode && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set(displayedBookmarks.map((b: any) => b.id)))}>
                  Select All
                </Button>
                {selectedIds.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      onChange={(e) => moveSelectedToFolder(e.target.value === "__none__" ? null : e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Move to folder...</option>
                      <option value="__none__">Remove from folder</option>
                      {subfolders.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Bookmarks as full-width horizontal cards */}
        <div className="space-y-4">
          {displayedBookmarks.map((bookmark: any) => {
            const isSelected = selectedIds.has(bookmark.id)
            return (
            <div
              key={bookmark.id}
              className={`relative bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30 border rounded-lg overflow-hidden hover:shadow-md transition-all group ${
                isSelected ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border border-black'
              }`}
            >
              {/* Selection checkbox */}
              {isSelectionMode && (
                <div 
                  className="absolute top-3 left-3 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelection(bookmark.id)
                  }}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400 hover:border-blue-400'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              )}
              {/* Full card faded watermark background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
                {(bookmark.favicon) ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={bookmark.favicon}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-[200px] font-bold text-gray-400">
                    {bookmark.title?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              {/* Three-dot menu */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setSelectedBookmark(bookmark)}>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Large visible logo - TOP RIGHT */}
              <div className="absolute top-4 right-16 z-10">
                <div className="relative w-32 h-32">
                  <FallbackImage
                    src={bookmark.favicon || ""}
                    alt={bookmark.title || "Bookmark"}
                    fallbackText={bookmark.title}
                    fill
                    className="object-contain"
                    fallbackClassName="w-full h-full text-6xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl text-gray-400"
                    unoptimized
                  />
                </div>
              </div>

              {/* Fitness Rings - BOTTOM RIGHT */}
              <div className="absolute bottom-4 right-4 z-30">
                <FitnessRings
                  rings={createRingsData(bookmark)}
                  size={56}
                  strokeWidth={5}
                  animated={false}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setSelectedBookmarkForRings(bookmark)
                    setShowRingsModal(true)
                  }}
                />
              </div>

              <div className="relative flex items-start gap-6 p-6 pr-44 cursor-pointer z-0" onClick={() => setSelectedBookmark(bookmark)}>
                {/* Left: Logo/Favicon */}
                <div className="flex-shrink-0">
                  <div className="relative w-14 h-14 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <FallbackImage
                      src={bookmark.favicon || ""}
                      alt={bookmark.title || "Bookmark"}
                      fallbackText={bookmark.title}
                      fill
                      className="object-contain p-2"
                      fallbackClassName="text-2xl text-white bg-black"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Middle: Content - WITH RIGHT PADDING TO PREVENT OVERLAP WITH LOGO */}
                <div className="flex-1 min-w-0 space-y-2.5 pr-4">
                  {/* Title and priority badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-gray-900 uppercase">
                      {bookmark.title || "Untitled"}
                    </h3>
                    {bookmark.priority && (
                      <Badge
                        variant="secondary"
                        className={`
                          text-xs px-2 py-0.5
                          ${bookmark.priority === "HIGH" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${bookmark.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${bookmark.priority === "LOW" ? "bg-gray-100 text-gray-600" : ""}
                        `}
                      >
                        {bookmark.priority?.toLowerCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Category label */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Folder className="w-3.5 h-3.5" />
                    <span className="uppercase">{bookmark.category?.name || "UNCATEGORIZED"}</span>
                  </div>

                  {/* URL */}
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={bookmark.url}
                    className="text-sm text-blue-600 hover:underline block truncate max-w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const cleanUrl = bookmark.url?.replace(/^https?:\/\/(www\.)?/, "") || '';
                      // Truncate to max 80 characters if too long (list view has more space)
                      return cleanUrl.length > 80 ? cleanUrl.substring(0, 77) + '...' : cleanUrl;
                    })()}
                  </a>

                  {/* Description - WILL WRAP TO NEXT LINE IF TOO LONG */}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed break-words">
                    {bookmark.description || "No description available"}
                  </p>

                  {/* Visit count */}
                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <Eye className="w-6 h-6" />
                    <span className="font-bold font-russo">{bookmark.analytics?.[0]?.totalVisits || 0} VISITS</span>
                    {bookmark.analytics?.[0]?.totalVisits > 0 && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Bookmark Detail Modal */}
        {selectedBookmark && (
          <BookmarkDetailModal
            bookmark={selectedBookmark}
            open={!!selectedBookmark}
            onOpenChange={(open) => !open && setSelectedBookmark(null)}
            onUpdate={onUpdate}
          />
        )}

        {/* Create/Edit Folder Dialog */}
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSubfolder ? 'Edit Subfolder' : 'Create New Subfolder'}</DialogTitle>
              <DialogDescription>
                {editingSubfolder ? 'Update the folder name and color' : 'Enter a name and choose a color for your new subfolder'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="mb-2 block">Folder Color</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newFolderColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="w-28 font-mono text-sm"
                  />
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: newFolderColor }}
                  >
                    <Folder className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Cancel</Button>
                <Button onClick={createOrUpdateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
                  {isCreatingFolder ? 'Saving...' : editingSubfolder ? 'Save Changes' : 'Create Folder'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fitness Rings Detail Modal */}
        {selectedBookmarkForRings && (
          <FitnessRingsModal
            open={showRingsModal}
            onOpenChange={(open) => {
              setShowRingsModal(open)
              if (!open) setSelectedBookmarkForRings(null)
            }}
            rings={createRingsData(selectedBookmarkForRings)}
            onCustomize={() => {
              setShowRingsModal(false)
              setShowColorCustomizer(true)
            }}
          />
        )}

        {/* Ring Color Customizer Modal */}
        {selectedBookmarkForRings && (
          <RingColorCustomizer
            open={showColorCustomizer}
            onOpenChange={(open) => {
              setShowColorCustomizer(open)
              if (!open) setSelectedBookmarkForRings(null)
            }}
            rings={createRingsData(selectedBookmarkForRings)}
            onSave={(colors) => {
              toast.success("Ring colors saved!")
              setShowColorCustomizer(false)
              setSelectedBookmarkForRings(null)
            }}
          />
        )}
      </div>
    )
  }

  // First level: Show category folders as full-width rows
  return (
    <div className="space-y-3">
      {/* ALL BOOKMARKS Row - Always first */}
      <div
        onClick={() => setSelectedCategory({ id: 'all', name: 'All Bookmarks', color: '#3B82F6', backgroundColor: '#DBEAFE' })}
        className="group relative bg-white border-2 border-black rounded-lg p-4 hover:shadow-md hover:border-gray-800 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded flex items-center justify-center bg-blue-100">
                <Folder className="w-12 h-12 text-blue-500" fill="none" strokeWidth={2.5} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-gray-900 mb-1 uppercase">ALL BOOKMARKS</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{totalBookmarksCount} BOOKMARK{totalBookmarksCount !== 1 ? 'S' : ''}</span>
              </div>
            </div>
          </div>
          {/* Right side: Global logo or default */}
          {globalCustomLogo ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-gray-300 flex-shrink-0 shadow-sm">
              <Image
                src={globalCustomLogo}
                alt="All Bookmarks"
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm bg-blue-500">
              <Folder className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Category folders */}
      {categories.map((category) => {
        const bookmarkCount = category._count?.bookmarks || 0
        return (
        <div
          key={category.id}
            onClick={() => setSelectedCategory({
              id: category.id,
              name: category.name,
              color: category.color || '#94A3B8',
              backgroundColor: category.backgroundColor || '#e2e8f0',
              icon: category.icon
            })}
            className="group relative bg-white border-2 border-black rounded-lg p-4 hover:shadow-md hover:border-gray-800 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Folder icon with background square + Category info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Folder Icon with Background Square */}
              <div className="flex-shrink-0">
                <div 
                  className="w-14 h-14 rounded flex items-center justify-center"
                  style={{ backgroundColor: category.backgroundColor || '#e2e8f0' }}
                >
                  <Folder
                    className="w-12 h-12"
                    style={{ color: category.color || '#94A3B8' }}
                    fill="none"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Category name and bookmark count */}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-gray-900 mb-1 uppercase">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                    <span>{bookmarkCount} BOOKMARK{bookmarkCount !== 1 ? 'S' : ''}</span>
                </div>
              </div>
            </div>

            {/* Right: Logo or icon in circle + Three-dot menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Category logo or global logo or icon */}
              {category.logo || globalCustomLogo ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-gray-300 flex-shrink-0 shadow-sm">
                  <Image
                    src={category.logo || globalCustomLogo || ''}
                    alt={category.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
              ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: category.color || '#94A3B8' }}
              >
                {(() => {
                  const IconComponent = iconMap[category.icon || 'folder'] || Folder
                  return (
                    <IconComponent className="w-6 h-6 text-white" />
                  )
                })()}
              </div>
              )}

              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                      setSelectedCategory({
                        id: category.id,
                        name: category.name,
                        color: category.color || '#94A3B8',
                        backgroundColor: category.backgroundColor || '#e2e8f0',
                        icon: category.icon
                      })
                  }}>
                    View Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(category)
                    setFolderColor(category.color || '#94A3B8')
                    setBackgroundColor(category.backgroundColor || '#e2e8f0')
                    setShowColorPicker(true)
                  }}>
                    <Palette className="w-4 h-4 mr-2" />
                    Change Colors
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit Category</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        )
      })}

      {/* Color Picker Modal */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Folder Colors</DialogTitle>
            <DialogDescription>
              Customize the folder outline and background colors
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Folder Outline Color */}
            <div className="space-y-2">
              <Label htmlFor="folderColor">Folder Outline Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="folderColor"
                  type="color"
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="flex-1"
                  placeholder="#22c55e"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                  placeholder="#dcfce7"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div 
                  className="w-20 h-20 rounded flex items-center justify-center"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <Folder
                    className="w-16 h-16"
                    style={{ color: folderColor }}
                    fill="none"
                    strokeWidth={2.5}
                  />
                </div>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm ml-4"
                  style={{ backgroundColor: folderColor }}
                >
                  {editingCategory && (() => {
                    const IconComponent = iconMap[editingCategory.icon || 'folder'] || Folder
                    return (
                      <IconComponent className="w-8 h-8 text-white" />
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowColorPicker(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFolderColors}>
              Save Colors
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
