
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getFaviconUrl } from "@/lib/favicon-service"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const priority = searchParams.get("priority")

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { url: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(category && {
          categories: {
            some: {
              category: {
                id: category,
              },
            },
          },
        }),
        ...(tag && {
          tags: {
            some: {
              tag: {
                id: tag,
              },
            },
          },
        }),
        ...(priority && { priority: priority as any }),
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
        _count: {
          select: {
            tasks: true,
            notes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate total visits across all user's bookmarks
    const totalVisitsAcrossAll = bookmarks.reduce((sum, bookmark) => {
      return sum + (bookmark.totalVisits || 0)
    }, 0)

    // Calculate usage percentage for each bookmark
    const bookmarksWithUsage = bookmarks.map(bookmark => {
      const usagePercentage = totalVisitsAcrossAll > 0 
        ? (bookmark.totalVisits / totalVisitsAcrossAll) * 100 
        : 0
      
      return {
        ...bookmark,
        usagePercentage
      }
    })

    return NextResponse.json(bookmarksWithUsage)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, url, description, favicon, priority, categoryIds, tagIds } = await request.json()

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
    }

    // Auto-fetch high-quality favicon if not provided
    let finalFavicon = favicon;
    if (!finalFavicon) {
      try {
        finalFavicon = await getFaviconUrl(url);
      } catch (error) {
        console.error('Error fetching favicon:', error);
        finalFavicon = '';
      }
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        url,
        description: description || "",
        favicon: finalFavicon || "",
        priority: priority || "MEDIUM",
        userId: session.user.id,
        categories: categoryIds?.length > 0 ? {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        } : undefined,
        tags: tagIds?.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        } : undefined,
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

    // Log the creation
    await prisma.bookmarkHistory.create({
      data: {
        action: "CREATED",
        details: "Bookmark created",
        bookmarkId: bookmark.id,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Error creating bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
