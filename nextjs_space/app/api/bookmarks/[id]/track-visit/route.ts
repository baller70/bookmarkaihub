
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Increment total visits and update last visited
    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: {
        totalVisits: {
          increment: 1,
        },
        lastVisited: new Date(),
      },
    })

    // Log the view
    await prisma.bookmarkHistory.create({
      data: {
        action: "VIEWED",
        details: "Bookmark viewed",
        bookmarkId: params.id,
      },
    })

    return NextResponse.json({ 
      success: true,
      totalVisits: bookmark.totalVisits,
    })
  } catch (error) {
    console.error("Error tracking visit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
