
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        tasks: true,
        notes: true,
        history: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Error fetching bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, url, description, favicon, priority, categoryIds, tagIds } = await request.json()

    // First, verify the bookmark belongs to the user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    // Update bookmark
    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: {
        title: title || existingBookmark.title,
        url: url || existingBookmark.url,
        description: description !== undefined ? description : existingBookmark.description,
        favicon: favicon !== undefined ? favicon : existingBookmark.favicon,
        priority: priority || existingBookmark.priority,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Update categories if provided
    if (categoryIds !== undefined) {
      await prisma.bookmarkCategory.deleteMany({
        where: { bookmarkId: params.id },
      })
      
      if (categoryIds.length > 0) {
        await prisma.bookmarkCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            bookmarkId: params.id,
            categoryId,
          })),
        })
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.bookmarkTag.deleteMany({
        where: { bookmarkId: params.id },
      })
      
      if (tagIds.length > 0) {
        await prisma.bookmarkTag.createMany({
          data: tagIds.map((tagId: string) => ({
            bookmarkId: params.id,
            tagId,
          })),
        })
      }
    }

    // Log the update
    await prisma.bookmarkHistory.create({
      data: {
        action: "UPDATED",
        details: "Bookmark updated",
        bookmarkId: params.id,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Error updating bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Verify the bookmark belongs to the user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    // Update only the fields provided
    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: body,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Log the update
    await prisma.bookmarkHistory.create({
      data: {
        action: "UPDATED",
        details: `Bookmark updated: ${Object.keys(body).join(", ")}`,
        bookmarkId: params.id,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Error patching bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the bookmark belongs to the user
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    // Delete bookmark (cascade will handle related records)
    await prisma.bookmark.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Bookmark deleted successfully" })
  } catch (error) {
    console.error("Error deleting bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
