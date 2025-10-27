
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

    // Calculate totals
    const totalVisits = analytics.reduce((sum: number, day: any) => sum + day.totalVisits, 0)
    const avgEngagement = analytics.length > 0 
      ? Math.round(analytics.reduce((sum: number, day: any) => sum + day.engagementScore, 0) / analytics.length)
      : 0

    return NextResponse.json({
      analytics,
      totals: {
        totalVisits,
        engagementScore: avgEngagement,
        timeSpent: analytics.reduce((sum: number, day: any) => sum + day.timeSpent, 0),
        bookmarksAdded: analytics.reduce((sum: number, day: any) => sum + day.bookmarksAdded, 0),
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
