
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch team members for a bookmark
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

    const team = await prisma.notificationTeam.findMany({
      where: { bookmarkId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching notification team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add a team member
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
    const { memberEmail, memberName, role, canEdit, canDelete } = body

    if (!memberEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const teamMember = await prisma.notificationTeam.create({
      data: {
        bookmarkId,
        memberEmail,
        memberName,
        role: role || "VIEWER",
        canEdit: canEdit || false,
        canDelete: canDelete || false,
      },
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
