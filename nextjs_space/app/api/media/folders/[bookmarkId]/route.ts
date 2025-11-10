
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch all media folders for a bookmark
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

    const folders = await prisma.mediaFolder.findMany({
      where: { bookmarkId },
      include: {
        _count: {
          select: {
            media: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("Error fetching media folders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new media folder
export async function POST(
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
    const { name, color, parentId } = body

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const folder = await prisma.mediaFolder.create({
      data: {
        bookmarkId,
        name,
        color: color || "#3B82F6",
        parentId,
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error("Error creating media folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
