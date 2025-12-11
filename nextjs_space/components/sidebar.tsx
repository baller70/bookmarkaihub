

"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CompanySwitcher } from "@/components/company-switcher"
import { OracleChat } from "@/components/oracle"
import { LogoCompact, LogoDark } from "@/components/logo"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  LayoutDashboard,
  User,
  Bot,
  Store,
  Settings,
  Folder,
  Tag,
  AlertTriangle,
  LogOut,
  X,
  Sparkles,
  Command,
  Upload,
  Camera,
  Trash2
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "DNA Profile",
    href: "/dna-profile",
    icon: User,
  },
  {
    name: "AI LinkPilot",
    href: "/ai-linkpilot",
    icon: Bot,
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: Store,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const bookmarkAIAddons = [
  {
    name: "Categories",
    href: "/categories",
    icon: Folder,
  },
  {
    name: "Tags",
    href: "/tags",
    icon: Tag,
  },
  {
    name: "Priority",
    href: "/priority",
    icon: AlertTriangle,
  },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [oracleOpen, setOracleOpen] = useState(false)
  
  // Profile avatar state
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch custom avatar on mount
  useEffect(() => {
    fetchCustomAvatar()
    fetchProfile()
  }, [session])

  const fetchCustomAvatar = async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/user/avatar')
      if (res.ok) {
        const data = await res.json()
        if (data.avatarUrl) {
          setCustomAvatar(data.avatarUrl)
        }
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error)
    }
  }

  const fetchProfile = async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        if (data?.firstName) setFirstName(data.firstName)
        if (data?.lastName) setLastName(data.lastName)
        if (!data?.firstName && session.user.name) {
          const parts = session.user.name.split(" ")
          setFirstName(parts[0] || "")
          setLastName(parts.slice(1).join(" "))
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setCustomAvatar(data.avatarUrl)
      toast.success('Profile photo updated!')
      setShowAvatarModal(false)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Delete failed')

      setCustomAvatar(null)
      toast.success('Profile photo removed')
      setShowAvatarModal(false)
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove photo')
    }
  }

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required')
      return
    }
    setSavingProfile(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Profile updated')
      setShowAvatarModal(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "lg:w-48 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Logo */}
        <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            {/* Light mode logo */}
            <LogoCompact className="dark:hidden" />
            {/* Dark mode logo */}
            <LogoDark className="hidden dark:block" />
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Your digital workspace</p>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Company Switcher */}
        <div className="p-3 border-b border-gray-200 dark:border-slate-700">
          <CompanySwitcher />
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* BookmarkAI Addons */}
          <div className="pt-6">
            <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              BookmarkAI Addons
            </p>
            <nav className="space-y-1">
              {bookmarkAIAddons.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Ask Oracle */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setOracleOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="flex-1 text-sm font-medium text-left">Ask Oracle</span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-200/50 dark:bg-purple-800/50 text-[10px]">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </button>
          </div>
        </div>

        {/* User & Logout */}
        {session && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
            {/* User Info - Clickable for avatar upload */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="flex items-center gap-2 w-full p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="relative">
                {customAvatar ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-500/50">
                    <Image
                      src={customAvatar}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {userInitial}
                  </div>
                )}
                {/* Camera icon overlay on hover */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </button>
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-medium">LOGOUT</span>
            </Button>
          </div>
        )}
      </div>

      {/* Oracle Chat Panel */}
      <OracleChat isOpen={oracleOpen} onClose={() => setOracleOpen(false)} />

      {/* Profile Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Profile</DialogTitle>
            <DialogDescription>
              Update your profile photo and name.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {customAvatar ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-blue-500/30">
                    <Image
                      src={customAvatar}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {userInitial}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {firstName || session?.user?.name || 'User'}
              </p>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
              </Button>

              {customAvatar && (
                <Button
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Photo
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Recommended: Square image, at least 200x200px. Max 5MB.
            </p>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  className="w-full h-9 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  className="w-full h-9 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
              Close
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700">
              {savingProfile ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
