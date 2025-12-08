
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Update a media file
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; mediaId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params
    const body = await request.json()

    const media = await prisma.media.update({
      where: { id: mediaId },
      data: body,
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error updating media file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; mediaId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params

    await prisma.media.delete({
      where: { id: mediaId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
