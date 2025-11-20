
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getActiveCompanyId } from "@/lib/company"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get active company
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
        ...(activeCompanyId && { companyId: activeCompanyId }),
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      _count: {
        bookmarks: category._count.bookmarks,
      },
      bookmarkCount: category._count.bookmarks,
      folderId: category.folderId,
      createdBy: category.user,
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, color, icon } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get active company
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    // Check if category with this name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: `A category named "${name}" already exists. Please choose a different name.` },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description || "",
        color: color || "#3B82F6",
        icon: icon || "folder",
        userId: session.user.id,
        companyId: activeCompanyId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
