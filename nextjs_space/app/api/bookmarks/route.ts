
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { prisma } from "@/lib/db"
import { getFaviconUrl } from "@/lib/favicon-service"
import { getActiveCompanyId } from "@/lib/company"
import { sendOpenAIRequest } from "@/lib/openai-client"

export async function GET(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      console.error('❌ No session found in GET /api/bookmarks');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('✅ Session valid for user:', session.user.email || session.user.id);

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const priority = searchParams.get("priority")

    // Get active company
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    // DEFENSIVE: If no company found, log warning but DON'T filter by company
    if (!activeCompanyId) {
      console.warn('⚠️ No active company found for user:', session.user.email, '- Showing ALL bookmarks');
    } else {
      console.log('✅ Active company found:', activeCompanyId, 'for user:', session.user.email);
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        // CRITICAL FIX: Only filter by company if we have a valid activeCompanyId
        // This prevents showing zero bookmarks if company logic fails
        ...(activeCompanyId ? { companyId: activeCompanyId } : {}),
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

    console.log(`📊 Returning ${bookmarksWithUsage.length} bookmarks to frontend for user:`, session.user.email);

    return NextResponse.json(bookmarksWithUsage)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// AI-powered description and tags generation using Minimax
async function generateMetadataWithAI(title: string, url: string) {
  try {
    const prompt = `Given this bookmark:
Title: ${title}
URL: ${url}

Generate:
1. A concise 1-2 sentence description (max 150 characters)
2. 3-5 relevant tags (comma-separated, lowercase, single words or short phrases)

Format your response EXACTLY like this:
DESCRIPTION: [your description here]
TAGS: tag1, tag2, tag3, tag4, tag5`;

    const content = await sendOpenAIRequest(prompt, {
      maxTokens: 200,
      temperature: 0.7,
    });

    // Parse the response
    const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?=\nTAGS:|$)/s);
    const tagsMatch = content.match(/TAGS:\s*(.+?)$/s);

    const description = descMatch?.[1]?.trim() || '';
    const tagsStr = tagsMatch?.[1]?.trim() || '';
    const tags = tagsStr.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);

    return { description, tags };
  } catch (error) {
    console.error('Error generating metadata with Minimax AI:', error);
    return { description: '', tags: [] };
  }
}

export async function POST(request: Request) {
  try {
    const session = await getDevSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, url, description, favicon, priority, categoryIds, tagIds, companyIds } = await request.json()

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
    }

    // Get active company for default assignment
    const activeCompanyId = await getActiveCompanyId(session.user.id);

    // ⚠️ CHECK FOR DUPLICATE URLs - Prevent duplicates in the same company
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        url: url,
        ...(activeCompanyId && { companyId: activeCompanyId }),
      },
      select: {
        id: true,
        title: true,
        url: true,
        createdAt: true,
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { 
          error: "Duplicate bookmark",
          message: `This URL already exists in your bookmarks: "${existingBookmark.title}"`,
          duplicate: true,
          existingBookmark: existingBookmark,
        }, 
        { status: 409 } // 409 Conflict
      );
    }

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

    // ✨ ALWAYS AUTO-GENERATE AI DESCRIPTIONS AND TAGS ✨
    console.log('🤖 Auto-generating AI metadata for:', title);
    const aiMetadata = await generateMetadataWithAI(title, url);
    
    // Always use AI-generated description (user can edit later if needed)
    const finalDescription = aiMetadata.description || description || '';
    console.log('✅ AI Description:', finalDescription);

    // Always create/find AI-generated tags (user can add more later)
    let finalTagIds = tagIds || [];
    if (aiMetadata.tags.length > 0) {
      const createdTags = await Promise.all(
        aiMetadata.tags.map(async (tagName: string) => {
          // Check if tag exists
          let tag = await prisma.tag.findFirst({
            where: { 
              name: tagName,
              userId: session.user.id 
            }
          });

          // Create if doesn't exist
          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
                userId: session.user.id,
              },
            });
          }

          return tag.id;
        })
      );
      // Merge AI tags with any manually provided tags
      finalTagIds = [...new Set([...createdTags, ...(tagIds || [])])];
      console.log('✅ AI Tags:', aiMetadata.tags.join(', '));
    }

    // Determine which company to assign (use active company if not specified)
    const targetCompanyId = companyIds && companyIds.length > 0 ? companyIds[0] : activeCompanyId;

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        url,
        description: finalDescription,
        favicon: finalFavicon || "",
        priority: priority || "MEDIUM",
        userId: session.user.id,
        companyId: targetCompanyId,
        categories: categoryIds?.length > 0 ? {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        } : undefined,
        tags: finalTagIds?.length > 0 ? {
          create: finalTagIds.map((tagId: string) => ({
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
