
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if tag with this name already exists for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: `A tag named "${name}" already exists. Please choose a different name.` },
        { status: 409 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || "#10B981",
        userId: session.user.id,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
