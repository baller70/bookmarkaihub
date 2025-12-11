
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { prisma } from "@/lib/db"
import { getActiveCompanyId } from "@/lib/company"

export async function GET() {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get active company for filtering
    const activeCompanyId = await getActiveCompanyId(session.user.id)

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
        // Filter by company if one is active
        ...(activeCompanyId && { companyId: activeCompanyId }),
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
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Get active company
    const activeCompanyId = await getActiveCompanyId(session.user.id)

    // Check if tag with this name already exists for this user AND company
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        ...(activeCompanyId && { companyId: activeCompanyId }),
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
        companyId: activeCompanyId,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
