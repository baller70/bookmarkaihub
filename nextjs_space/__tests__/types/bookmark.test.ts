/**
 * Tests for shared TypeScript types
 * These tests verify type structures and default values
 */

import type {
  Tag,
  BookmarkTag,
  Category,
  CategoryFolder,
  BookmarkCategory,
  Bookmark,
  BookmarkListItem,
  BulkUploadLog,
  BulkUploadLink,
  BulkUploadStats,
  Priority,
  SortBy,
  ViewMode,
  UploadStatus,
} from '../../types/bookmark'

describe('Bookmark Types', () => {
  describe('Tag interface', () => {
    it('should create a valid Tag object', () => {
      const tag: Tag = {
        id: 'tag-1',
        name: 'testing',
        color: '#3B82F6',
      }
      expect(tag.id).toBe('tag-1')
      expect(tag.name).toBe('testing')
      expect(tag.color).toBe('#3B82F6')
    })

    it('should allow optional _count field', () => {
      const tagWithCount: Tag = {
        id: 'tag-2',
        name: 'development',
        color: '#10B981',
        _count: { bookmarks: 5 },
      }
      expect(tagWithCount._count?.bookmarks).toBe(5)
    })
  })

  describe('Category interface', () => {
    it('should create a valid Category object', () => {
      const category: Category = {
        id: 'cat-1',
        name: 'Work',
        color: '#EF4444',
      }
      expect(category.id).toBe('cat-1')
      expect(category.name).toBe('Work')
      expect(category.color).toBe('#EF4444')
    })

    it('should allow optional fields', () => {
      const categoryFull: Category = {
        id: 'cat-2',
        name: 'Personal',
        color: '#8B5CF6',
        logo: '/logos/personal.png',
        icon: 'user',
        _count: { bookmarks: 10 },
      }
      expect(categoryFull.logo).toBe('/logos/personal.png')
      expect(categoryFull.icon).toBe('user')
      expect(categoryFull._count?.bookmarks).toBe(10)
    })
  })

  describe('Bookmark interface', () => {
    it('should create a valid Bookmark object', () => {
      const bookmark: Bookmark = {
        id: 'bm-1',
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'A test bookmark',
        priority: 'MEDIUM',
        isFavorite: false,
        visitCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      expect(bookmark.id).toBe('bm-1')
      expect(bookmark.title).toBe('Test Bookmark')
      expect(bookmark.priority).toBe('MEDIUM')
    })

    it('should handle all optional fields', () => {
      const fullBookmark: Bookmark = {
        id: 'bm-2',
        title: 'Full Bookmark',
        url: 'https://example.com/full',
        description: 'A full bookmark with all fields',
        priority: 'HIGH',
        isFavorite: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        favicon: '/favicons/example.png',
        customFavicon: '/custom/favicon.png',
        customLogo: '/custom/logo.png',
        customBackground: '#000000',
        visitCount: 10,
        totalVisits: 15,
        totalTasks: 5,
        completedTasks: 3,
        openTasks: 2,
        timeSpent: 3600,
        usagePercentage: 75,
        tags: [{ id: 'bt-1', tag: { id: 'tag-1', name: 'test', color: '#000' } }],
        categories: [{ id: 'bc-1', category: { id: 'cat-1', name: 'Work', color: '#fff' } }],
      }
      expect(fullBookmark.visitCount).toBe(10)
      expect(fullBookmark.totalTasks).toBe(5)
      expect(fullBookmark.tags?.length).toBe(1)
    })
  })

  describe('Priority type', () => {
    it('should only accept valid priority values', () => {
      const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      expect(priorities).toContain('LOW')
      expect(priorities).toContain('MEDIUM')
      expect(priorities).toContain('HIGH')
      expect(priorities).toContain('URGENT')
    })
  })

  describe('ViewMode type', () => {
    it('should have all expected view modes', () => {
      const viewModes: ViewMode[] = [
        'GRID', 'COMPACT', 'LIST', 'TIMELINE',
        'HIERARCHY', 'FOLDER', 'GOAL', 'KANBAN'
      ]
      expect(viewModes.length).toBe(8)
    })
  })

  describe('BulkUploadStats interface', () => {
    it('should create valid upload stats', () => {
      const stats: BulkUploadStats = {
        total: 100,
        perfect: 0,
        queued: 0,
        processing: 10,
        success: 80,
        failed: 10,
        successRate: 80,
      }
      expect(stats.total).toBe(100)
      expect(stats.success + stats.failed + stats.processing).toBe(100)
    })
  })
})

