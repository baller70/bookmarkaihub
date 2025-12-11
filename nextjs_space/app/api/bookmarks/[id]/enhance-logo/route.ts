import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from '@/lib/db';
import { getNextFavicon, getAllAvailableFavicons } from '@/lib/favicon-service';

export const maxDuration = 30;

/**
 * POST /api/bookmarks/[id]/enhance-logo
 * 
 * Fetches the NEXT available high-quality favicon/logo.
 * Each press cycles through available sources:
 * - First press: Gets the best available logo
 * - Second press: Gets the next alternative
 * - Continues cycling through all available options
 * - Wraps back to the first option after the last
 * 
 * This allows users to keep pressing until they find a logo they like.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarkId = params.id;

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: session.user.id,
      },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const currentFavicon = bookmark.favicon || '';
    const domain = new URL(bookmark.url).hostname.replace(/^www\./, '');

    console.log(`\n[ENHANCE-LOGO] ════════════════════════════════════════`);
    console.log(`[ENHANCE-LOGO] Cycling logo for: ${bookmark.title}`);
    console.log(`[ENHANCE-LOGO] URL: ${bookmark.url}`);
    console.log(`[ENHANCE-LOGO] Current favicon: ${currentFavicon || '(none)'}`);
    console.log(`[ENHANCE-LOGO] ════════════════════════════════════════\n`);

    // Get the NEXT available favicon (cycles through options)
    const result = await getNextFavicon(bookmark.url, currentFavicon || null);

    console.log(`\n[ENHANCE-LOGO] Result:`);
    console.log(`[ENHANCE-LOGO]   Option: ${result.index + 1} of ${result.totalOptions}`);
    console.log(`[ENHANCE-LOGO]   Tier: ${result.tier}`);
    console.log(`[ENHANCE-LOGO]   Source: ${result.source}`);
    console.log(`[ENHANCE-LOGO]   Quality: ${result.quality}`);
    console.log(`[ENHANCE-LOGO]   New favicon: ${result.url}`);

    // Update the bookmark with the new favicon
    await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        favicon: result.url,
      },
    });

    // Generate user-friendly message
    const sourceNames: Record<string, string> = {
      'curated_override': 'Official brand logo',
      'clearbit': 'Clearbit HD logo',
      'logo.dev': 'Logo.dev HD logo',
      'brandfetch': 'Brandfetch logo',
      'html_parse': 'Website icon',
      'unavatar': 'Unavatar logo',
      'duckduckgo': 'DuckDuckGo icon',
      'favicon.ico': 'Standard favicon',
      'google': 'Google favicon',
      'similar_themed': 'Similar themed icon',
      'similar_robot': 'Tech-style icon',
      'similar_geometric': 'Geometric icon',
      'similar_character': 'Character icon',
      'similar_friendly': 'Friendly icon',
      'similar_abstract': 'Abstract icon',
      'letter_icon': 'Letter icon',
      'generated': 'Generated icon',
    };

    const sourceName = sourceNames[result.source] || result.source;
    const cycleInfo = result.totalOptions > 1 
      ? ` (${result.index + 1}/${result.totalOptions})` 
      : '';

    console.log(`[ENHANCE-LOGO] ✅ Updated to: ${sourceName}${cycleInfo}`);

    return NextResponse.json({
      success: true,
      message: `${sourceName}${cycleInfo}`,
      favicon: result.url,
      previousFavicon: currentFavicon,
      metadata: {
        tier: result.tier,
        source: result.source,
        quality: result.quality,
        index: result.index,
        totalOptions: result.totalOptions,
        canCycle: result.totalOptions > 1,
      },
    });

  } catch (error) {
    console.error('[ENHANCE-LOGO] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to enhance logo', 
        message: 'Could not fetch a logo. Please try again.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookmarks/[id]/enhance-logo
 * 
 * Preview ALL available logo options without updating
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDevSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarkId = params.id;

    // Verify bookmark ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        url: true,
        favicon: true,
      },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Get all available options
    const allOptions = await getAllAvailableFavicons(bookmark.url);

    // Find which one is currently active
    const currentIndex = bookmark.favicon 
      ? allOptions.findIndex(opt => opt.url === bookmark.favicon)
      : -1;

    return NextResponse.json({
      current: {
        favicon: bookmark.favicon || null,
        index: currentIndex,
      },
      options: allOptions.map((opt, idx) => ({
        ...opt,
        isCurrent: idx === currentIndex,
      })),
      totalOptions: allOptions.length,
    });

  } catch (error) {
    console.error('[ENHANCE-LOGO] Preview error:', error);
    return NextResponse.json({ error: 'Failed to get logo options' }, { status: 500 });
  }
}
