
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsChart } from "@/components/analytics-chart"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkTimeline } from "@/components/bookmark-timeline"
import { BookmarkHierarchy } from "@/components/bookmark-hierarchy"
import BookmarkFolders from "@/components/bookmark-folders"
import { BookmarkKanban } from "@/components/bookmark-kanban"
import { BookmarkCompact } from "@/components/bookmark-compact"
import { BookmarkCompactFolders } from "@/components/bookmark-compact-folders"
import { BookmarkGoals } from "@/components/bookmark-goals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, Grid3x3, LayoutGrid, List, Clock, FolderTree, Folders, Trophy, Kanban, 
  ChevronLeft, ChevronRight, ChevronDown, LucideIcon, BarChart3, TrendingUp, Star, 
  Sparkles, ArrowUpRight, Layers, PieChart,
  // Category Icons
  Folder, Globe, Code, Palette, Music, Video, Image, FileText, ShoppingCart, 
  Briefcase, GraduationCap, Heart, Gamepad2, Plane, Utensils, Home, Car, 
  Dumbbell, Stethoscope, DollarSign, Newspaper, Bookmark, Users, MessageCircle,
  Mail, Phone, Calendar, Map, Camera, Headphones, Tv, Film, Book, Lightbulb,
  Rocket, Target, Award, Gift, Coffee, Pizza, Shirt, Scissors, Wrench, Hammer,
  Paintbrush, Pencil, Megaphone, Share2, Link, Database, Server, Cloud, Cpu,
  Smartphone, Laptop, Monitor, Wifi, Lock, Key, Shield, Eye, Bell, Settings,
  Zap, Flame, Sun, Moon, TreePine, Flower2, Bug, Bird, Cat, Dog, Fish,
  Activity, Atom, Calculator, Compass, CreditCard, Crown, Diamond, Fingerprint,
  Flag, Gauge, Gem, Github, Gitlab, Hash, HelpCircle, Instagram, Linkedin, Twitter,
  Youtube, Facebook, Twitch, Slack, Dribbble, Figma, Chrome, Firefox, Apple,
  Store, Building, Factory, Landmark, School, Hospital, Church, LibraryBig, Warehouse,
  Package, Truck, Ship, Train, Bus, Bike, CircleDot
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Bookmark, Category } from "@/types/bookmark"

export type ViewMode = "GRID" | "COMPACT" | "LIST" | "TIMELINE" | "HIERARCHY" | "FOLDER" | "GOAL" | "KANBAN"

const viewModes: { id: ViewMode; label: string; icon: LucideIcon }[] = [
  { id: "GRID", label: "GRID", icon: Grid3x3 },
  { id: "COMPACT", label: "COMPACT", icon: LayoutGrid },
  { id: "LIST", label: "LIST", icon: List },
  { id: "TIMELINE", label: "TIMELINE", icon: Clock },
  { id: "HIERARCHY", label: "HIERARCHY", icon: FolderTree },
  { id: "FOLDER", label: "FOLDERS", icon: Folders },
  { id: "GOAL", label: "GOALS", icon: Trophy },
  { id: "KANBAN", label: "KANBAN", icon: Kanban },
]

// Using Category from shared types - local extension for icon field
interface DashboardCategory extends Category {
  icon: string
}

