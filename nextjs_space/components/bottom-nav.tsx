"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  Bot,
  Store,
  Settings,
  LogOut,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "DNA",
    href: "/dna-profile",
    icon: User,
  },
  {
    name: "AI Pilot",
    href: "/ai-linkpilot",
    icon: Bot,
  },
  {
    name: "Market",
    href: "/marketplace",
    icon: Store,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 safe-area-bottom">
      <nav className="flex items-center justify-around px-2 py-2.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] max-w-[76px] flex-1 py-2.5 px-1.5 rounded-lg transition-all touch-target",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1.5 flex-shrink-0",
                isActive && "text-blue-600 dark:text-blue-400"
              )} />
              <span className="text-[10px] font-medium truncate w-full text-center leading-normal">
                {item.name}
              </span>
            </Link>
          )
        })}
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center min-w-[60px] max-w-[76px] flex-1 py-2.5 px-1.5 rounded-lg transition-all touch-target text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5 mb-1.5 flex-shrink-0" />
          <span className="text-[10px] font-medium truncate w-full text-center leading-normal">
            Logout
          </span>
        </button>
      </nav>
    </div>
  )
}
