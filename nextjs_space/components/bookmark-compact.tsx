"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import {
  Folder, MoreVertical, User, ArrowLeft, ExternalLink, Star, Eye, Palette,
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
  FileAudio, FileVideo, Inbox, Edit2
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkDetailModal } from "@/components/bookmark-detail-modal"
import { IconPickerModal } from "@/components/icon-picker-modal"
import { toast } from "sonner"

interface BookmarkCompactProps {
  bookmarks: any[]
  onUpdate: () => void
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
  image: Camera,
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
  eye: Eye,
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
  palette: Palette,
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
  const { data: session } = useSession() || {}
  const [selectedCategory, setSelectedCategory] = useState<{id: string; name: string; color: string} | null>(null)
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [folderColor, setFolderColor] = useState('#22c55e')
  const [backgroundColor, setBackgroundColor] = useState('#dcfce7')
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  
  // Save category colors
  const handleSaveColors = async () => {
    if (!editingCategory) return
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: folderColor,
          backgroundColor: backgroundColor,
        }),
      })

      if (!response.ok) throw new Error('Failed to update colors')

      toast.success('Colors updated successfully!')
      setShowColorPicker(false)
      setEditingCategory(null)
      onUpdate() // Refresh the bookmarks to show new colors
    } catch (error) {
      console.error('Error updating colors:', error)
      toast.error('Failed to update colors')
    }
  }

  // Save category name
  const handleSaveCategoryName = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast.error('Category name cannot be empty')
      return
    }
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to update category name')

      toast.success('Category name updated successfully!')
      setShowEditCategory(false)
      setEditingCategory(null)
      setNewCategoryName('')
      onUpdate() // Refresh the bookmarks to show new name
    } catch (error) {
      console.error('Error updating category name:', error)
      toast.error('Failed to update category name')
    }
  }
  
  // Group bookmarks by category
  const categorizedBookmarks = useMemo(() => {
    const grouped: { category: any; bookmarks: any[] }[] = []
    const indexMap: Record<string, number> = {}

    bookmarks?.forEach((bookmark) => {
      const categoryId = bookmark.category?.id || "uncategorized"
      const categoryName = bookmark.category?.name || "UNCATEGORIZED"
      const categoryColor = bookmark.category?.color || "#94A3B8"
      const categoryBgColor = bookmark.category?.backgroundColor || "#DBEAFE"
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

    setCategories(grouped.map((item: { category: any; bookmarks: any[] }) => item.category))
    return grouped
  }, [bookmarks])

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

  // Drag and drop handlers for folders
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null)
      return
    }

    // Reorder categories in state
    const sourceIndex = categories.findIndex(c => c.id === draggedCategoryId)
    const targetIndex = categories.findIndex(c => c.id === targetCategoryId)
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newCategories = [...categories]
      const [removed] = newCategories.splice(sourceIndex, 1)
      newCategories.splice(targetIndex, 0, removed)
      setCategories(newCategories)
      toast.success("Folder reordered")
    }
    
    setDraggedCategoryId(null)
  }

  const handleDragEnd = () => {
    setDraggedCategoryId(null)
  }

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
        <p className="text-gray-500">Create your first bookmark to get started</p>
      </div>
    )
  }

  // Second level: Show individual bookmarks as square cards
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

        {/* Bookmarks as COMPACT square cards - SAME SIZE AS FOLDER CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {currentCategoryBookmarks.map((bookmark: any) => {
            const usagePercentage = bookmark.usagePercentage || 0
            const visitCount = bookmark.analytics?.[0]?.totalVisits || 0
            const cleanUrl = bookmark.url?.replace(/^https?:\/\/(www\.)?/, "") || ""
            
            return (
              <div
                key={bookmark.id}
                className="relative bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedBookmark(bookmark)}
              >
                {/* COMPACT Square card content */}
                <div className="aspect-square flex flex-col p-2.5 relative">
                  
                  {/* Background watermark pattern (faded logo) */}
                  {bookmark.favicon && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
                      <div className="relative w-full h-full">
                        <Image
                          src={bookmark.favicon}
                          alt=""
                          fill
                          className="object-contain scale-150"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  {/* TOP LEFT - COMPACT Black square logo container */}
                  <div className="relative z-10 mb-1.5">
                    <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center overflow-hidden">
                      {bookmark.favicon ? (
                        <Image
                          src={bookmark.favicon}
                          alt={bookmark.title || "Bookmark"}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {bookmark.title?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TOP RIGHT - COMPACT Red hexagonal percentage badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div 
                      className="relative flex items-center justify-center"
                      style={{
                        width: '28px',
                        height: '32px',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        backgroundColor: '#FEE2E2'
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          clipPath: 'polygon(50% 3%, 97% 27%, 97% 73%, 50% 97%, 3% 73%, 3% 27%)',
                          backgroundColor: '#FFFFFF'
                        }}
                      ></div>
                      <span className="relative text-[9px] font-black text-red-600 z-10">
                        {Math.round(usagePercentage)}%
                      </span>
                    </div>
                  </div>

                  {/* TITLE - COMPACT Bold uppercase, 2 lines max */}
                  <div className="relative z-10 mb-0.5">
                    <h3 className="font-black text-[11px] text-gray-900 uppercase tracking-tight leading-tight line-clamp-2">
                      {bookmark.title || "Untitled"}
                    </h3>
                  </div>

                  {/* URL - COMPACT Blue link text */}
                  <div className="relative z-10 mb-1">
                    <p className="text-[9px] text-blue-600 truncate">
                      {cleanUrl}
                    </p>
                  </div>

                  {/* Priority Tag - COMPACT Yellow pill badge */}
                  {bookmark.priority && (
                    <div className="relative z-10 mb-1.5">
                      <span className="inline-block bg-yellow-100 text-gray-800 text-[9px] px-1.5 py-0.5 rounded font-medium lowercase">
                        {bookmark.priority.toLowerCase()}
                      </span>
                    </div>
                  )}

                  {/* Spacer to push bottom section down */}
                  <div className="flex-1"></div>

                  {/* BOTTOM SECTION - COMPACT Fixed at bottom */}
                  <div className="relative z-10 flex items-center justify-between mt-auto">
                    {/* BOTTOM LEFT - COMPACT Visit count with green dot */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5 text-gray-500" />
                        <span className="text-[8px] font-semibold text-gray-600 uppercase tracking-wide">
                          {visitCount} VISITS
                        </span>
                      </div>
                      {visitCount > 0 && (
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                      )}
                    </div>

                    {/* BOTTOM RIGHT - COMPACT circular decorative badge */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center shadow-sm">
                      {bookmark.favicon ? (
                        <Image
                          src={bookmark.favicon}
                          alt=""
                          width={16}
                          height={16}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs font-black text-white">
                          {bookmark.title?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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

  // First level: Show category folders EXACTLY like the screenshot
  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {categorizedBookmarks.map(({ category, bookmarks: categoryBookmarks }) => (
        <div
          key={category.id}
          draggable
          onDragStart={(e) => handleDragStart(e, category.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, category.id)}
          onDragEnd={handleDragEnd}
          onClick={() => setSelectedCategory(category)}
          className={`group relative bg-white border-2 rounded-xl hover:shadow-lg transition-all cursor-move overflow-hidden ${
            draggedCategoryId === category.id ? 'opacity-50 border-blue-500' : 'border-black'
          }`}
        >
          {/* EXACT SQUARE ASPECT RATIO */}
          <div className="aspect-square relative p-4 flex flex-col">
            
            {/* Three-dot menu in TOP RIGHT */}
            <div className="absolute top-3 right-3 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
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
                    setFolderColor(category.color || '#22c55e')
                    setBackgroundColor(category.backgroundColor || '#dcfce7')
                    setShowColorPicker(true)
                  }}>
                    <Palette className="w-4 h-4 mr-2" />
                    Change Colors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(category)
                    setShowIconPicker(true)
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Icon
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(category)
                    setNewCategoryName(category.name)
                    setShowEditCategory(true)
                  }}>Edit Category</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* FOLDER OUTLINE in TOP LEFT WITH BACKGROUND */}
            <div 
              className="absolute top-4 left-4 w-16 h-16 rounded flex items-center justify-center"
              style={{ backgroundColor: category.backgroundColor || '#dcfce7' }}
            >
              <Folder
                className="w-14 h-14"
                style={{ color: category.color || '#22c55e' }}
                fill="none"
                strokeWidth={2.5}
              />
            </div>

            {/* Category title - LEFT ALIGNED WITH SPACING */}
            <div className="flex-1 flex items-center mt-6">
              <h3 className="text-left font-black text-base text-gray-900 uppercase tracking-tight leading-tight px-2">
                {category.name}
              </h3>
            </div>

            {/* Footer section at BOTTOM */}
            <div className="flex items-center justify-between">
              {/* Bookmark count - BOTTOM LEFT */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{categoryBookmarks.length} BOOKMARKS</span>
              </div>

              {/* Custom Category Icon - BOTTOM RIGHT */}
              <div className="w-14 h-14 bg-gray-500 rounded-full flex items-center justify-center shadow-sm">
                {(() => {
                  const IconComponent = iconMap[category.icon || 'folder'] || Folder
                  return (
                    <IconComponent className="w-9 h-9 text-white" />
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Color Picker Modal */}
    <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Folder Colors</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Folder Outline Color */}
          <div className="space-y-2">
            <Label htmlFor="folderColor">Folder Outline Color</Label>
            <div className="flex items-center gap-3">
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
                placeholder="#22c55e"
                className="flex-1"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex items-center gap-3">
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
                placeholder="#dcfce7"
                className="flex-1"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <div 
                className="w-12 h-12 rounded flex items-center justify-center mx-auto"
                style={{ backgroundColor }}
              >
                <Folder
                  className="w-10 h-10"
                  style={{ color: folderColor }}
                  fill="none"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowColorPicker(false)
              setEditingCategory(null)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveColors}>
            Save Colors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Icon Picker Modal */}
    {editingCategory && (
      <IconPickerModal
        isOpen={showIconPicker}
        onClose={() => {
          setShowIconPicker(false)
          setEditingCategory(null)
        }}
        categoryId={editingCategory.id}
        currentIcon={editingCategory.icon || 'folder'}
        onIconSelected={(newIcon) => {
          // Update the category in the local state
          const updatedCategories = categories.map(cat =>
            cat.id === editingCategory.id ? { ...cat, icon: newIcon } : cat
          )
          setCategories(updatedCategories)
          onUpdate()
        }}
      />
    )}

    {/* Edit Category Name Modal */}
    <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditCategory(false)
              setEditingCategory(null)
              setNewCategoryName('')
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveCategoryName}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
