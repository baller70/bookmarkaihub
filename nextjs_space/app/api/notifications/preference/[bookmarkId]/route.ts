
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch notification preferences for a bookmark
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

    let preference = await prisma.notificationPreference.findUnique({
      where: { bookmarkId },
    })

    // Create default preferences if none exist
    if (!preference) {
      preference = await prisma.notificationPreference.create({
        data: { bookmarkId },
      })
    }

    return NextResponse.json(preference)
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update notification preferences
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookmarkId } = params
    const body = await request.json()

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const preference = await prisma.notificationPreference.upsert({
      where: { bookmarkId },
      update: body,
      create: {
        bookmarkId,
        ...body,
      },
    })

    return NextResponse.json(preference)
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
