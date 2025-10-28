
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Folder, MoreVertical } from "lucide-react"
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
    router.push(`/categories/${categoryId}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map((category) => {
        const folderColor = getFolderColor(category.name)
        const bookmarkCount = category._count?.bookmarks || 0

        return (
          <div
            key={category.id}
            className="relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 group"
            onClick={() => handleCategoryClick(category.id)}
          >
            {/* Three-dot menu */}
            <div className="absolute top-3 right-3 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/categories/${category.id}`)
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

            {/* Folder Icon */}
            <div className="flex justify-start mb-3">
              <div className="relative">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12.7071 7.70711C12.8946 7.89464 13.149 8 13.4142 8H19C20.1046 8 21 8.89543 21 10V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                    stroke={folderColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Category Name */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide line-clamp-2">
                {category.name}
              </h3>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              {/* Bookmark Count */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium">
                  {bookmarkCount} BOOKMARK{bookmarkCount !== 1 ? 'S' : ''}
                </span>
              </div>

              {/* User Avatar */}
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarImage 
                  src={category.createdBy?.image || undefined} 
                  alt={category.createdBy?.name || "User"} 
                />
                <AvatarFallback className="bg-gray-400 text-white text-xs">
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
