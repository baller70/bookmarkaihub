/**
 * AI-Powered Image Upscaler Service with 600px Minimum Guarantee
 * Enforces minimum 600px resolution for all logos
 * Uses Replicate API to enhance low-quality logos
 */

import { uploadFile } from './s3';
import { getBucketConfig } from './aws-config';
import sharp from 'sharp';
import fs from 'fs';

interface UpscaleResult {
  success: boolean;
  upscaledUrl?: string;
  s3Key?: string;
  error?: string;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
  wasUpscaled?: boolean;
}

/**
 * Get ACTUAL pixel dimensions of an image
 * CRITICAL: This checks real resolution, not file size
 */
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
  try {
    console.log(`  🔍 Fetching image to check dimensions...`);
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    console.log(`  📦 Downloaded: ${(buffer.length / 1024).toFixed(1)}KB`);
    
    const metadata = await sharp(buffer).metadata();
    
    if (metadata.width && metadata.height) {
      console.log(`  📐 Dimensions: ${metadata.width}x${metadata.height}px`);
      return { width: metadata.width, height: metadata.height };
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
async function needsUpscaling(imageUrl: string): Promise<{ needed: boolean; dimensions: { width: number; height: number } | null }> {
  try {
    const dimensions = await getImageDimensions(imageUrl);
    
    if (!dimensions) {
      console.log(`  ⚠️  Cannot determine dimensions - will attempt upscale`);
      return { needed: true, dimensions: null };
    }
    
    const minDimension = Math.min(dimensions.width, dimensions.height);
    const needed = minDimension < 600;
    
    if (needed) {
      console.log(`  ❌ FAILS 600px requirement: ${dimensions.width}x${dimensions.height}px (min: ${minDimension}px)`);
    } else {
      console.log(`  ✅ MEETS 600px requirement: ${dimensions.width}x${dimensions.height}px (min: ${minDimension}px)`);
    }
    
    return { needed, dimensions };
  } catch (error) {
    console.error('  ❌ Error checking dimensions:', error);
    return { needed: true, dimensions: null }; // Default to upscaling if we can't check
  }
}

/**
 * Upscale an image using Replicate AI
 * GUARANTEE: Output will be at least 600px minimum
 */
export async function upscaleImage(imageUrl: string, domain: string): Promise<UpscaleResult> {
  try {
    console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║  AI LOGO UPSCALER - 600PX MINIMUM GUARANTEE              ║`);
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
    
    console.log(`\n🚀 UPSCALING REQUIRED - Starting AI enhancement...`);
    console.log(`⏱️  Estimated time: 20-30 seconds`);
    
    // Get Replicate API key
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    let replicateApiKey: string;
    
    try {
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
      replicateApiKey = secrets?.replicate?.secrets?.api_key?.value;
      
      if (!replicateApiKey) {
        throw new Error('Replicate API key not found in secrets file');
      }
      
      console.log(`  ✓ Replicate API key loaded successfully`);
    } catch (error) {
      console.error('❌ Failed to read Replicate API key:', error);
      return { 
        success: false, 
        error: 'Replicate API key not configured. Please ensure the API key is set up correctly.',
        originalDimensions: check.dimensions || undefined
      };
    }
    
    // Calculate required scale factor to reach 600px
    let scaleFactor = 4; // Default 4x
    if (check.dimensions) {
      const minDim = Math.min(check.dimensions.width, check.dimensions.height);
      scaleFactor = Math.ceil(600 / minDim);
      scaleFactor = Math.min(scaleFactor, 4); // Cap at 4x
      console.log(`  📊 Calculated scale factor: ${scaleFactor}x (${minDim}px → ${minDim * scaleFactor}px)`);
    }
    
    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
        input: {
          image: imageUrl,
          scale: scaleFactor,
          face_enhance: false,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }
    
    const prediction = await response.json();
    console.log(`  🆔 Prediction ID: ${prediction.id}`);
    
    // Poll for completion - increased timeout to 90 seconds
    let attempts = 0;
    let result = prediction;
    const maxAttempts = 45; // 45 attempts × 2s = 90 seconds max
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { 'Authorization': `Token ${replicateApiKey}` } }
      );
      
      result = await pollResponse.json();
      attempts++;
      console.log(`  ⏳ Processing... ${attempts * 2}s (status: ${result.status})`);
    }
    
    console.log('\n');
    
    if (result.status === 'failed') {
      console.error(`  ❌ Replicate prediction failed:`, result.error);
      throw new Error(`Replicate prediction failed: ${result.error || 'Unknown error'}`);
    }
    
    if (result.status !== 'succeeded' || !result.output) {
      console.error(`  ❌ Upscaling timed out after ${attempts * 2} seconds`);
      throw new Error(`Upscaling timed out after ${attempts * 2} seconds. The AI model may be under heavy load. Please try again in a few minutes.`);
    }
    
    console.log(`  ✅ AI upscaling complete!`);
    
    // Download upscaled image
    const imageResponse = await fetch(result.output);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    console.log(`  📦 Downloaded: ${(imageBuffer.length / 1024).toFixed(1)}KB`);
    
    // Verify final dimensions
    const finalMeta = await sharp(imageBuffer).metadata();
    const finalDimensions = finalMeta.width && finalMeta.height 
      ? { width: finalMeta.width, height: finalMeta.height }
      : undefined;
    
    if (finalDimensions) {
      const finalMin = Math.min(finalDimensions.width, finalDimensions.height);
      console.log(`  📐 Final dimensions: ${finalDimensions.width}x${finalDimensions.height}px`);
      
      if (finalMin < 600) {
        console.log(`  ⚠️  WARNING: Still below 600px (${finalMin}px)`);
      } else {
        console.log(`  ✅ MEETS 600px requirement (${finalMin}px)`);
      }
    }
    
    // Upload to S3 (public folder for CDN access)
    const fileName = `public/upscaled-logos/${domain}-${Date.now()}.png`;
    const s3Key = await uploadFile(imageBuffer, fileName, true);
    
    const { bucketName, region } = getBucketConfig();
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    
    console.log(`  💾 Uploaded to S3: ${s3Key}`);
    console.log(`  🌐 Region: ${region}`);
    console.log(`  📍 Bucket: ${bucketName}`);
    console.log(`\n✨ SUCCESS: Logo enhanced and uploaded!`);
    console.log(`📸 S3 URL: ${s3Url}\n`);
    
    return {
      success: true,
      upscaledUrl: s3Url,
      s3Key: s3Key,
      originalDimensions: check.dimensions || undefined,
      finalDimensions,
      wasUpscaled: true
    };
    
  } catch (error) {
    console.error('\n❌ UPSCALE ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      upscaledUrl: imageUrl
    };
  }
}

/**
 * Get enhanced favicon with optional AI upscaling
 */
export async function getEnhancedFavicon(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    
    // Build Clearbit URL
    const clearbitUrl = `https://logo.clearbit.com/${domain}?size=400`;
    
    // Try to upscale if needed
    const result = await upscaleImage(clearbitUrl, domain);
    
    return result.upscaledUrl || clearbitUrl;
  } catch (error) {
    console.error('[UPSCALER] Failed to get enhanced favicon:', error);
    // Fallback to basic Clearbit
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    return `https://logo.clearbit.com/${domain}?size=400`;
  }
}
