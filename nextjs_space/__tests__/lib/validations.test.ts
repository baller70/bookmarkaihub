/**
 * Tests for Zod validation schemas
 */

import {
  createBookmarkSchema,
  updateBookmarkSchema,
  createCategorySchema,
  createTagSchema,
  searchQuerySchema,
  bulkUploadSchema,
  paginationSchema,
  validateInput,
  formatZodError,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('createBookmarkSchema', () => {
    it('validates a valid bookmark', () => {
      const validBookmark = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'A description',
        priority: 'HIGH' as const,
      }
      
      const result = validateInput(createBookmarkSchema, validBookmark)
      expect(result.success).toBe(true)
    })

    it('rejects invalid URL', () => {
      const invalidBookmark = {
        url: 'not-a-url',
        title: 'Example',
      }
      
      const result = validateInput(createBookmarkSchema, invalidBookmark)
      expect(result.success).toBe(false)
    })

    it('rejects empty title', () => {
      const invalidBookmark = {
        url: 'https://example.com',
        title: '',
      }
      
      const result = validateInput(createBookmarkSchema, invalidBookmark)
      expect(result.success).toBe(false)
    })

    it('rejects title that is too long', () => {
      const invalidBookmark = {
        url: 'https://example.com',
        title: 'a'.repeat(501),
      }
      
      const result = validateInput(createBookmarkSchema, invalidBookmark)
      expect(result.success).toBe(false)
    })

    it('accepts optional fields', () => {
      const minimalBookmark = {
        url: 'https://example.com',
        title: 'Minimal',
      }
      
      const result = validateInput(createBookmarkSchema, minimalBookmark)
      expect(result.success).toBe(true)
    })
  })

  describe('createCategorySchema', () => {
    it('validates a valid category', () => {
      const validCategory = {
        name: 'Tech',
        color: '#FF5733',
        icon: 'folder',
      }
      
      const result = validateInput(createCategorySchema, validCategory)
      expect(result.success).toBe(true)
    })

    it('rejects invalid color format', () => {
      const invalidCategory = {
        name: 'Tech',
        color: 'red',
      }
      
      const result = validateInput(createCategorySchema, invalidCategory)
      expect(result.success).toBe(false)
    })

    it('accepts valid hex color', () => {
      const validCategory = {
        name: 'Tech',
        color: '#AABBCC',
      }
      
      const result = validateInput(createCategorySchema, validCategory)
      expect(result.success).toBe(true)
    })
  })

  describe('createTagSchema', () => {
    it('validates a valid tag', () => {
      const validTag = {
        name: 'javascript',
        color: '#F7DF1E',
      }
      
      const result = validateInput(createTagSchema, validTag)
      expect(result.success).toBe(true)
    })

    it('rejects tag name that is too long', () => {
      const invalidTag = {
        name: 'a'.repeat(51),
      }
      
      const result = validateInput(createTagSchema, invalidTag)
      expect(result.success).toBe(false)
    })
  })

  describe('searchQuerySchema', () => {
    it('validates a valid search query', () => {
      const validQuery = {
        q: 'javascript tutorials',
        limit: 20,
        offset: 0,
      }
      
      const result = validateInput(searchQuerySchema, validQuery)
      expect(result.success).toBe(true)
    })

    it('applies default values', () => {
      const minimalQuery = {
        q: 'test',
      }
      
      const result = validateInput(searchQuerySchema, minimalQuery)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(20)
        expect(result.data.offset).toBe(0)
      }
    })

    it('rejects limit over 100', () => {
      const invalidQuery = {
        q: 'test',
        limit: 150,
      }
      
      const result = validateInput(searchQuerySchema, invalidQuery)
      expect(result.success).toBe(false)
    })
  })
})

describe('formatZodError', () => {
  it('formats errors correctly', () => {
    const invalidData = { url: 'not-a-url', title: '' }
    const result = validateInput(createBookmarkSchema, invalidData)
    
    if (!result.success) {
      const formatted = formatZodError(result.error)
      expect(formatted.message).toBe('Validation failed')
      expect(Array.isArray(formatted.details)).toBe(true)
      expect(formatted.details.length).toBeGreaterThan(0)
    }
  })
})

