
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Update a scheduled notification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduleId } = params
    const body = await request.json()

    const schedule = await prisma.notificationSchedule.update({
      where: { id: scheduleId },
      data: {
        ...body,
        reminderDate: body.reminderDate ? new Date(body.reminderDate) : undefined,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error updating notification schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a scheduled notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduleId } = params

    await prisma.notificationSchedule.delete({
      where: { id: scheduleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
