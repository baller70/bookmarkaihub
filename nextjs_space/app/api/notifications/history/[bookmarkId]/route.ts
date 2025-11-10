
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch notification history for a bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookmarkId } = params

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const history = await prisma.notificationHistory.findMany({
      where: {
        schedule: { bookmarkId },
      },
      include: {
        schedule: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 100, // Limit to last 100 notifications
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching notification history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
