/**
 * Shared TypeScript types for BookmarkHub application
 * Centralized type definitions to ensure consistency across components
 */

// ==================== TAG TYPES ====================

export interface Tag {
  id: string
  name: string
  color: string
  createdAt?: string
  updatedAt?: string
  _count?: {
    bookmarks: number
  }
}

export interface BookmarkTag {
  id: string
  // Flat structure
  name?: string
  color?: string
  // Nested structure (from API)
  tag?: {
    id: string
    name: string
    color: string
  }
}

// ==================== CATEGORY TYPES ====================

export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
  description?: string | null
  backgroundColor?: string | null
  logo?: string | null
  folderId?: string | null
  createdAt?: string
  updatedAt?: string
  _count?: {
    bookmarks: number
  }
}

export interface CategoryFolder {
  id: string
  name: string
  categories: Category[]
  createdAt?: string
  updatedAt?: string
}

// BookmarkCategory as returned from API - nested structure
export interface BookmarkCategory {
  id?: string
  category?: {
    id: string
    name: string
    color: string
  }
  // Some APIs return flat structure
  name?: string
  color?: string
}

// ==================== BOOKMARK TYPES ====================

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string | null
  favicon?: string | null
  faviconUrl?: string | null
  previewImage?: string | null
  priority?: Priority | string | null
  isFavorite: boolean
  visitCount: number
  totalVisits?: number
  openTasks?: number
  completedTasks?: number
  totalTasks?: number
  engagementPercentage?: number
  usagePercentage?: number
  timeSpent?: number
  // Custom styling
  customBackground?: string | null
  customLogo?: string | null
  customFavicon?: string | null
  // Relationships
  category?: Category | null
  categories?: BookmarkCategory[]
  tags?: BookmarkTag[] | null
  // Timestamps
  createdAt: string
  updatedAt?: string
}

// Simplified bookmark for list views
export interface BookmarkListItem {
  id: string
  title: string
  url: string
  description?: string | null
  favicon?: string | null
  priority?: Priority | string | null
  isFavorite: boolean
  visitCount: number
  createdAt: string
}

// ==================== BULK UPLOAD TYPES ====================

export type UploadStatus = 'queued' | 'processing' | 'success' | 'failed' | 'duplicate' | 'skipped'

export interface BulkUploadLink {
  url: string
  title?: string
  status: UploadStatus
  error?: string
  bookmarkId?: string
}

export interface BulkUploadLog {
  id: string
  totalLinks: number
  successCount: number
  failedCount: number
  duplicateCount: number
  skippedCount: number
  settings?: Record<string, unknown>
  source: string
  importMethod?: string
  linksData?: BulkUploadLink[]
  createdAt: string
  updatedAt?: string
}

export interface BulkUploadStats {
  total: number
  perfect: number
  queued: number
  processing: number
  success: number
  failed: number
  successRate: number
}

// ==================== COMPONENT PROP TYPES ====================

export interface BookmarkCardProps {
  bookmark: Bookmark
  compact?: boolean
  onUpdate: () => void
  bulkSelectMode?: boolean
  isSelected?: boolean
  onSelect?: (id: string) => void
}

// ==================== UTILITY TYPES ====================

export type SortBy = 'recent' | 'oldest' | 'title' | 'favorites' | 'priority' | 'visits'
export type ViewMode = 'GRID' | 'COMPACT' | 'LIST' | 'TIMELINE' | 'HIERARCHY' | 'FOLDER' | 'GOAL' | 'KANBAN'

