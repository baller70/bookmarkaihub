import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { upscaleImage } from '@/lib/image-upscaler';

// Extend timeout for AI upscaling (default is 60 seconds)
export const maxDuration = 120; // 120 seconds = 2 minutes

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
        message: 'Logo enhanced successfully! Your high-quality logo is now live.',
        favicon: result.upscaledUrl,
        s3Key: result.s3Key,
      });
    } else {
      console.error(`[ENHANCE-LOGO] Enhancement failed:`, result.error);
      
      // Provide user-friendly error messages
      let userMessage = result.error || 'Enhancement failed';
      
      if (result.error?.includes('timeout')) {
        userMessage = 'The AI enhancement took too long. The AI model might be under heavy load. Please try again in a few minutes.';
      } else if (result.error?.includes('API key')) {
        userMessage = 'AI enhancement service is temporarily unavailable. Please contact support.';
      } else if (result.error?.includes('already good')) {
        userMessage = 'This logo is already high quality and doesn\'t need enhancement!';
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
    
    if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'The AI enhancement took too long. Please try again in a few minutes.';
    } else if (errorMessage.includes('API')) {
      userFriendlyMessage = 'The AI enhancement service is temporarily unavailable. Please try again later.';
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
