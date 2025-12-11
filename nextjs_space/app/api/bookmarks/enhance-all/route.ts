import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from '@/lib/db';
import { getFaviconWithMetadata } from '@/lib/favicon-service';

export const maxDuration = 300; // 5 minutes for bulk operations

/**
 * POST /api/bookmarks/enhance-all
 * 
 * Bulk enhance all bookmarks' favicons using our multi-tier fallback system.
 * Processes bookmarks in batches to avoid timeouts.
 * 
 * Query params:
 * - limit: Max number of bookmarks to process (default: 50)
 * - skip: Number of bookmarks to skip (for pagination)
 * - onlyMissing: Only enhance bookmarks without favicons (default: false)
 * - onlyLowQuality: Only enhance bookmarks with low-quality favicons (default: false)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');
    const onlyMissing = searchParams.get('onlyMissing') === 'true';
    const onlyLowQuality = searchParams.get('onlyLowQuality') === 'true';

    console.log(`\n[BULK-ENHANCE] ════════════════════════════════════════`);
    console.log(`[BULK-ENHANCE] Starting bulk enhancement`);
    console.log(`[BULK-ENHANCE] Limit: ${limit}, Skip: ${skip}`);
    console.log(`[BULK-ENHANCE] Only missing: ${onlyMissing}, Only low quality: ${onlyLowQuality}`);
    console.log(`[BULK-ENHANCE] ════════════════════════════════════════\n`);

    // Build query conditions
    const whereConditions: any = {
      userId: session.user.id,
    };

    if (onlyMissing) {
      whereConditions.OR = [
        { favicon: null },
        { favicon: '' },
      ];
    }

    // Get total count first
    const totalCount = await prisma.bookmark.count({
      where: whereConditions,
    });

    // Fetch bookmarks to enhance
    const bookmarks = await prisma.bookmark.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        url: true,
        favicon: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    console.log(`[BULK-ENHANCE] Found ${bookmarks.length} bookmarks to process (${totalCount} total)`);

    const results: Array<{
      id: string;
      title: string;
      success: boolean;
      improved: boolean;
      tier?: number;
      source?: string;
      quality?: string;
      previousFavicon?: string;
      newFavicon?: string;
      error?: string;
    }> = [];

    let improved = 0;
    let unchanged = 0;
    let failed = 0;

    // Process bookmarks
    for (const bookmark of bookmarks) {
      try {
        console.log(`\n[BULK-ENHANCE] Processing: ${bookmark.title}`);

        // Filter low quality if requested
        if (onlyLowQuality && bookmark.favicon) {
          // Check if current favicon is from a "low quality" source
          const isLowQuality = 
            bookmark.favicon.includes('google.com/s2/favicons') ||
            bookmark.favicon.includes('duckduckgo.com') ||
            bookmark.favicon.includes('favicon.ico') ||
            bookmark.favicon.includes('ui-avatars.com');

          if (!isLowQuality) {
            console.log(`[BULK-ENHANCE] Skipping - already has good favicon`);
            results.push({
              id: bookmark.id,
              title: bookmark.title,
              success: true,
              improved: false,
            });
            unchanged++;
            continue;
          }
        }

        const result = await getFaviconWithMetadata(bookmark.url);
        const isImproved = result.url !== bookmark.favicon;

        if (isImproved || !bookmark.favicon) {
          await prisma.bookmark.update({
            where: { id: bookmark.id },
            data: { favicon: result.url },
          });

          results.push({
            id: bookmark.id,
            title: bookmark.title,
            success: true,
            improved: true,
            tier: result.tier,
            source: result.source,
            quality: result.quality,
            previousFavicon: bookmark.favicon || undefined,
            newFavicon: result.url,
          });

          improved++;
          console.log(`[BULK-ENHANCE] ✅ Improved - Tier ${result.tier} (${result.source})`);
        } else {
          results.push({
            id: bookmark.id,
            title: bookmark.title,
            success: true,
            improved: false,
            tier: result.tier,
            source: result.source,
            quality: result.quality,
          });

          unchanged++;
          console.log(`[BULK-ENHANCE] ℹ️ Unchanged - already optimal`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[BULK-ENHANCE] ❌ Error for ${bookmark.title}:`, errorMessage);

        results.push({
          id: bookmark.id,
          title: bookmark.title,
          success: false,
          improved: false,
          error: errorMessage,
        });

        failed++;
      }
    }

    console.log(`\n[BULK-ENHANCE] ════════════════════════════════════════`);
    console.log(`[BULK-ENHANCE] Complete!`);
    console.log(`[BULK-ENHANCE] Improved: ${improved}, Unchanged: ${unchanged}, Failed: ${failed}`);
    console.log(`[BULK-ENHANCE] ════════════════════════════════════════\n`);

    return NextResponse.json({
      success: true,
      message: `Enhanced ${improved} of ${bookmarks.length} bookmarks`,
      summary: {
        total: totalCount,
        processed: bookmarks.length,
        improved,
        unchanged,
        failed,
        hasMore: skip + limit < totalCount,
        nextSkip: skip + limit,
      },
      results,
    });

  } catch (error) {
    console.error('[BULK-ENHANCE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance bookmarks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookmarks/enhance-all
 * 
 * Get statistics about bookmarks that could be enhanced
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count total bookmarks
    const total = await prisma.bookmark.count({
      where: { userId: session.user.id },
    });

    // Count bookmarks without favicons
    const withoutFavicon = await prisma.bookmark.count({
      where: {
        userId: session.user.id,
        OR: [
          { favicon: null },
          { favicon: '' },
        ],
      },
    });

    // Count bookmarks with potentially low-quality favicons
    const bookmarksWithFavicons = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        favicon: { not: '' },
      },
      select: { favicon: true },
    });

    const lowQualityCount = bookmarksWithFavicons.filter(b => {
      const f = b.favicon || '';
      return f.includes('google.com/s2/favicons') ||
             f.includes('duckduckgo.com') ||
             f.includes('favicon.ico') ||
             f.includes('ui-avatars.com');
    }).length;

    const highQualityCount = bookmarksWithFavicons.length - lowQualityCount;

    return NextResponse.json({
      total,
      withFavicon: total - withoutFavicon,
      withoutFavicon,
      lowQuality: lowQualityCount,
      highQuality: highQualityCount,
      needsEnhancement: withoutFavicon + lowQualityCount,
    });

  } catch (error) {
    console.error('[BULK-ENHANCE] Stats error:', error);
    return NextResponse.json({ error: 'Failed to get statistics' }, { status: 500 });
  }
}




