/**
 * Production Readiness Test Suite - Edge Cases
 * Tests boundary conditions, empty states, and unusual scenarios
 */

import {
  validateInput,
  createBookmarkSchema,
  createCategorySchema,
  createTagSchema,
  searchQuerySchema,
  paginationSchema,
  bulkUploadSchema,
} from '@/lib/validations'

describe('Edge Cases - Boundary Conditions', () => {
  describe('String Length Boundaries', () => {
    it('should accept bookmark title at exactly 500 chars', () => {
      const result = validateInput(createBookmarkSchema, {
        url: 'https://example.com',
        title: 'a'.repeat(500),
      })
      expect(result.success).toBe(true)
    })

    it('should reject bookmark title at 501 chars', () => {
      const result = validateInput(createBookmarkSchema, {
        url: 'https://example.com',
        title: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('should accept category name at exactly 100 chars', () => {
      const result = validateInput(createCategorySchema, {
        name: 'a'.repeat(100),
      })
      expect(result.success).toBe(true)
    })

    it('should reject category name at 101 chars', () => {
      const result = validateInput(createCategorySchema, {
        name: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('should accept tag name at exactly 50 chars', () => {
      const result = validateInput(createTagSchema, {
        name: 'a'.repeat(50),
      })
      expect(result.success).toBe(true)
    })

    it('should reject tag name at 51 chars', () => {
      const result = validateInput(createTagSchema, {
        name: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it('should accept URL at exactly 2048 chars', () => {
      const baseUrl = 'https://example.com/'
      const padding = 'a'.repeat(2048 - baseUrl.length)
      const result = validateInput(createBookmarkSchema, {
        url: baseUrl + padding,
        title: 'Test',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Pagination Boundaries', () => {
    it('should default page to 1', () => {
      const result = validateInput(paginationSchema, {})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should accept page 1 (minimum)', () => {
      const result = validateInput(paginationSchema, { page: 1 })
      expect(result.success).toBe(true)
    })

    it('should reject page 0', () => {
      const result = validateInput(paginationSchema, { page: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject negative page', () => {
      const result = validateInput(paginationSchema, { page: -1 })
      expect(result.success).toBe(false)
    })

    it('should accept limit of 100 (maximum)', () => {
      const result = validateInput(paginationSchema, { limit: 100 })
      expect(result.success).toBe(true)
    })

    it('should reject limit of 101', () => {
      const result = validateInput(paginationSchema, { limit: 101 })
      expect(result.success).toBe(false)
    })

    it('should accept limit of 1 (minimum)', () => {
      const result = validateInput(paginationSchema, { limit: 1 })
      expect(result.success).toBe(true)
    })

    it('should reject limit of 0', () => {
      const result = validateInput(paginationSchema, { limit: 0 })
      expect(result.success).toBe(false)
    })
  })

  describe('Search Query Boundaries', () => {
    it('should require minimum 1 char for search', () => {
      const result = validateInput(searchQuerySchema, { q: '' })
      expect(result.success).toBe(false)
    })

    it('should accept 1 char search query', () => {
      const result = validateInput(searchQuerySchema, { q: 'a' })
      expect(result.success).toBe(true)
    })

    it('should reject search query over 500 chars', () => {
      const result = validateInput(searchQuerySchema, { q: 'a'.repeat(501) })
      expect(result.success).toBe(false)
    })

    it('should accept search query at exactly 500 chars', () => {
      const result = validateInput(searchQuerySchema, { q: 'a'.repeat(500) })
      expect(result.success).toBe(true)
    })
  })

  describe('Bulk Upload Boundaries', () => {
    it('should accept exactly 1 link (minimum)', () => {
      const result = validateInput(bulkUploadSchema, {
        links: [{ url: 'https://example.com' }],
      })
      expect(result.success).toBe(true)
    })

    it('should accept exactly 100 links (maximum)', () => {
      const links = Array(100).fill(null).map((_, i) => ({
        url: `https://example${i}.com`,
      }))
      const result = validateInput(bulkUploadSchema, { links })
      expect(result.success).toBe(true)
    })

    it('should reject 101 links', () => {
      const links = Array(101).fill(null).map((_, i) => ({
        url: `https://example${i}.com`,
      }))
      const result = validateInput(bulkUploadSchema, { links })
      expect(result.success).toBe(false)
    })
  })
})

describe('Edge Cases - Empty States', () => {
  it('should reject empty title', () => {
    const result = validateInput(createBookmarkSchema, {
      url: 'https://example.com',
      title: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty category name', () => {
    const result = validateInput(createCategorySchema, { name: '' })
    expect(result.success).toBe(false)
  })

  it('should reject empty tag name', () => {
    const result = validateInput(createTagSchema, { name: '' })
    expect(result.success).toBe(false)
  })

  it('should accept empty/null description', () => {
    const result = validateInput(createBookmarkSchema, {
      url: 'https://example.com',
      title: 'Test',
      description: null,
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty tags array', () => {
    const result = validateInput(createBookmarkSchema, {
      url: 'https://example.com',
      title: 'Test',
      tags: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('Edge Cases - Special Characters', () => {
  it('should accept Unicode in title', () => {
    const result = validateInput(createBookmarkSchema, {
      url: 'https://example.com',
      title: '日本語タイトル 🚀 émoji & symbols',
    })
    expect(result.success).toBe(true)
  })

  it('should accept Unicode in category name', () => {
    const result = validateInput(createCategorySchema, {
      name: '开发工具 📚',
    })
    expect(result.success).toBe(true)
  })

  it('should accept newlines in description', () => {
    const result = validateInput(createBookmarkSchema, {
      url: 'https://example.com',
      title: 'Test',
      description: 'Line 1\nLine 2\nLine 3',
    })
    expect(result.success).toBe(true)
  })
})

