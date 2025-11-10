

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  X
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
          "fixed left-0 top-0 h-full w-64 bg-gray-50 border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "lg:w-48 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-stone-900">BookmarkHub</h1>
            <p className="text-xs text-slate-500 mt-1">Your digital workspace</p>
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
                      ? "bg-slate-200 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
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
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* User & Logout */}
        {session && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-medium">LOGOUT</span>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
