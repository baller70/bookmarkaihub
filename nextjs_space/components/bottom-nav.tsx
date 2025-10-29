"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  Bot,
  Store,
  Settings,
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

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] max-w-[72px] flex-1 py-2 px-1 rounded-lg transition-all touch-target",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1 flex-shrink-0",
                isActive && "text-blue-600"
              )} />
              <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
