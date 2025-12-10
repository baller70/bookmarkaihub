
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    // Support both seconds (new) and minutes (legacy) for backwards compatibility
    const timeSpentSeconds = body.timeSpentSeconds ?? (body.timeSpentMinutes ? body.timeSpentMinutes * 60 : 0)

    if (typeof timeSpentSeconds !== 'number' || timeSpentSeconds < 0) {
      return NextResponse.json({ error: "Invalid time value" }, { status: 400 })
    }

    // Verify the bookmark belongs to the user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    // Round to nearest second (minimum 1 second if any time passed)
    const roundedSeconds = Math.max(Math.round(timeSpentSeconds), timeSpentSeconds > 0 ? 1 : 0)

    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: {
        timeSpent: {
          increment: roundedSeconds,
        },
      },
    })

    return NextResponse.json({
      success: true,
      timeSpent: bookmark.timeSpent, // Now in seconds
    })
  } catch (error) {
    console.error("Error tracking time:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