// Map category names to appropriate icons
const getCategoryIcon = (categoryName: string): LucideIcon => {
  const name = categoryName.toLowerCase().trim()
  
  // Social Media & Communication
  if (name.includes('social') || name.includes('media')) return Share2
  if (name.includes('twitter') || name.includes('x.com')) return Twitter
  if (name.includes('facebook')) return Facebook
  if (name.includes('instagram')) return Instagram
  if (name.includes('linkedin')) return Linkedin
  if (name.includes('youtube')) return Youtube
  if (name.includes('twitch')) return Twitch
  if (name.includes('slack')) return Slack
  if (name.includes('discord')) return MessageCircle
  if (name.includes('reddit')) return MessageCircle
  if (name.includes('chat') || name.includes('message')) return MessageCircle
  if (name.includes('email') || name.includes('mail')) return Mail
  if (name.includes('phone') || name.includes('call')) return Phone
  
  // Technology & Development
  if (name.includes('code') || name.includes('programming') || name.includes('dev')) return Code
  if (name.includes('github')) return Github
  if (name.includes('gitlab')) return Gitlab
  if (name.includes('database') || name.includes('sql')) return Database
  if (name.includes('server') || name.includes('hosting')) return Server
  if (name.includes('cloud')) return Cloud
  if (name.includes('api')) return Cpu
  if (name.includes('ai') || name.includes('machine learning')) return Atom
  if (name.includes('tech') || name.includes('technology')) return Laptop
  if (name.includes('software') || name.includes('app')) return Smartphone
  if (name.includes('web') || name.includes('website')) return Globe
  if (name.includes('browser')) return Chrome
  if (name.includes('security') || name.includes('cyber')) return Shield
  
  // Design & Creative
  if (name.includes('design') || name.includes('ui') || name.includes('ux')) return Palette
  if (name.includes('figma')) return Figma
  if (name.includes('dribbble')) return Dribbble
  if (name.includes('art') || name.includes('creative')) return Paintbrush
  if (name.includes('photo') || name.includes('image')) return Image
  if (name.includes('video') || name.includes('film')) return Video
  if (name.includes('music') || name.includes('audio')) return Music
  if (name.includes('podcast')) return Headphones
  
  // Business & Finance
  if (name.includes('business') || name.includes('work')) return Briefcase
  if (name.includes('finance') || name.includes('money') || name.includes('bank')) return DollarSign
  if (name.includes('invest') || name.includes('stock')) return TrendingUp
  if (name.includes('shop') || name.includes('ecommerce') || name.includes('store')) return ShoppingCart
  if (name.includes('marketing') || name.includes('ads')) return Megaphone
  if (name.includes('startup')) return Rocket
  if (name.includes('career') || name.includes('job')) return Briefcase
  
  // Education & Learning
  if (name.includes('education') || name.includes('school') || name.includes('learn')) return GraduationCap
  if (name.includes('course') || name.includes('tutorial')) return Book
  if (name.includes('research') || name.includes('science')) return Atom
  if (name.includes('math') || name.includes('calculator')) return Calculator
  if (name.includes('library')) return LibraryBig
  
  // Entertainment & Media
  if (name.includes('entertainment') || name.includes('fun')) return Gamepad2
  if (name.includes('game') || name.includes('gaming')) return Gamepad2
  if (name.includes('movie') || name.includes('cinema')) return Film
  if (name.includes('tv') || name.includes('stream')) return Tv
  if (name.includes('news') || name.includes('article')) return Newspaper
  if (name.includes('blog') || name.includes('read')) return FileText
  if (name.includes('book')) return Book
  
  // Lifestyle & Personal
  if (name.includes('health') || name.includes('medical') || name.includes('fitness')) return Stethoscope
  if (name.includes('gym') || name.includes('workout') || name.includes('exercise')) return Dumbbell
  if (name.includes('food') || name.includes('recipe') || name.includes('cook')) return Utensils
  if (name.includes('restaurant') || name.includes('dining')) return Pizza
  if (name.includes('coffee')) return Coffee
  if (name.includes('fashion') || name.includes('cloth')) return Shirt
  if (name.includes('beauty') || name.includes('cosmetic')) return Scissors
  if (name.includes('home') || name.includes('house') || name.includes('interior')) return Home
  if (name.includes('garden') || name.includes('plant')) return TreePine
  if (name.includes('pet') || name.includes('animal')) return Dog
  
  // Travel & Places
  if (name.includes('travel') || name.includes('trip') || name.includes('vacation')) return Plane
  if (name.includes('hotel') || name.includes('stay')) return Building
  if (name.includes('map') || name.includes('location') || name.includes('place')) return Map
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car
  if (name.includes('transport') || name.includes('transit')) return Train
  
  // Tools & Utilities
  if (name.includes('tool') || name.includes('utility')) return Wrench
  if (name.includes('productivity')) return Target
  if (name.includes('calendar') || name.includes('schedule')) return Calendar
  if (name.includes('note') || name.includes('todo')) return FileText
  if (name.includes('storage') || name.includes('backup')) return Database
  if (name.includes('download')) return Package
  
  // Sports & Hobbies
  if (name.includes('sport')) return Trophy
  if (name.includes('hobby') || name.includes('craft')) return Paintbrush
  if (name.includes('music')) return Music
  if (name.includes('photo')) return Camera
  
  // Misc categories
  if (name.includes('favorite') || name.includes('important')) return Star
  if (name.includes('archive') || name.includes('saved')) return Bookmark
  if (name.includes('misc') || name.includes('other')) return Folder
  if (name.includes('uncategorized') || name.includes('general')) return CircleDot
  if (name.includes('reference')) return Link
  if (name.includes('resource')) return Package
  if (name.includes('inspiration') || name.includes('idea')) return Lightbulb
  
  // Default icon
  return Folder
}

