
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30" // days

    const days = parseInt(range)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all bookmarks for the user
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Calculate overview statistics
    const totalBookmarks = bookmarks.length
    const totalVisits = bookmarks.reduce((sum, b) => sum + b.totalVisits, 0)
    const totalTimeSpent = bookmarks.reduce((sum, b) => sum + b.timeSpent, 0)
    const avgEngagement = bookmarks.length > 0
      ? bookmarks.reduce((sum, b) => sum + b.engagementScore, 0) / bookmarks.length
      : 0

    // Calculate bookmarks added in the time period
    const bookmarksInPeriod = bookmarks.filter(
      (b) => new Date(b.createdAt) >= startDate
    ).length

    // Calculate category statistics
    const categoryStats: Record<string, any> = {}
    bookmarks.forEach((bookmark) => {
      bookmark.categories.forEach((bc) => {
        const catName = bc.category.name
        if (!categoryStats[catName]) {
          categoryStats[catName] = {
            name: catName,
            bookmarks: 0,
            visits: 0,
            timeSpent: 0,
            color: bc.category.color,
          }
        }
        categoryStats[catName].bookmarks++
        categoryStats[catName].visits += bookmark.totalVisits
        categoryStats[catName].timeSpent += bookmark.timeSpent
      })
    })

    const topCategories = Object.values(categoryStats)
      .sort((a: any, b: any) => b.timeSpent - a.timeSpent)
      .slice(0, 5)
      .map((cat: any) => ({
        name: cat.name,
        time: `${(cat.timeSpent / 60).toFixed(1)}h`,
        percent: totalTimeSpent > 0 ? Math.round((cat.timeSpent / totalTimeSpent) * 100) : 0,
        bookmarks: cat.bookmarks,
        visits: cat.visits,
        color: cat.color,
      }))

    // Calculate top performing bookmarks
    const topPerformers = bookmarks
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
      .map((b) => ({
        title: b.title,
        visits: b.totalVisits,
        engagement: b.engagementScore,
        category: b.categories[0]?.category.name || 'Uncategorized',
      }))

    // Calculate underperformers (low visit count)
    const underperformers = bookmarks
      .filter((b) => b.totalVisits < 10)
      .sort((a, b) => a.totalVisits - b.totalVisits)
      .slice(0, 5)
      .map((b) => ({
        title: b.title,
        visits: b.totalVisits,
        engagement: b.engagementScore,
        category: b.categories[0]?.category.name || 'Uncategorized',
      }))

    // Calculate weekly pattern (last 7 days)
    const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      
      const dayAnalytics = analytics.find(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      )
      
      return {
        day: dayName,
        hours: dayAnalytics ? dayAnalytics.timeSpent / 60 : 0,
        percentage: 0, // Will be calculated after we have all values
      }
    })

    // Calculate percentages
    const totalWeeklyHours = weeklyPattern.reduce((sum, d) => sum + d.hours, 0)
    weeklyPattern.forEach((day) => {
      day.percentage = totalWeeklyHours > 0 ? Math.round((day.hours / totalWeeklyHours) * 100) : 0
    })

    // Activity heatmap (last 30 days)
    const heatmapData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      
      const dayAnalytics = analytics.find(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      )
      
      return {
        date: date.toISOString(),
        visits: dayAnalytics ? dayAnalytics.totalVisits : 0,
        level: dayAnalytics
          ? Math.min(Math.floor(dayAnalytics.totalVisits / 10), 4)
          : 0,
      }
    })

    return NextResponse.json({
      overview: {
        totalBookmarks,
        totalVisits,
        engagementScore: Math.round(avgEngagement * 100) / 100,
        activeTime: (totalTimeSpent / 60).toFixed(1),
        bookmarksAdded: bookmarksInPeriod,
      },
      topCategories,
      topPerformers,
      underperformers,
      weeklyPattern,
      heatmapData,
      categoryStats: Object.values(categoryStats),
    })
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
