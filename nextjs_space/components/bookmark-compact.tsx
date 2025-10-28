
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Folder, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count: {
    bookmarks: number
  }
  createdBy?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface BookmarkCompactProps {
  bookmarks: any[]
  onUpdate: () => void
}

// Folder icon colors mapping (matches original site)
const folderColors: Record<string, string> = {
  "accounting": "#f59e0b",
  "ai automation": "#14b8a6",
  "ai chatbot": "#ef4444",
  "ai technology": "#3b82f6",
  "ai vibe coding": "#10b981",
  "basketball": "#3b82f6",
  "bills": "#3b82f6",
  "blanks": "#3b82f6",
  "blog & newsletter": "#6b7280",
  "business": "#3b82f6",
  "content curation": "#3b82f6",
  "design": "#3b82f6",
  "development": "#3b82f6",
  "download": "#3b82f6",
  "e-commerce": "#3b82f6",
  "email": "#3b82f6",
  "food shopping": "#3b82f6",
  "freelance": "#a855f7",
  "general": "#3b82f6",
  "general information": "#3b82f6",
  "houston essentials": "#10b981",
  "lifestyle": "#3b82f6",
  "llms": "#f59e0b",
  "marketing": "#3b82f6",
  "payment gateway": "#3b82f6",
  "phone": "#3b82f6",
  "print on demand": "#3b82f6",
  "shipping": "#3b82f6",
  "social media": "#84cc16",
  "sports": "#ec4899",
  "tbf podcast": "#a855f7",
  "technology": "#3b82f6",
  "video & design": "#3b82f6",
  "web hosting": "#3b82f6",
  "website": "#3b82f6",
}

const getFolderColor = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase()
  return folderColors[normalizedName] || "#3b82f6"
}

export function BookmarkCompact({ bookmarks, onUpdate }: BookmarkCompactProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/bookmarkai-addons/categories/${categoryId}/compact`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!categories?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Folder className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No folders found</h3>
        <p className="text-gray-500">Create categories to organize your bookmarks</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => {
        const folderColor = getFolderColor(category.name)
        const bookmarkCount = category._count?.bookmarks || 0

        return (
          <div
            key={category.id}
            className="relative bg-white border border-gray-200 rounded-xl p-7 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 group aspect-square flex flex-col"
            onClick={() => handleCategoryClick(category.id)}
          >
            {/* Top Section */}
            <div className="flex items-start justify-between mb-5">
              {/* Folder Icon with colored background */}
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${folderColor}15` }}
              >
                <Folder 
                  className="w-12 h-12" 
                  style={{ color: folderColor }}
                  strokeWidth={2.5}
                />
              </div>

              {/* Grid dots menu */}
              <div className="z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="5" cy="5" r="1.5" />
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="5" cy="19" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/bookmarkai-addons/categories/${category.id}/compact`)
                    }}>
                      Open Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      // Add edit functionality
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Add delete functionality
                      }}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Category Name */}
            <div className="mb-auto">
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide line-clamp-2 leading-tight">
                {category.name}
              </h3>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between mt-auto pt-4">
              {/* Bookmark Count - Left */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Bookmark className="w-4 h-4" />
                <span className="font-medium uppercase tracking-wide whitespace-nowrap">
                  {bookmarkCount} BOOKMARK{bookmarkCount !== 1 ? 'S' : ''}
                </span>
              </div>

              {/* User Avatar - Right */}
              <Avatar className="h-11 w-11 border-2 border-gray-200 shadow-sm bg-gray-600 flex-shrink-0">
                <AvatarImage 
                  src={category.createdBy?.image || undefined} 
                  alt={category.createdBy?.name || "User"} 
                />
                <AvatarFallback className="bg-gray-600 text-white text-sm">
                  {category.createdBy?.name?.[0]?.toUpperCase() || 
                   category.createdBy?.email?.[0]?.toUpperCase() || 
                   'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )
      })}
    </div>
  )
}
