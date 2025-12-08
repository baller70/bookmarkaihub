
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; commentId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { commentId } = params
    const body = await request.json()
    const { content, mentions } = body

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

    const reply = await prisma.commentReply.create({
      data: {
        commentId,
        userId: user.id,
        content,
      },
      include: {
        mentions: true,
      },
    })

    // Create mentions if provided
    if (mentions && mentions.length > 0) {
      await Promise.all(
        mentions.map((mentionedUserId: string) =>
          prisma.commentMention.create({
            data: {
              replyId: reply.id,
              mentionedUserId,
            },
          })
        )
      )
    }

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
