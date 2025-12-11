
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
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
}): number {
  let score = 0
  
  // Visit frequency (0-30 points)
  // 1-5 visits: 5-15 points, 6-20 visits: 16-25 points, 21+: 26-30 points
  if (bookmark.totalVisits >= 1) {
    score += Math.min(30, 5 + Math.floor(bookmark.totalVisits * 1.2))
  }
  
  // Recency (0-25 points)
  // Visited today: 25, this week: 20, this month: 15, older: 5-10
  if (bookmark.lastVisited) {
    const daysSinceVisit = Math.floor((Date.now() - new Date(bookmark.lastVisited).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceVisit === 0) score += 25
    else if (daysSinceVisit <= 7) score += 20
    else if (daysSinceVisit <= 30) score += 15
    else if (daysSinceVisit <= 90) score += 10
    else score += 5
  }
  
  // Time spent (0-20 points)
  // timeSpent is in seconds, 1 min = 5 points, max 20 points at 4+ min
  const minutes = bookmark.timeSpent / 60
  score += Math.min(20, Math.floor(minutes * 5))
  
  // Organization (0-15 points)
  // Has categories: 8 points, has tags: 7 points
  if (bookmark.categories && bookmark.categories.length > 0) score += 8
  if (bookmark.tags && bookmark.tags.length > 0) score += 7
  
  // Enrichment (0-10 points)
  // Is favorite: 5 points, has notes: 5 points
  if (bookmark.isFavorite) score += 5
  if (bookmark.notes && bookmark.notes.trim().length > 0) score += 5
  
  return Math.min(100, score)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse optional time spent from request body
    let additionalTimeSpent = 0
    try {
      const body = await request.json()
      if (body.timeSpent && typeof body.timeSpent === 'number') {
        additionalTimeSpent = Math.max(0, Math.floor(body.timeSpent)) // in seconds
      }
    } catch {
      // No body or invalid JSON, continue with just visit tracking
    }

    // Verify the bookmark belongs to the user and get full data for engagement calculation
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        categories: true,
        tags: true,
      },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    // Calculate new values
    const newTotalVisits = existingBookmark.totalVisits + 1
    const newTimeSpent = existingBookmark.timeSpent + additionalTimeSpent
    
    // Calculate engagement score with updated values
    const engagementScore = calculateEngagementScore({
      totalVisits: newTotalVisits,
      lastVisited: new Date(),
      timeSpent: newTimeSpent,
      isFavorite: existingBookmark.isFavorite,
      notes: existingBookmark.notes,
      categories: existingBookmark.categories,
      tags: existingBookmark.tags,
    })

    // Update bookmark with all tracking data
    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: {
        totalVisits: newTotalVisits,
        timeSpent: newTimeSpent,
        engagementScore: engagementScore,
        lastVisited: new Date(),
      },
    })

    // Log the view
    await prisma.bookmarkHistory.create({
      data: {
        action: "VIEWED",
        details: `Bookmark viewed (visit #${newTotalVisits})`,
        bookmarkId: params.id,
      },
    })

    // Update daily analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
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
        totalVisits: 1,
        bookmarksViewed: 1,
        timeSpent: additionalTimeSpent > 0 ? Math.floor(additionalTimeSpent / 60) : 1, // in minutes
      },
      update: {
        totalVisits: { increment: 1 },
        bookmarksViewed: { increment: 1 },
        timeSpent: { increment: additionalTimeSpent > 0 ? Math.floor(additionalTimeSpent / 60) : 1 },
      },
    })

    return NextResponse.json({ 
      success: true,
      totalVisits: bookmark.totalVisits,
      engagementScore: bookmark.engagementScore,
      timeSpent: bookmark.timeSpent,
    })
  } catch (error) {
    console.error("Error tracking visit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
