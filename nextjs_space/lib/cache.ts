/**
 * Next.js Data Caching Utilities
 * Uses unstable_cache for server-side caching of frequently accessed data
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

// Cache tags for invalidation
export const CACHE_TAGS = {
  categories: 'categories',
  tags: 'tags',
  bookmarks: 'bookmarks',
  companies: 'companies',
  user: 'user',
} as const

// Cache durations (in seconds)
export const CACHE_DURATION = {
  short: 60,          // 1 minute
  medium: 300,        // 5 minutes
  long: 900,          // 15 minutes
  veryLong: 3600,     // 1 hour
} as const

/**
 * Get cached categories for a user
 * Revalidates every 5 minutes
 */
export const getCachedCategories = (userId: string) => 
  unstable_cache(
    async () => {
      return prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        include: {
          folder: true,
          _count: { select: { bookmarks: true } },
        },
      })
    },
    [`categories-${userId}`],
    {
      revalidate: CACHE_DURATION.medium,
      tags: [CACHE_TAGS.categories, `user-${userId}`],
    }
  )()

/**
 * Get cached tags for a user
 * Revalidates every 5 minutes
 */
export const getCachedTags = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.tag.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { bookmarks: true } },
        },
      })
    },
    [`tags-${userId}`],
    {
      revalidate: CACHE_DURATION.medium,
      tags: [CACHE_TAGS.tags, `user-${userId}`],
    }
  )()

/**
 * Get cached bookmark count for a user
 * Useful for dashboard stats
 */
export const getCachedBookmarkCount = (userId: string, companyId?: string) =>
  unstable_cache(
    async () => {
      return prisma.bookmark.count({
        where: {
          userId,
          ...(companyId ? { companyId } : {}),
        },
      })
    },
    [`bookmark-count-${userId}-${companyId || 'all'}`],
    {
      revalidate: CACHE_DURATION.short,
      tags: [CACHE_TAGS.bookmarks, `user-${userId}`],
    }
  )()

/**
 * Get cached user profile
 * Includes subscription tier and basic info
 */
export const getCachedUserProfile = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          fullName: true,
          subscriptionTier: true,
          customLogo: true,
          image: true,
        },
      })
    },
    [`user-profile-${userId}`],
    {
      revalidate: CACHE_DURATION.long,
      tags: [CACHE_TAGS.user, `user-${userId}`],
    }
  )()

/**
 * Get cached companies for a user
 */
export const getCachedCompanies = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.company.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      })
    },
    [`companies-${userId}`],
    {
      revalidate: CACHE_DURATION.medium,
      tags: [CACHE_TAGS.companies, `user-${userId}`],
    }
  )()

/**
 * Helper to invalidate cache for a user
 * Note: In Next.js 14+, use revalidateTag from next/cache in server actions
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  // This function serves as documentation for cache invalidation
  // In actual server actions, import { revalidateTag } from 'next/cache'
  // and call: revalidateTag(`user-${userId}`)
  console.log(`Cache invalidation requested for user: ${userId}`)
}

