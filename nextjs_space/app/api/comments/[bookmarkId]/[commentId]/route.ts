
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { commentId } = params
    const body = await request.json()

    const comment = await prisma.bookmarkComment.update({
      where: { id: commentId },
      data: body,
      include: {
        replies: true,
        mentions: true,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { commentId } = params

    await prisma.bookmarkComment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
