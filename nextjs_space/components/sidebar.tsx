
"use client"

import { useState } from "react"
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
  Zap
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

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-stone-900">BookmarkHub</h1>
        <p className="text-xs text-slate-500 mt-1">Your digital workspace</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
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
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
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
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Upgrade to Pro Card */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <Zap className="h-6 w-6 mb-2" />
          <p className="text-sm font-medium mb-2">Upgrade to Pro</p>
          <p className="text-xs opacity-90 mb-3">
            Get pro now to own all dashboards, templates and components for life.
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            Get Shadcn UI Kit
          </Button>
        </div>
      </div>

      {/* User & Logout */}
      {session && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="p-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
