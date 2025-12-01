import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { upscaleImage } from '@/lib/image-upscaler';

// No extended timeout needed - Sharp processes locally in seconds
export const maxDuration = 30; // 30 seconds is more than enough for local processing

/**
 * POST /api/bookmarks/[id]/enhance-logo
 * Manually trigger high-quality upscaling for a bookmark's logo
 * Uses Sharp with Lanczos3 algorithm (FREE, local processing)
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
        message: 'Logo enhanced successfully! Your high-quality logo is now live.',
        favicon: result.upscaledUrl,
        s3Key: result.s3Key,
      });
    } else {
      console.error(`[ENHANCE-LOGO] Enhancement failed:`, result.error);
      
      // Provide user-friendly error messages
      let userMessage = result.error || 'Enhancement failed';
      
      if (result.error?.includes('already good') || result.error?.includes('meets quality')) {
        userMessage = 'This logo is already high quality and doesn\'t need enhancement!';
      } else if (result.error?.includes('download')) {
        userMessage = 'Failed to download the original logo. Please try again.';
      }
      
      return NextResponse.json({
        success: false,
        message: userMessage,
        favicon: currentFavicon,
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[ENHANCE-LOGO] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userFriendlyMessage = 'Failed to enhance logo. Please try again.';
    
    if (errorMessage.includes('download') || errorMessage.includes('fetch')) {
      userFriendlyMessage = 'Failed to download the original logo. Please check the URL and try again.';
    } else if (errorMessage.includes('upload') || errorMessage.includes('S3')) {
      userFriendlyMessage = 'Failed to save the enhanced logo. Please try again.';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to enhance logo', 
        message: userFriendlyMessage,
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
