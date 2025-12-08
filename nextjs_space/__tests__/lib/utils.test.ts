/**
 * Tests for utility functions
 */

import { cn } from '../../lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle undefined values', () => {
      const result = cn('class1', undefined, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('should handle false conditional classes', () => {
      const isActive = false
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle object syntax', () => {
      const result = cn({ active: true, disabled: false })
      expect(result).toBe('active')
    })

    it('should merge tailwind classes correctly', () => {
      // Tailwind merge should handle conflicts
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle empty string', () => {
      const result = cn('')
      expect(result).toBe('')
    })

    it('should handle null values', () => {
      const result = cn('class1', null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle multiple conditional classes', () => {
      const isPrimary = true
      const isLarge = false
      const isDisabled = true
      
      const result = cn(
        'btn',
        isPrimary && 'btn-primary',
        isLarge && 'btn-lg',
        isDisabled && 'btn-disabled'
      )
      expect(result).toBe('btn btn-primary btn-disabled')
    })
  })

  describe('URL parsing helpers', () => {
    it('should extract domain from URL', () => {
      const url = 'https://example.com/path/to/page'
      const domain = new URL(url).hostname
      expect(domain).toBe('example.com')
    })

    it('should handle URLs with www', () => {
      const url = 'https://www.example.com/path'
      const domain = new URL(url).hostname
      expect(domain).toBe('www.example.com')
    })

    it('should handle invalid URLs gracefully', () => {
      const url = 'not-a-valid-url'
      let domain = ''
      try {
        domain = new URL(url).hostname
      } catch {
        domain = url
      }
      expect(domain).toBe('not-a-valid-url')
    })
  })

  describe('Date formatting helpers', () => {
    it('should format date for display', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      expect(formatted).toContain('2024')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
    })

    it('should handle ISO date strings', () => {
      const isoString = '2024-01-15T10:30:00Z'
      const date = new Date(isoString)
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0) // January is 0
      expect(date.getDate()).toBe(15)
    })
  })

  describe('Color validation', () => {
    it('should validate hex color format', () => {
      const validColor = '#3B82F6'
      const isValid = /^#[0-9A-Fa-f]{6}$/.test(validColor)
      expect(isValid).toBe(true)
    })

    it('should reject invalid hex color', () => {
      const invalidColor = '#GGG'
      const isValid = /^#[0-9A-Fa-f]{6}$/.test(invalidColor)
      expect(isValid).toBe(false)
    })

    it('should validate lowercase hex', () => {
      const lowerColor = '#3b82f6'
      const isValid = /^#[0-9A-Fa-f]{6}$/.test(lowerColor)
      expect(isValid).toBe(true)
    })
  })

  describe('Priority mapping', () => {
    const priorityColors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    }

    it('should get correct color for low priority', () => {
      expect(priorityColors['low']).toBe('#10B981')
    })

    it('should get correct color for high priority', () => {
      expect(priorityColors['high']).toBe('#EF4444')
    })

    it('should handle unknown priority', () => {
      const unknownPriority = 'unknown'
      const color = priorityColors[unknownPriority] ?? '#6B7280'
      expect(color).toBe('#6B7280')
    })
  })
})

