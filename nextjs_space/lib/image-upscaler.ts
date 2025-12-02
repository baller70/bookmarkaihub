import sharp from 'sharp';
import { uploadFile } from './s3';
import { getBucketConfig } from './aws-config';

export interface UpscaleResult {
  success: boolean;
  upscaledUrl?: string;
  s3Key?: string;
  error?: string;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
  wasUpscaled?: boolean;
}

/**
 * Get ACTUAL pixel dimensions of an image AND the buffer
 * CRITICAL: This checks real resolution, not file size
 */
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number; buffer: Buffer } | null> {
  try {
    console.log(`  🔍 Fetching image to check dimensions...`);
    const response = await fetch(imageUrl);
    
    // Check for 403 Forbidden (S3 permission issues) or other HTTP errors
    if (!response.ok) {
      console.error(`  ❌ HTTP Error ${response.status}: ${response.statusText}`);
      console.error(`  📍 URL: ${imageUrl}`);
      if (response.status === 403) {
        console.error(`  🔒 File is not publicly accessible (403 Forbidden)`);
        console.error(`  💡 Tip: This might be an old S3 upload without public ACL`);
      }
      return null;
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    console.log(`  📦 Downloaded: ${(buffer.length / 1024).toFixed(1)}KB`);
    
    const metadata = await sharp(buffer).metadata();
    
    if (metadata.width && metadata.height) {
      console.log(`  📐 Dimensions: ${metadata.width}x${metadata.height}px`);
      return { width: metadata.width, height: metadata.height, buffer };
    }
    
    console.log(`  ⚠️  Could not extract dimensions`);
    return null;
  } catch (error) {
    console.error('  ❌ Error getting image dimensions:', error);
    return null;
  }
}

/**
 * Check if an image needs upscaling based on ACTUAL pixel dimensions
 * REQUIREMENT: Images MUST be at least 600px on the smallest side
 */
async function needsUpscaling(imageUrl: string): Promise<{ needed: boolean; dimensions: { width: number; height: number } | null; imageBuffer: Buffer | null }> {
  try {
    const result = await getImageDimensions(imageUrl);
    
    if (!result) {
      console.log(`  ⚠️  Cannot determine dimensions - will attempt upscale`);
      return { needed: true, dimensions: null, imageBuffer: null };
    }
    
    const { width, height, buffer } = result;
    const dimensions = { width, height };
    const minDimension = Math.min(width, height);
    const needed = minDimension < 600;
    
    if (needed) {
      console.log(`  ❌ FAILS 600px requirement: ${width}x${height}px (min: ${minDimension}px)`);
    } else {
      console.log(`  ✅ MEETS 600px requirement: ${width}x${height}px (min: ${minDimension}px)`);
    }
    
    return { needed, dimensions, imageBuffer: buffer };
  } catch (error) {
    console.error('  ❌ Error checking dimensions:', error);
    return { needed: true, dimensions: null, imageBuffer: null }; // Default to upscaling if we can't check
  }
}

/**
 * Upscale an image using Sharp (FREE, no external APIs)
 * GUARANTEE: Output will be at least 600px minimum
 * Uses Lanczos3 resampling for best quality
 */
export async function upscaleImage(imageUrl: string, domain: string): Promise<UpscaleResult> {
  try {
    console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║  HIGH-QUALITY LOGO UPSCALER - 600PX MINIMUM GUARANTEE    ║`);
    console.log(`║  Method: Sharp with Lanczos3 (FREE, LOCAL PROCESSING)   ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝`);
    console.log(`\n🔎 Analyzing: ${domain}`);
    console.log(`📍 Source: ${imageUrl}\n`);
    
    // Check dimensions and upscaling requirement
    const check = await needsUpscaling(imageUrl);
    
    if (!check.needed) {
      console.log(`\n✅ ACCEPTED: Logo meets 600px requirement`);
      return { 
        success: true, 
        upscaledUrl: imageUrl,
        originalDimensions: check.dimensions || undefined,
        finalDimensions: check.dimensions || undefined,
        wasUpscaled: false
      };
    }
    
    // Verify we have the image buffer
    if (!check.imageBuffer) {
      console.error(`\n❌ ERROR: Could not fetch image for upscaling`);
      return {
        success: false,
        error: 'Failed to download image for upscaling',
        originalDimensions: check.dimensions || undefined
      };
    }
    
    console.log(`\n🚀 UPSCALING REQUIRED - Starting high-quality enhancement...`);
    console.log(`⏱️  Estimated time: 2-5 seconds (local processing, 100% FREE!)`);
    
    // Calculate target dimensions to reach 600px minimum
    let targetWidth = 600;
    let targetHeight = 600;
    
    if (check.dimensions) {
      const { width, height } = check.dimensions;
      const minDim = Math.min(width, height);
      const scaleFactor = Math.ceil(600 / minDim);
      
      targetWidth = width * scaleFactor;
      targetHeight = height * scaleFactor;
      
      console.log(`  📊 Original: ${width}x${height}px`);
      console.log(`  🎯 Target: ${targetWidth}x${targetHeight}px`);
      console.log(`  🔢 Scale factor: ${scaleFactor}x`);
    }
    
    console.log(`  🎨 Processing with Lanczos3 resampling (highest quality)...`);
    
    // Upscale using Sharp with Lanczos3 kernel (best quality for enlarging)
    const upscaledBuffer = await sharp(check.imageBuffer)
      .resize(targetWidth, targetHeight, {
        kernel: 'lanczos3',  // Best quality for upscaling
        fit: 'fill',         // Fill the exact dimensions
        background: { r: 255, g: 255, b: 255, alpha: 0 }  // Transparent background
      })
      .png({
        quality: 100,        // Maximum PNG quality
        compressionLevel: 6, // Balance between size and speed
        adaptiveFiltering: true,
        palette: false       // Use full color depth
      })
      .toBuffer();
    
    console.log(`  📦 Upscaled image size: ${(upscaledBuffer.length / 1024).toFixed(1)}KB`);
    
    // Verify final dimensions
    const finalMeta = await sharp(upscaledBuffer).metadata();
    const finalDimensions = finalMeta.width && finalMeta.height 
      ? { width: finalMeta.width, height: finalMeta.height }
      : undefined;
    
    if (finalDimensions) {
      const finalMin = Math.min(finalDimensions.width, finalDimensions.height);
      console.log(`  📐 Final dimensions: ${finalDimensions.width}x${finalDimensions.height}px`);
      
      if (finalMin >= 600) {
        console.log(`  ✅ MEETS 600px requirement (${finalMin}px)`);
      } else {
        console.log(`  ⚠️  Below 600px after upscale (${finalMin}px) - retrying with fixed 600px`);
        
        // If we somehow didn't meet the requirement, force it to exactly 600px
        const retryBuffer = await sharp(check.imageBuffer)
          .resize(600, 600, {
            kernel: 'lanczos3',
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 100 })
          .toBuffer();
        
        const retryMeta = await sharp(retryBuffer).metadata();
        console.log(`  ✅ Retry successful: ${retryMeta.width}x${retryMeta.height}px`);
        
        // Use the retry buffer instead
        return await uploadAndReturn(retryBuffer, domain, check.dimensions, retryMeta);
      }
    }
    
    return await uploadAndReturn(upscaledBuffer, domain, check.dimensions, finalMeta);
    
  } catch (error) {
    console.error('\n❌ UPSCALING ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upscaling'
    };
  }
}

/**
 * Helper function to upload upscaled image to S3 and return result
 */
async function uploadAndReturn(
  imageBuffer: Buffer,
  domain: string,
  originalDimensions: { width: number; height: number } | null,
  finalMeta: sharp.Metadata
): Promise<UpscaleResult> {
  // Upload to S3
  const timestamp = Date.now();
  const fileName = `public/upscaled-logos/${domain}-${timestamp}.png`;
  
  console.log(`  💾 Uploading to S3...`);
  
  // uploadFile returns the FULL URL when isPublic=true, so use it directly
  const s3Url = await uploadFile(imageBuffer, fileName, true);
  
  // Extract just the S3 key from the URL for logging/reference
  const { bucketName, region } = getBucketConfig();
  const s3KeyMatch = s3Url.match(/\.amazonaws\.com\/(.+)$/);
  const s3Key = s3KeyMatch ? s3KeyMatch[1] : fileName;
  
  console.log(`  🌐 Region: ${region}`);
  console.log(`  📍 Bucket: ${bucketName}`);
  console.log(`\n✨ SUCCESS: Logo enhanced and uploaded!`);
  console.log(`📸 S3 URL: ${s3Url}\n`);
  
  const finalDimensions = finalMeta.width && finalMeta.height 
    ? { width: finalMeta.width, height: finalMeta.height }
    : undefined;
  
  return {
    success: true,
    upscaledUrl: s3Url,
    s3Key: s3Key,
    originalDimensions: originalDimensions || undefined,
    finalDimensions,
    wasUpscaled: true
  };
}
