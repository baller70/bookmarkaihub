
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch all scheduled notifications for a bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
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

    const schedules = await prisma.notificationSchedule.findMany({
      where: { bookmarkId },
      orderBy: { reminderDate: "asc" },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching notification schedules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new scheduled notification
export async function POST(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookmarkId } = params
    const body = await request.json()
    const { title, description, reminderDate, reminderTime, frequency, notifyVia } = body

    if (!title || !reminderDate || !reminderTime) {
      return NextResponse.json(
        { error: "Title, date, and time are required" },
        { status: 400 }
      )
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const schedule = await prisma.notificationSchedule.create({
      data: {
        bookmarkId,
        title,
        description,
        reminderDate: new Date(reminderDate),
        reminderTime,
        frequency: frequency || "ONCE",
        notifyVia: notifyVia || ["app"],
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Error creating notification schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
