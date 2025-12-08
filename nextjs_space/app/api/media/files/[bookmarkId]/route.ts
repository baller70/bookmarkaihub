
import { NextRequest, NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch all media files for a bookmark
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
    const fileType = searchParams.get("fileType")
    const folderId = searchParams.get("folderId")

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user: { email: session.user.email } },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    const whereClause: any = { bookmarkId }
    if (fileType) {
      whereClause.fileType = fileType
    }
    if (folderId) {
      whereClause.folderId = folderId
    } else if (folderId === null) {
      whereClause.folderId = null
    }

    const media = await prisma.media.findMany({
      where: whereClause,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching media files:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Upload a new media file
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
    const {
      fileName,
      originalName,
      fileType,
      fileSize,
      mimeType,
      cloudStoragePath,
      thumbnailPath,
      width,
      height,
      duration,
      tags,
      description,
      folderId,
    } = body

    if (!fileName || !fileType || !cloudStoragePath) {
      return NextResponse.json(
        { error: "Required fields missing" },
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

    const media = await prisma.media.create({
      data: {
        bookmarkId,
        fileName,
        originalName: originalName || fileName,
        fileType,
        fileSize: fileSize || 0,
        mimeType,
        cloudStoragePath,
        thumbnailPath,
        width,
        height,
        duration,
        tags: tags || [],
        description,
        folderId,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error("Error uploading media file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
