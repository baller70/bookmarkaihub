
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Folder, Briefcase, Code, Palette, Music, Camera, Book, Heart,
  Rocket, Star, Trophy, Target, Zap, Crown, Gift, Coffee,
  Home, Settings, User, Users, Bell, Mail, MessageSquare, Phone,
  Calendar, Clock, TrendingUp, BarChart, PieChart, Activity,
  ShoppingBag, ShoppingCart, CreditCard, DollarSign, Percent,
  Globe, MapPin, Navigation, Compass, Map, Plane,
  Film, Tv, Headphones, Radio, Mic, Volume2,
  Package, Box, Archive, Inbox, Send, Download,
  Edit, FileText, Clipboard, Folder as FolderAlt, File, FileCheck,
  Image, Video, Music as MusicNote, FileAudio, FileVideo,
  Monitor, Smartphone, Tablet, Laptop, Watch, Bluetooth,
  Wifi, Cloud, Database, Server, HardDrive, Cpu,
  Lock, Unlock, Key, Shield, Eye, EyeOff,
  Check, X, Plus, Minus, AlertCircle, AlertTriangle,
  Info, HelpCircle, Flag, Bookmark, Tag, Hash,
  Sun, Moon, CloudRain, CloudSnow, Wind, Umbrella,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown, Heart as HeartIcon,
  Gamepad, Dumbbell, Truck, Bus, Car,
  Pizza, Utensils, Wine, Beer, IceCream, Cookie,
  Shirt, Award, Medal, Gem, Sparkles, Feather
} from 'lucide-react'
import { Search } from 'lucide-react'

// Icon library organized by category
const iconLibrary = [
  {
    category: 'WORK & PRODUCTIVITY',
    icons: [
      { name: 'briefcase', Icon: Briefcase },
      { name: 'folder', Icon: Folder },
      { name: 'file-text', Icon: FileText },
      { name: 'clipboard', Icon: Clipboard },
      { name: 'edit', Icon: Edit },
      { name: 'calendar', Icon: Calendar },
      { name: 'clock', Icon: Clock },
      { name: 'target', Icon: Target },
      { name: 'trending-up', Icon: TrendingUp },
      { name: 'bar-chart', Icon: BarChart },
      { name: 'pie-chart', Icon: PieChart },
      { name: 'activity', Icon: Activity },
    ]
  },
  {
    category: 'TECHNOLOGY',
    icons: [
      { name: 'code', Icon: Code },
      { name: 'monitor', Icon: Monitor },
      { name: 'smartphone', Icon: Smartphone },
      { name: 'laptop', Icon: Laptop },
      { name: 'tablet', Icon: Tablet },
      { name: 'database', Icon: Database },
      { name: 'server', Icon: Server },
      { name: 'cpu', Icon: Cpu },
      { name: 'wifi', Icon: Wifi },
      { name: 'cloud', Icon: Cloud },
      { name: 'bluetooth', Icon: Bluetooth },
      { name: 'hard-drive', Icon: HardDrive },
    ]
  },
  {
    category: 'CREATIVE',
    icons: [
      { name: 'palette', Icon: Palette },
      { name: 'camera', Icon: Camera },
      { name: 'image', Icon: Image },
      { name: 'film', Icon: Film },
      { name: 'video', Icon: Video },
      { name: 'music', Icon: Music },
      { name: 'headphones', Icon: Headphones },
      { name: 'mic', Icon: Mic },
      { name: 'sparkles', Icon: Sparkles },
      { name: 'feather', Icon: Feather },
      { name: 'gem', Icon: Gem },
      { name: 'award', Icon: Award },
    ]
  },
  {
    category: 'SHOPPING & FINANCE',
    icons: [
      { name: 'shopping-bag', Icon: ShoppingBag },
      { name: 'shopping-cart', Icon: ShoppingCart },
      { name: 'credit-card', Icon: CreditCard },
      { name: 'dollar-sign', Icon: DollarSign },
      { name: 'percent', Icon: Percent },
      { name: 'package', Icon: Package },
      { name: 'box', Icon: Box },
      { name: 'gift', Icon: Gift },
    ]
  },
  {
    category: 'COMMUNICATION',
    icons: [
      { name: 'mail', Icon: Mail },
      { name: 'message-square', Icon: MessageSquare },
      { name: 'phone', Icon: Phone },
      { name: 'bell', Icon: Bell },
      { name: 'send', Icon: Send },
      { name: 'inbox', Icon: Inbox },
      { name: 'users', Icon: Users },
      { name: 'user', Icon: User },
    ]
  },
  {
    category: 'TRAVEL & PLACES',
    icons: [
      { name: 'globe', Icon: Globe },
      { name: 'map-pin', Icon: MapPin },
      { name: 'map', Icon: Map },
      { name: 'compass', Icon: Compass },
      { name: 'navigation', Icon: Navigation },
      { name: 'plane', Icon: Plane },
      { name: 'home', Icon: Home },
      { name: 'car', Icon: Car },
      { name: 'bus', Icon: Bus },
      { name: 'truck', Icon: Truck },
    ]
  },
  {
    category: 'LIFESTYLE',
    icons: [
      { name: 'book', Icon: Book },
      { name: 'coffee', Icon: Coffee },
      { name: 'heart', Icon: Heart },
      { name: 'star', Icon: Star },
      { name: 'crown', Icon: Crown },
      { name: 'trophy', Icon: Trophy },
      { name: 'rocket', Icon: Rocket },
      { name: 'zap', Icon: Zap },
      { name: 'pizza', Icon: Pizza },
      { name: 'utensils', Icon: Utensils },
      { name: 'wine', Icon: Wine },
      { name: 'gamepad', Icon: Gamepad },
      { name: 'dumbbell', Icon: Dumbbell },
      { name: 'shirt', Icon: Shirt },
    ]
  },
  {
    category: 'SECURITY',
    icons: [
      { name: 'lock', Icon: Lock },
      { name: 'unlock', Icon: Unlock },
      { name: 'key', Icon: Key },
      { name: 'shield', Icon: Shield },
      { name: 'eye', Icon: Eye },
      { name: 'eye-off', Icon: EyeOff },
    ]
  },
  {
    category: 'WEATHER',
    icons: [
      { name: 'sun', Icon: Sun },
      { name: 'moon', Icon: Moon },
      { name: 'cloud-rain', Icon: CloudRain },
      { name: 'cloud-snow', Icon: CloudSnow },
      { name: 'wind', Icon: Wind },
      { name: 'umbrella', Icon: Umbrella },
    ]
  },
  {
    category: 'OTHER',
    icons: [
      { name: 'flag', Icon: Flag },
      { name: 'bookmark', Icon: Bookmark },
      { name: 'tag', Icon: Tag },
      { name: 'hash', Icon: Hash },
      { name: 'check', Icon: Check },
      { name: 'settings', Icon: Settings },
      { name: 'info', Icon: Info },
      { name: 'help-circle', Icon: HelpCircle },
      { name: 'alert-circle', Icon: AlertCircle },
    ]
  },
]