export function DashboardContent() {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>("GRID")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  // Using any[] for bookmarks since components define their own interfaces
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [userProfileName, setUserProfileName] = useState<string | null>(null)
  // Analytics type matches AnalyticsChart's expected input
  const [analytics, setAnalytics] = useState<{
    analytics: Array<{
      date: string
      totalVisits: number
      engagementScore: number
      timeSpent: number
    }>
    totals: {
      totalVisits: number
      engagementScore: number
      timeSpent: number
      bookmarksAdded: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<DashboardCategory[]>([])
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    // Debounce search input for smoother filtering
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    // In dev mode, always fetch bookmarks regardless of session
    // The API routes handle auth via getDevSession()
    fetchBookmarks()
    fetchAnalytics()
    fetchProfile()
  }, [session, debouncedSearchQuery, categoryFilter])

  useEffect(() => {
    if (breakdownOpen && categories.length === 0) {
      fetchCategories()
    }
  }, [breakdownOpen])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const fetchBookmarks = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)
      if (categoryFilter) params.append('category', categoryFilter)
      
      const response = await fetch(`/api/bookmarks${params.toString() ? `?${params.toString()}` : ""}`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      } else if (response.status === 401) {
        // Session expired or user not logged in
        toast.error("Session expired. Please log in again.")
        // Redirect to sign-in page after a brief delay
        setTimeout(() => {
          window.location.href = "/auth/signin"
        }, 1500)
      } else {
        toast.error("Failed to load bookmarks")
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      toast.error("Failed to load bookmarks")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics?range=30")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        const first = data.firstName || data.name || ''
        setUserProfileName(first || null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleBookmarkCreated = () => {
    fetchBookmarks()
    fetchAnalytics()
  }

  const handleBulkSelectToggle = () => {
    setBulkSelectMode(!bulkSelectMode)
    setSelectedBookmarks(new Set())
  }

  const handleSelectBookmark = (bookmarkId: string) => {
    setSelectedBookmarks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedBookmarks.size === bookmarks.length) {
      setSelectedBookmarks(new Set())
    } else {
      setSelectedBookmarks(new Set(bookmarks.map((b: any) => b.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBookmarks.size} bookmarks?`)) return
    
    // Save scroll position before delete
    const scrollPosition = window.scrollY
    
    try {
      const deletePromises = Array.from(selectedBookmarks).map(id =>
        fetch(`/api/bookmarks/${id}`, { method: "DELETE" })
      )
      
      await Promise.all(deletePromises)
      toast.success(`${selectedBookmarks.size} bookmarks deleted successfully`)
      setSelectedBookmarks(new Set())
      // Don't exit bulk select mode so user can continue deleting
      // setBulkSelectMode(false)
      
      // Fetch bookmarks and restore scroll position
      await fetchBookmarks()
      
      // Restore scroll position after a brief delay to allow DOM to update
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' })
      })
    } catch (error) {
      console.error("Error deleting bookmarks:", error)
      toast.error("Failed to delete bookmarks")
    }
  }

  const handleMoveSelected = async (categoryId: string) => {
    try {
      const updatePromises = Array.from(selectedBookmarks).map(id =>
        fetch(`/api/bookmarks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId }),
        })
      )
      
      await Promise.all(updatePromises)
      toast.success(`${selectedBookmarks.size} bookmarks moved successfully`)
      setSelectedBookmarks(new Set())
      fetchBookmarks()
    } catch (error) {
      console.error("Error moving bookmarks:", error)
      toast.error("Failed to move bookmarks")
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil((bookmarks?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookmarks = bookmarks?.slice(startIndex, endIndex) || []

  const renderBookmarkView = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )
    }

    switch (viewMode) {
      case "GRID":
        return <BookmarkGrid 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
          bulkSelectMode={bulkSelectMode}
          selectedBookmarks={selectedBookmarks}
          onSelectBookmark={handleSelectBookmark}
        />
      case "COMPACT":
        return <BookmarkCompactFolders 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
        />
      case "LIST":
        return <BookmarkList bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "TIMELINE":
        // Timeline has its own filtering/search, so give it ALL bookmarks
        return <BookmarkTimeline bookmarks={bookmarks || []} onUpdate={fetchBookmarks} />
      case "HIERARCHY":
        // Use full set so hierarchy has all categories/folders
        return <BookmarkHierarchy bookmarks={bookmarks || []} onUpdate={fetchBookmarks} />
      case "FOLDER":
        // Use full bookmarks set so all categories show
        return <BookmarkFolders bookmarks={bookmarks || []} onUpdate={fetchBookmarks} />
      case "GOAL":
        return <BookmarkGoals bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      case "KANBAN":
        return <BookmarkKanban bookmarks={currentBookmarks} onUpdate={fetchBookmarks} />
      default:
        return <BookmarkGrid 
          bookmarks={currentBookmarks} 
          onUpdate={fetchBookmarks}
          bulkSelectMode={bulkSelectMode}
          selectedBookmarks={selectedBookmarks}
          onSelectBookmark={handleSelectBookmark}
        />
    }
  }

  return (
    <div className="space-y-6">
      {/* Sticky Bulk Action Bar */}
      {bulkSelectMode && selectedBookmarks.size > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-50 border-b border-blue-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9 px-4 bg-white hover:bg-gray-50"
              >
                {selectedBookmarks.size === bookmarks.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm font-medium text-blue-900">
                ✓ {selectedBookmarks.size} of {bookmarks.length} bookmarks selected
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Select onValueChange={handleMoveSelected}>
                <SelectTrigger className="w-[150px] h-9 text-sm bg-white">
                  <SelectValue placeholder="📁 Move to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                🗑️ DELETE SELECTED
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-9 px-4 bg-white hover:bg-gray-50"
              >
                Select All ({bookmarks.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-2 md:mb-1">Total bookmarks</div>
            <div className="text-5xl font-bold text-gray-900">{bookmarks?.length || 0}</div>
          </div>
          
          {/* Breakdown Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setBreakdownOpen(!breakdownOpen)}
            className={cn(
              "h-10 gap-2 text-sm font-semibold uppercase tracking-wide transition-all border-2",
              breakdownOpen 
                ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800" 
                : "bg-white text-gray-900 border-gray-300 hover:border-gray-900 hover:bg-gray-50"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>BREAKDOWN</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", breakdownOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Premium Breakdown Panel */}
        {breakdownOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            {/* Header with Stats */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">CATEGORY BREAKDOWN</h3>
                    <p className="text-xs text-gray-500">Distribution of your bookmarks</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                    <div className="text-xs text-gray-500 uppercase">Categories</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{bookmarks?.length || 0}</div>
                    <div className="text-xs text-gray-500 uppercase">Total Links</div>
                  </div>
                </div>
              </div>
            </div>

            {!Array.isArray(categories) || categories.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No categories found</p>
                <p className="text-xs text-gray-400 mt-1">Create categories to organize your bookmarks</p>
              </div>
            ) : (
              <>
                {/* Top Categories Quick Stats */}
                <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">TOP PERFORMERS</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {[...categories]
                      .sort((a, b) => (b._count?.bookmarks ?? 0) - (a._count?.bookmarks ?? 0))
                      .slice(0, 5)
                      .map((category, index) => {
                        const count = category._count?.bookmarks ?? 0
                        const percentage = bookmarks?.length ? Math.round((count / bookmarks.length) * 100) : 0
                        const CategoryIcon = getCategoryIcon(category.name)
                        return (
                          <div
                            key={category.id}
                            onClick={() => {
                              setCategoryFilter(category.id)
                              setBreakdownOpen(false)
                            }}
                            className="flex-shrink-0 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && <Star className="h-3 w-3 text-amber-500" />}
                              <CategoryIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                {category.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">{count}</span>
                              <span className="text-xs text-gray-400">({percentage}%)</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Category Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...categories]
                      .sort((a, b) => (b._count?.bookmarks ?? 0) - (a._count?.bookmarks ?? 0))
                      .map((category) => {
                        const count = category._count?.bookmarks ?? 0
                        const maxCount = Math.max(...categories.map(c => c._count?.bookmarks ?? 0))
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                        const globalPercentage = bookmarks?.length ? Math.round((count / bookmarks.length) * 100) : 0
                        const CategoryIcon = getCategoryIcon(category.name)

                        return (
                          <div
                            key={category.id}
                            onClick={() => {
                              setCategoryFilter(category.id)
                              setBreakdownOpen(false)
                            }}
                            className="group relative p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                          >
                            {/* Background Progress Bar - with category color */}
                            <div 
                              className="absolute inset-y-0 left-0 transition-all group-hover:opacity-20"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: category.color || '#6366f1',
                                opacity: 0.12,
                              }}
                            />
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                  <CategoryIcon className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate transition-colors">
                                  {category.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-gray-900">{count}</div>
                                  <div className="text-[10px] text-gray-400 uppercase">{globalPercentage}%</div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Footer with Quick Actions */}
                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="h-3 w-3" />
                      <span>Click any category to filter bookmarks</span>
                    </div>
                    {categoryFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryFilter(null)}
                        className="h-7 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      >
                        Clear filter
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <DashboardHeader
        onBookmarkCreated={handleBookmarkCreated}
        bulkSelectMode={bulkSelectMode}
        onBulkSelectToggle={handleBulkSelectToggle}
        selectedCount={selectedBookmarks.size}
        onCategoryFilter={setCategoryFilter}
      />

      {/* Analytics Chart */}
      {analytics && (
        <AnalyticsChart analytics={analytics} userName={userProfileName || session?.user?.name || 'Your'} />
      )}

      {/* View Mode Toggles */}
      <div className="flex justify-center -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex items-center gap-2 md:gap-2.5 bg-gray-900 rounded-xl p-2.5 md:p-2 w-fit max-w-full overflow-x-auto scrollbar-hide">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <Button
                key={mode.id}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "px-3 sm:px-4 py-3 h-11 sm:h-12 text-xs sm:text-sm font-medium rounded-lg transition-colors gap-2 sm:gap-2.5 whitespace-nowrap flex-shrink-0",
                  viewMode === mode.id
                    ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                    : "text-white hover:text-white hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400 text-base"
          />
        </div>
      </div>

      {/* Pagination Controls - Show for GRID, COMPACT, and LIST views */}
      {(viewMode === "GRID" || viewMode === "COMPACT" || viewMode === "LIST") && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Per page</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[90px] h-10 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm text-black">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 text-black bg-white hover:bg-gray-50 px-3 sm:px-4"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 text-black bg-white hover:bg-gray-50 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {renderBookmarkView()}

      {/* Bottom Pagination Controls - Show for GRID, COMPACT, and LIST views */}
      {(viewMode === "GRID" || viewMode === "COMPACT" || viewMode === "LIST") && !loading && bookmarks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200 mt-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-black font-medium">Items per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[90px] h-10 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm text-black">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 text-black bg-white hover:bg-gray-50 px-3 sm:px-4"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 text-black bg-white hover:bg-gray-50 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
