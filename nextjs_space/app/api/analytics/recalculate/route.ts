
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { prisma } from "@/lib/db"

/**
 * Calculate engagement score based on multiple factors:
 * - Visit frequency (0-30 points): More visits = higher score
 * - Recency (0-25 points): Recently visited = higher score  
 * - Time spent (0-20 points): More time = higher score
 * - Organization (0-15 points): Has categories/tags = higher score
 * - Enrichment (0-10 points): Has notes, is favorited = higher score
 * 
 * Total max score: 100
 */
function calculateEngagementScore(bookmark: {
  totalVisits: number
  lastVisited: Date | null
  timeSpent: number
  isFavorite: boolean
  notes: string | null
  categories: any[]
  tags: any[]
  createdAt: Date
}): number {
  let score = 0
  
  // Visit frequency (0-30 points)
  if (bookmark.totalVisits >= 1) {
    score += Math.min(30, 5 + Math.floor(bookmark.totalVisits * 1.2))
  }
  
  // Recency (0-25 points) - use lastVisited or createdAt
  const lastActivity = bookmark.lastVisited || bookmark.createdAt
  if (lastActivity) {
    const daysSinceVisit = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceVisit === 0) score += 25
    else if (daysSinceVisit <= 7) score += 20
    else if (daysSinceVisit <= 30) score += 15
    else if (daysSinceVisit <= 90) score += 10
    else score += 5
  }
  
  // Time spent (0-20 points) - timeSpent is in seconds
  const minutes = bookmark.timeSpent / 60
  score += Math.min(20, Math.floor(minutes * 5))
  
  // Organization (0-15 points)
  if (bookmark.categories && bookmark.categories.length > 0) score += 8
  if (bookmark.tags && bookmark.tags.length > 0) score += 7
  
  // Enrichment (0-10 points)
  if (bookmark.isFavorite) score += 5
  if (bookmark.notes && bookmark.notes.trim().length > 0) score += 5
  
  return Math.min(100, score)
}

/**
 * POST /api/analytics/recalculate
 * Recalculates engagement scores for all bookmarks
 * This is useful to initialize or refresh engagement data
 */
export async function POST(request: Request) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all bookmarks for the user with related data
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        categories: true,
        tags: true,
      },
    })

    let updated = 0
    const results: { id: string; title: string; oldScore: number; newScore: number }[] = []

    // Update each bookmark's engagement score
    for (const bookmark of bookmarks) {
      const newScore = calculateEngagementScore({
        totalVisits: bookmark.totalVisits,
        lastVisited: bookmark.lastVisited,
        timeSpent: bookmark.timeSpent,
        isFavorite: bookmark.isFavorite,
        notes: bookmark.notes,
        categories: bookmark.categories,
        tags: bookmark.tags,
        createdAt: bookmark.createdAt,
      })

      if (newScore !== bookmark.engagementScore) {
        await prisma.bookmark.update({
          where: { id: bookmark.id },
          data: { engagementScore: newScore },
        })
        
        results.push({
          id: bookmark.id,
          title: bookmark.title,
          oldScore: bookmark.engagementScore,
          newScore: newScore,
        })
        updated++
      }
    }

    // Also update daily analytics summary for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const avgEngagement = bookmarks.length > 0
      ? Math.round(bookmarks.reduce((sum, b) => {
          const score = calculateEngagementScore({
            totalVisits: b.totalVisits,
            lastVisited: b.lastVisited,
            timeSpent: b.timeSpent,
            isFavorite: b.isFavorite,
            notes: b.notes,
            categories: b.categories,
            tags: b.tags,
            createdAt: b.createdAt,
          })
          return sum + score
        }, 0) / bookmarks.length)
      : 0

    await prisma.analytics.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      create: {
        userId: session.user.id,
        date: today,
        engagementScore: avgEngagement,
        totalVisits: 0,
        bookmarksViewed: 0,
        timeSpent: 0,
      },
      update: {
        engagementScore: avgEngagement,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Recalculated engagement scores for ${updated} bookmarks`,
      totalBookmarks: bookmarks.length,
      updatedCount: updated,
      averageEngagement: avgEngagement,
      updates: results.slice(0, 10), // Return first 10 for preview
    })
  } catch (error) {
    console.error("Error recalculating engagement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/analytics/recalculate
 * Returns current engagement score criteria and summary
 */
export async function GET(request: Request) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get summary of current engagement scores
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        engagementScore: true,
        totalVisits: true,
        timeSpent: true,
        isFavorite: true,
      },
    })

    const totalBookmarks = bookmarks.length
    const avgEngagement = totalBookmarks > 0
      ? Math.round(bookmarks.reduce((sum, b) => sum + b.engagementScore, 0) / totalBookmarks)
      : 0
    const totalVisits = bookmarks.reduce((sum, b) => sum + b.totalVisits, 0)
    const totalTimeSpent = bookmarks.reduce((sum, b) => sum + b.timeSpent, 0)
    const favoritesCount = bookmarks.filter(b => b.isFavorite).length

    return NextResponse.json({
      criteria: {
        visitFrequency: "0-30 points based on total visits (more visits = higher score)",
        recency: "0-25 points based on last visit (today=25, this week=20, this month=15, older=5-10)",
        timeSpent: "0-20 points based on time spent (1 min = 5 points, max 20 at 4+ min)",
        organization: "0-15 points for having categories (8) and tags (7)",
        enrichment: "0-10 points for favorites (5) and notes (5)",
        maxScore: 100,
      },
      summary: {
        totalBookmarks,
        averageEngagement: avgEngagement,
        totalVisits,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        favoritesCount,
        scoreDistribution: {
          excellent: bookmarks.filter(b => b.engagementScore >= 80).length,
          good: bookmarks.filter(b => b.engagementScore >= 50 && b.engagementScore < 80).length,
          fair: bookmarks.filter(b => b.engagementScore >= 25 && b.engagementScore < 50).length,
          low: bookmarks.filter(b => b.engagementScore < 25).length,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching engagement criteria:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

