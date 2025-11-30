import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { upscaleImage } from '@/lib/image-upscaler';

/**
 * POST /api/bookmarks/[id]/enhance-logo
 * Manually trigger AI upscaling for a bookmark's logo
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
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

    // Get the current favicon
    const currentFavicon = bookmark.favicon || '';
    const domain = new URL(bookmark.url).hostname.replace(/^www\./, '');

    console.log(`[ENHANCE-LOGO] Starting enhancement for ${bookmark.title}`);

    // Upscale the image
    const result = await upscaleImage(currentFavicon, domain);

    if (result.success && result.upscaledUrl) {
      // Update the bookmark with the enhanced logo
      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: {
          favicon: result.upscaledUrl,
        },
      });

      console.log(`[ENHANCE-LOGO] Successfully enhanced logo for ${bookmark.title}`);

      return NextResponse.json({
        success: true,
        message: 'Logo enhanced successfully',
        favicon: result.upscaledUrl,
        s3Key: result.s3Key,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Enhancement failed',
        favicon: currentFavicon,
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[ENHANCE-LOGO] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance logo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
