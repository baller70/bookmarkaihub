

"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { Check, Plus, FolderOpen, MoreVertical, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo, LogoCompact, LogoDark } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string
  name: string
  color: string | null
  backgroundColor: string | null
}

interface DashboardHeaderProps {
  onBookmarkCreated: () => void
  bulkSelectMode?: boolean
  onBulkSelectToggle?: () => void
  selectedCount?: number
  onCategoryFilter?: (categoryId: string | null) => void
}

export function DashboardHeader({
  onBookmarkCreated,
  bulkSelectMode = false,
  onBulkSelectToggle,
  selectedCount = 0,
  onCategoryFilter,
}: DashboardHeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          const categoriesArray = Array.isArray(data) ? data : (data.categories || [])
          setCategories(categoriesArray)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    if (onCategoryFilter) {
      onCategoryFilter(value === "all" ? null : value)
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden lg:flex items-start justify-between">
        {/* Left: Logo and Subtitle */}
        <div>
          <div className="dark:hidden">
            <Logo size="lg" />
          </div>
          <div className="hidden dark:block">
            <Logo size="lg" className="[&_span]:!text-gray-100" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Your Digital Workspace</p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Bulk Select Button with Badge */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkSelectToggle}
              className={cn(
                "h-9 px-4 gap-2 border-2 transition-all",
                bulkSelectMode 
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                  : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-black dark:text-white border-gray-900 dark:border-slate-600"
              )}
            >
              <Check className="h-4 w-4" />
              <FolderOpen className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold">BULK SELECT</span>
            </Button>
            {bulkSelectMode && selectedCount > 0 && (
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                  {selectedCount} SELECTED
                </span>
              </div>
            )}
          </div>

          {/* All Categories Dropdown */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[170px] h-9 text-xs text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
              <SelectValue placeholder="ALL CATEGORIES" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <SelectItem value="all" className="uppercase">ALL CATEGORIES</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-gray-900 dark:text-white">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Bookmark Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-medium">ADD BOOKMARK</span>
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden space-y-5">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="dark:hidden">
            <Logo size="md" />
          </div>
          <div className="hidden dark:block">
            <Logo size="md" className="[&_span]:!text-gray-100" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Your Digital Workspace</p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Bookmark Button - Primary Action */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-medium">ADD BOOKMARK</span>
          </Button>

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onBulkSelectToggle}>
                <Check className="mr-2 h-4 w-4" />
                <span>{bulkSelectMode ? 'Exit Bulk Select' : 'Bulk Select'}</span>
                {bulkSelectMode && selectedCount > 0 && (
                  <span className="ml-auto text-xs text-orange-600">
                    {selectedCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Selector */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full h-10 text-xs text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
            <SelectValue placeholder="ALL CATEGORIES" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            <SelectItem value="all" className="uppercase">ALL CATEGORIES</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="text-gray-900 dark:text-white">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bulk Select Status Badge */}
        {bulkSelectMode && selectedCount > 0 && (
          <div className="text-center">
            <span className="inline-block text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
              {selectedCount} SELECTED
            </span>
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={onBookmarkCreated}
      />
    </>
  )
}
