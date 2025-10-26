
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder } from "lucide-react"

interface BookmarkFoldersProps {
  bookmarks: any[]
  onUpdate: () => void
}

export function BookmarkFolders({ bookmarks, onUpdate }: BookmarkFoldersProps) {
  const [categories, setCategories] = useState<any[]>([])

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
    }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className="group p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-300"
        >
          <div className="space-y-4">
            {/* Folder Icon */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Folder 
                  className="w-6 h-6"
                  style={{ color: category.color }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 bookmark-title text-sm">
                  {category.name}
                </h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {category._count?.bookmarks || 0} bookmarks
                </Badge>
              </div>
            </div>

            {/* Description */}
            {category.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Updated recently</span>
              <span>{category._count?.bookmarks || 0} items</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
