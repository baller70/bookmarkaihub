
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Folder, User } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  color: string | null
  backgroundColor: string | null
  icon?: string
  logo?: string | null
  _count?: {
    bookmarks: number
  }
}

interface BookmarkCompactFoldersProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkCompactFolders({ bookmarks, onUpdate }: BookmarkCompactFoldersProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [globalCustomLogo, setGlobalCustomLogo] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchGlobalLogo()
  }, [])

  const fetchGlobalLogo = async () => {
    try {
      const response = await fetch('/api/user/custom-logo')
      if (response.ok) {
        const data = await response.json()
        if (data.customLogoUrl) {
          setGlobalCustomLogo(data.customLogoUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching global custom logo:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        const categoriesArray = data?.categories || data
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
      } else {
        toast.error("Failed to load categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = (categoryId: string) => {
    router.push(`/bookmarkai-addons/categories/${categoryId}/compact`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
        <p className="text-gray-600">Create your first category to organize bookmarks</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* ALL BOOKMARKS Folder - Always first */}
      <div
        onClick={() => handleFolderClick('all')}
        className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer relative group"
      >
        {/* Folder Icon - Top Left (keep default folder) */}
        <div className="flex justify-start mb-5">
          <div
            className="rounded-md p-3 flex items-center justify-center"
            style={{
              backgroundColor: '#3B82F6'
            }}
          >
            <Folder
              className="w-16 h-16"
              style={{
                color: '#FFFFFF',
                fill: 'transparent'
              }}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Category Name */}
        <div className="mb-4">
          <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 truncate">
            ALL BOOKMARKS
          </h3>
        </div>

        {/* Bottom Section - Global Logo & Bookmark Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            {globalCustomLogo ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-gray-300 flex-shrink-0">
                <Image
                  src={globalCustomLogo}
                  alt="All Bookmarks"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-sm font-medium">
              {bookmarks.length} BOOKMARK{bookmarks.length !== 1 ? 'S' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Regular Category Folders */}
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => handleFolderClick(category.id)}
          className="bg-white border border-black rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer relative group"
        >
          {/* Folder Icon - ALWAYS SHOW WITH COLORED BACKGROUND */}
          <div className="flex justify-start mb-5">
            <div
              className="rounded-md p-3 flex items-center justify-center"
              style={{
                backgroundColor: category.backgroundColor || category.color || '#60A5FA'
              }}
            >
              <Folder
                className="w-16 h-16"
                style={{
                  color: '#FFFFFF',
                  fill: 'transparent'
                }}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Category Name */}
          <div className="mb-4">
            <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900 truncate">
              {category.name}
            </h3>
          </div>

          {/* Bottom Section - Logo (if available) & Bookmark Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              {/* Logo goes here next to bookmark count */}
              {category.logo || globalCustomLogo ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-gray-300 flex-shrink-0">
                  <Image
                    src={category.logo || globalCustomLogo || ''}
                    alt={category.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-sm font-medium">
                {category._count?.bookmarks || 0} BOOKMARK{(category._count?.bookmarks || 0) !== 1 ? 'S' : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
