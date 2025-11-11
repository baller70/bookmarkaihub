"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
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
import { toast } from "sonner"

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
  const [selectedCategory, setSelectedCategory] = useState<{id: string; name: string; color: string; backgroundColor?: string} | null>(null)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [folderColor, setFolderColor] = useState("#22c55e")
  const [backgroundColor, setBackgroundColor] = useState("#dcfce7")
  
  // Group bookmarks by category
  const categorizedBookmarks = useMemo(() => {
    const grouped: { category: any; bookmarks: any[] }[] = []
    const indexMap: Record<string, number> = {}

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || "uncategorized"
      const categoryName = bookmark.category?.name || "UNCATEGORIZED"
      const categoryColor = bookmark.category?.color || "#94A3B8"
      const categoryBgColor = bookmark.category?.backgroundColor || "#e2e8f0"
      const categoryIcon = bookmark.category?.icon || "folder"

      if (!(categoryId in indexMap)) {
        indexMap[categoryId] = grouped.length
        grouped.push({
          category: {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            backgroundColor: categoryBgColor,
            icon: categoryIcon,
          },
          bookmarks: [],
        })
      }
      const index = indexMap[categoryId]
      grouped[index].bookmarks.push(bookmark)
    })

    return grouped
  }, [bookmarks])

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
      onUpdate()
    } catch (error) {
      toast.error("Failed to update colors")
    }
  }

  // Get bookmarks for selected category
  const currentCategoryBookmarks = useMemo(() => {
    if (!selectedCategory) return []
    const found = categorizedBookmarks.find(c => c.category.id === selectedCategory.id)
    return found?.bookmarks || []
  }, [selectedCategory, categorizedBookmarks])

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

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  // Second level: Show individual bookmarks as full-width horizontal cards
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Folders</span>
          </Button>
          <div className="flex items-center gap-3">
            <Folder
              className="w-6 h-6"
              style={{ color: selectedCategory.color }}
              fill={selectedCategory.color}
              fillOpacity={0.15}
            />
            <h2 className="text-lg font-bold uppercase">{selectedCategory.name}</h2>
            <Badge variant="secondary">{currentCategoryBookmarks.length} BOOKMARKS</Badge>
          </div>
        </div>

        {/* Bookmarks as full-width horizontal cards */}
        <div className="space-y-4">
          {currentCategoryBookmarks.map((bookmark: any) => (
            <div
              key={bookmark.id}
              className="relative bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-blue-50/30 border border-black rounded-lg overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Full card faded watermark background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
                {bookmark.favicon ? (
                  <div className="relative w-64 h-64">
                    <Image
                      src={bookmark.favicon}
                      alt=""
                      fill
                      className="object-contain"
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
                  {bookmark.favicon ? (
                    <Image
                      src={bookmark.favicon}
                      alt={bookmark.title || "Bookmark"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <span className="text-6xl font-bold text-gray-400">
                        {bookmark.title?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Circular percentage indicator - BOTTOM RIGHT */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="w-16 h-16 bg-red-50 border-2 border-red-400 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-red-600">
                    {bookmark.analytics?.[0]?.engagementScore || 0}%
                  </span>
                </div>
              </div>

              <div className="relative flex items-start gap-6 p-6 cursor-pointer z-0" onClick={() => setSelectedBookmark(bookmark)}>
                {/* Left: Logo/Favicon */}
                <div className="flex-shrink-0">
                  <div className="relative w-14 h-14 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    {bookmark.favicon ? (
                      <Image
                        src={bookmark.favicon}
                        alt={bookmark.title || "Bookmark"}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {bookmark.title?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0 space-y-2.5">
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
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {bookmark.url?.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {bookmark.description || "No description available"}
                  </p>

                  {/* Visit count */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{bookmark.analytics?.[0]?.totalVisits || 0} VISITS</span>
                    {bookmark.analytics?.[0]?.totalVisits > 0 && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drag handle at bottom center */}
              <div className="flex justify-center py-1 border-t border-gray-100 bg-white/50">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
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
      </div>
    )
  }

  // First level: Show category folders as full-width rows
  return (
    <div className="space-y-3">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
          onClick={() => setSelectedCategory(category)}
          className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
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
                  <span>{categoryBookmarks.length} BOOKMARK{categoryBookmarks.length !== 1 ? 'S' : ''}</span>
                </div>
              </div>
            </div>

            {/* Right: Category icon in circle + Three-dot menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Category icon in circle - color matches folder outline */}
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
                    setSelectedCategory(category)
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
      ))}

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
