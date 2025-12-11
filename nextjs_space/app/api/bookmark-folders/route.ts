import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getDevSession } from "@/lib/dev-auth"

// GET /api/bookmark-folders?categoryId=...
export async function GET(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 })
    }

    const folders = await prisma.bookmarkFolder.findMany({
      where: {
        categoryId,
        userId: session.user.id,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("Error fetching bookmark folders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/bookmark-folders
// Body: { name, categoryId, color? }
export async function POST(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, categoryId, color } = body
    if (!name || !categoryId) {
      return NextResponse.json({ error: "name and categoryId are required", received: { name, categoryId } }, { status: 400 })
    }

    // Verify category belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found or not yours" }, { status: 404 })
    }

    const folder = await prisma.bookmarkFolder.create({
      data: {
        name,
        categoryId,
        color: color || "#3B82F6",
        userId: session.user.id,
        companyId: category.companyId,
      },
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error creating bookmark folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/bookmark-folders
// Body: { id, name?, color? }
export async function PATCH(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, color } = body
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    // Verify folder belongs to the user
    const existingFolder = await prisma.bookmarkFolder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found or not yours" }, { status: 404 })
    }

    const folder = await prisma.bookmarkFolder.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error updating bookmark folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/bookmark-folders
// Body: { id }
export async function DELETE(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    // Verify folder belongs to the user
    const existingFolder = await prisma.bookmarkFolder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found or not yours" }, { status: 404 })
    }

    // Remove folder assignment from bookmarks first
    await prisma.bookmark.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    })

    // Delete the folder
    await prisma.bookmarkFolder.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bookmark folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

