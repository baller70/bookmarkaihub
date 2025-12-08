import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from "@/lib/dev-auth";
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

    // Get the current favicon
    let currentFavicon = bookmark.favicon || '';
    const domain = new URL(bookmark.url).hostname.replace(/^www\./, '');

    console.log(`[ENHANCE-LOGO] Starting enhancement for ${bookmark.title}`);
    console.log(`[ENHANCE-LOGO] Current favicon: ${currentFavicon}`);

    // If current favicon is empty or inaccessible, fetch a fresh one first
    if (!currentFavicon) {
      console.log(`[ENHANCE-LOGO] No favicon found, fetching fresh one...`);
      const { getFaviconUrl } = await import('@/lib/favicon-service');
      currentFavicon = await getFaviconUrl(bookmark.url);
      console.log(`[ENHANCE-LOGO] Fresh favicon obtained: ${currentFavicon}`);
    } else {
      // Check if current favicon is accessible
      try {
        const checkResponse = await fetch(currentFavicon, { method: 'HEAD' });
        if (!checkResponse.ok) {
          console.log(`[ENHANCE-LOGO] Current favicon inaccessible (${checkResponse.status}), fetching fresh one...`);
          const { getFaviconUrl } = await import('@/lib/favicon-service');
          currentFavicon = await getFaviconUrl(bookmark.url);
          console.log(`[ENHANCE-LOGO] Fresh favicon obtained: ${currentFavicon}`);
        }
      } catch (error) {
        console.log(`[ENHANCE-LOGO] Error checking favicon accessibility, fetching fresh one...`);
        const { getFaviconUrl } = await import('@/lib/favicon-service');
        currentFavicon = await getFaviconUrl(bookmark.url);
        console.log(`[ENHANCE-LOGO] Fresh favicon obtained: ${currentFavicon}`);
      }
    }

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
      } else if (result.error?.includes('download') || result.error?.includes('fetch')) {
        userMessage = 'Failed to download the logo. The file might be corrupted or inaccessible. Try again to fetch a fresh copy.';
      } else if (result.error?.includes('403')) {
        userMessage = 'The current logo file is not accessible. Fetching a fresh copy...';
      }
      
      return NextResponse.json({
        success: false,
        message: userMessage,
        error: result.error,
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
