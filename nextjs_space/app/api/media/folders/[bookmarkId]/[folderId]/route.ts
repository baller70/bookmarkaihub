
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Update a media folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; folderId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { folderId } = params
    const body = await request.json()

    const folder = await prisma.mediaFolder.update({
      where: { id: folderId },
      data: body,
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error updating media folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a media folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string; folderId: string } }
) {
  try {
    const session = await getDevSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { folderId } = params

    await prisma.mediaFolder.delete({
      where: { id: folderId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
