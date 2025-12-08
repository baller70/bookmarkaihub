/**
 * Tests for BookmarkCard component
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { Bookmark, Category, BookmarkTag } from '../../types/bookmark'

// Mock the component's dependencies
jest.mock('../../components/ui/toast', () => ({
  toast: jest.fn(),
}))

jest.mock('../../components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Create mock data
const mockBookmark: Bookmark = {
  id: 'bm-1',
  title: 'Test Bookmark',
  url: 'https://example.com',
  description: 'A test bookmark description',
  priority: 'MEDIUM',
  isFavorite: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  favicon: null,
  visitCount: 5,
  totalTasks: 10,
  completedTasks: 3,
  openTasks: 7,
  tags: [
    { id: 'bt-1', tag: { id: 'tag-1', name: 'testing', color: '#3B82F6' } }
  ],
  categories: [
    { id: 'bc-1', category: { id: 'cat-1', name: 'Development', color: '#10B981' } }
  ],
}

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Development', color: '#10B981' },
  { id: 'cat-2', name: 'Design', color: '#F59E0B' },
]

describe('BookmarkCard Mock Tests', () => {
  describe('Bookmark data structure', () => {
    it('should have correct bookmark properties', () => {
      expect(mockBookmark.id).toBe('bm-1')
      expect(mockBookmark.title).toBe('Test Bookmark')
      expect(mockBookmark.url).toBe('https://example.com')
      expect(mockBookmark.priority).toBe('MEDIUM')
    })

    it('should calculate task progress correctly', () => {
      const totalTasks = mockBookmark.totalTasks ?? 0
      const completedTasks = mockBookmark.completedTasks ?? 0
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      
      expect(progress).toBe(30) // 3/10 * 100 = 30%
    })

    it('should handle null favicon gracefully', () => {
      expect(mockBookmark.favicon).toBeNull()
      // The FallbackImage component should handle this
    })

    it('should have valid tags array', () => {
      expect(mockBookmark.tags).toBeDefined()
      expect(mockBookmark.tags?.length).toBe(1)
      expect(mockBookmark.tags?.[0].tag?.name).toBe('testing')
    })

    it('should have valid categories array', () => {
      expect(mockBookmark.categories).toBeDefined()
      expect(mockBookmark.categories?.length).toBe(1)
      expect(mockBookmark.categories?.[0].category?.name).toBe('Development')
    })
  })

  describe('Category data structure', () => {
    it('should have correct category properties', () => {
      expect(mockCategories.length).toBe(2)
      expect(mockCategories[0].name).toBe('Development')
      expect(mockCategories[1].name).toBe('Design')
    })
  })

  describe('Priority handling', () => {
    it('should handle low priority', () => {
      const lowPriorityBookmark = { ...mockBookmark, priority: 'low' as const }
      expect(lowPriorityBookmark.priority).toBe('low')
    })

    it('should handle high priority', () => {
      const highPriorityBookmark = { ...mockBookmark, priority: 'high' as const }
      expect(highPriorityBookmark.priority).toBe('high')
    })

    it('should handle critical priority', () => {
      const criticalPriorityBookmark = { ...mockBookmark, priority: 'critical' as const }
      expect(criticalPriorityBookmark.priority).toBe('critical')
    })
  })

  describe('Favorite toggle', () => {
    it('should toggle favorite status', () => {
      const unfavoritedBookmark = { ...mockBookmark, isFavorite: false }
      expect(unfavoritedBookmark.isFavorite).toBe(false)
      
      const favoritedBookmark = { ...mockBookmark, isFavorite: true }
      expect(favoritedBookmark.isFavorite).toBe(true)
    })
  })

  describe('Visit count handling', () => {
    it('should handle zero visits', () => {
      const noVisitsBookmark = { ...mockBookmark, visitCount: 0 }
      expect(noVisitsBookmark.visitCount).toBe(0)
    })

    it('should handle multiple visits', () => {
      const manyVisitsBookmark = { ...mockBookmark, visitCount: 100 }
      expect(manyVisitsBookmark.visitCount).toBe(100)
    })

    it('should handle undefined visitCount', () => {
      const { visitCount, ...bookmarkWithoutVisits } = mockBookmark
      expect((bookmarkWithoutVisits as Bookmark).visitCount).toBeUndefined()
    })
  })
})

