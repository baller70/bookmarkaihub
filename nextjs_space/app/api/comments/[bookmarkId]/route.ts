
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch all comments for a bookmark
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
    const { searchParams } = new URL(request.url)
    const showResolved = searchParams.get("showResolved") === "true"

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const whereClause: any = { bookmarkId }
    if (!showResolved) {
      whereClause.isResolved = false
    }

    const comments = await prisma.bookmarkComment.findMany({
      where: whereClause,
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
        mentions: true,
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new comment
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
    const { content, tags, mentions } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: user.id },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const comment = await prisma.bookmarkComment.create({
      data: {
        bookmarkId,
        userId: user.id,
        content,
        tags: tags || [],
      },
      include: {
        replies: true,
        mentions: true,
      },
    })

    // Create mentions if provided
    if (mentions && mentions.length > 0) {
      await Promise.all(
        mentions.map((mentionedUserId: string) =>
          prisma.commentMention.create({
            data: {
              commentId: comment.id,
              mentionedUserId,
            },
          })
        )
      )
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
