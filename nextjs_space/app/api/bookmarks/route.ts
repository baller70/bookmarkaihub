
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getFaviconUrl } from "@/lib/favicon-service"
import { getActiveCompanyId } from "@/lib/company"

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

    // Get active company
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        ...(activeCompanyId && { companyId: activeCompanyId }),
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
    const totalVisitsAcrossAll = bookmarks.reduce((sum: number, bookmark: any) => {
      return sum + (bookmark.totalVisits || 0)
    }, 0)

    // Calculate usage percentage for each bookmark and map field names
    const bookmarksWithUsage = bookmarks.map((bookmark: any) => {
      const usagePercentage = totalVisitsAcrossAll > 0 
        ? (bookmark.totalVisits / totalVisitsAcrossAll) * 100 
        : 0
      
      // Flatten the category data structure for easier frontend access
      const primaryCategory = bookmark.categories?.[0]?.category || null
      
      return {
        ...bookmark,
        category: primaryCategory, // Flatten: categories[0].category -> category
        visitCount: bookmark.totalVisits, // Map totalVisits to visitCount for frontend consistency
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

    const { title, url, description, favicon, priority, categoryIds, tagIds, companyIds } = await request.json()

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
    }

    // Get active company for default assignment
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    // Auto-fetch high-quality favicon (always prioritize high-quality PNG sources)
    // Even if favicon is provided from metadata, we try to get a better quality one
    let finalFavicon = '';
    try {
      // Always try to get high-quality favicon from our service
      const highQualityFavicon = await getFaviconUrl(url);
      if (highQualityFavicon) {
        finalFavicon = highQualityFavicon;
      } else {
        // Fallback to provided favicon if our service fails
        finalFavicon = favicon || '';
      }
    } catch (error) {
      console.error('Error fetching favicon:', error);
      finalFavicon = favicon || '';
    }

    // Determine which company to assign (use active company if not specified)
    const targetCompanyId = companyIds && companyIds.length > 0 ? companyIds[0] : activeCompanyId;

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        url,
        description: description || "",
        favicon: finalFavicon || "",
        priority: priority || "MEDIUM",
        userId: session.user.id,
        companyId: targetCompanyId,
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
