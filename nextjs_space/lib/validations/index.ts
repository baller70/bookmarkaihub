/**
 * Centralized Zod validation schemas for API endpoints
 * Provides type-safe input validation for all API routes
 */

import { z } from 'zod'

// ============== Common Validators ==============
export const cuidSchema = z.string().cuid()
export const uuidSchema = z.string().uuid()
export const idSchema = z.string().min(1, 'ID is required')

export const urlSchema = z.string().url('Invalid URL format').max(2048, 'URL too long')
export const emailSchema = z.string().email('Invalid email format')

// ============== Bookmark Validators ==============
export const createBookmarkSchema = z.object({
  url: urlSchema,
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
})

export const updateBookmarkSchema = createBookmarkSchema.partial().extend({
  id: idSchema,
})

export const bookmarkIdParamSchema = z.object({
  id: idSchema,
})

// ============== Category Validators ==============
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(50).optional(),
  parentId: z.string().optional().nullable(),
  folderId: z.string().optional().nullable(),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
})

// ============== Tag Validators ==============
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

export const updateTagSchema = createTagSchema.partial().extend({
  id: idSchema,
})

// ============== Company Validators ==============
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional().nullable(),
  logo: z.string().url().optional().nullable(),
})

export const updateCompanySchema = createCompanySchema.partial()

// ============== Search Validators ==============
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(500, 'Query too long'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

// ============== Bulk Upload Validators ==============
export const bulkUploadSchema = z.object({
  links: z.array(
    z.object({
      url: urlSchema,
      title: z.string().max(500).optional(),
      description: z.string().max(5000).optional(),
    })
  ).min(1, 'At least one link is required').max(100, 'Maximum 100 links per upload'),
})

// ============== Pagination Validators ==============
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ============== Type Exports ==============
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type BulkUploadInput = z.infer<typeof bulkUploadSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

// ============== Validation Helper ==============
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// Format Zod errors for API response
export function formatZodError(error: z.ZodError): {
  message: string
  details: Array<{ field: string; message: string }>
} {
  return {
    message: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }
}

