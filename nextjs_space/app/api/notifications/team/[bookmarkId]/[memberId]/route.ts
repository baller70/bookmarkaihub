
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Update a team member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; memberId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId } = params
    const body = await request.json()

    const teamMember = await prisma.notificationTeam.update({
      where: { id: memberId },
      data: body,
    })

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; memberId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId } = params

    await prisma.notificationTeam.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