interface IconPickerModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  currentIcon: string
  onIconSelected: (iconName: string) => void
}

export function IconPickerModal({
  isOpen,
  onClose,
  categoryId,
  currentIcon,
  onIconSelected
}: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(currentIcon)
  const [saving, setSaving] = useState(false)

  // Filter icons based on search
  const filteredLibrary = iconLibrary.map(category => ({
    ...category,
    icons: category.icons.filter(icon =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.icons.length > 0)

  const handleSave = async () => {
    if (selectedIcon === currentIcon) {
      onClose()
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon: selectedIcon }),
      })

      if (!res.ok) throw new Error('Failed to update icon')

      toast.success('Icon updated successfully!')
      onIconSelected(selectedIcon)
      onClose()
    } catch (error) {
      console.error('Error updating icon:', error)
      toast.error('Failed to update icon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">CHOOSE AN ICON</DialogTitle>
          <DialogDescription>
            Select an icon for your category folder
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {filteredLibrary.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                {category.category}
              </h3>
              <div className="grid grid-cols-8 gap-2">
                {category.icons.map((icon, iconIdx) => {
                  const IconComponent = icon.Icon
                  const isSelected = selectedIcon === icon.name
                  return (
                    <button
                      key={iconIdx}
                      onClick={() => setSelectedIcon(icon.name)}
                      className={`
                        aspect-square rounded-lg border-2 p-3
                        flex items-center justify-center
                        transition-all hover:scale-110
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                      title={icon.name}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredLibrary.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No icons found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedIcon && (
              <span className="font-medium">Selected: {selectedIcon}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Icon'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
