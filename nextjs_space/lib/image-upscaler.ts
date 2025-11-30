/**
 * AI-Powered Image Upscaler Service
 * Uses Replicate API to enhance low-quality logos
 */

import { uploadFile } from './s3';

interface UpscaleResult {
  success: boolean;
  upscaledUrl?: string;
  s3Key?: string;
  error?: string;
}

/**
 * Check if an image needs upscaling based on dimensions
 */
async function needsUpscaling(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    
    // If image is very small (< 3KB), it likely needs upscaling
    if (contentLength && parseInt(contentLength) < 3000) {
      return true;
    }
    
    // Fetch the actual image to check dimensions
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    
    // Check if dimensions are available (would need image-size library in production)
    // For now, we'll use file size as a heuristic
    return buffer.byteLength < 5000; // < 5KB likely needs enhancement
  } catch (error) {
    console.error('Error checking image quality:', error);
    return false; // Don't upscale if we can't check
  }
}

/**
 * Upscale an image using Replicate AI
 */
export async function upscaleImage(imageUrl: string, domain: string): Promise<UpscaleResult> {
  try {
    console.log(`[UPSCALER] Checking if ${domain} needs upscaling...`);
    
    // Check if upscaling is needed
    const shouldUpscale = await needsUpscaling(imageUrl);
    
    if (!shouldUpscale) {
      console.log(`[UPSCALER] ${domain} - Quality acceptable, skipping upscale`);
      return { success: true, upscaledUrl: imageUrl };
    }
    
    console.log(`[UPSCALER] ${domain} - Starting AI upscale...`);
    
    // Get Replicate API key from secrets file
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    let replicateApiKey: string;
    
    try {
      const fs = require('fs');
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
      replicateApiKey = secrets?.replicate?.secrets?.api_key?.value;
      
      if (!replicateApiKey) {
        throw new Error('Replicate API key not found in secrets');
      }
    } catch (error) {
      console.error('[UPSCALER] Failed to read Replicate API key:', error);
      return { success: false, error: 'API key not configured' };
    }
    
    // Call Replicate API to upscale the image
    // Using nightmareai/real-esrgan model for image upscaling
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
          scale: 4, // 4x upscaling
          face_enhance: false, // Not needed for logos
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }
    
    const prediction = await response.json();
    
    // Poll for completion (max 30 seconds)
    let attempts = 0;
    let result = prediction;
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${replicateApiKey}`,
          }
        }
      );
      
      result = await pollResponse.json();
      attempts++;
    }
    
    if (result.status !== 'succeeded' || !result.output) {
      throw new Error('Upscaling failed or timed out');
    }
    
    // Download the upscaled image
    const upscaledImageUrl = result.output;
    const imageResponse = await fetch(upscaledImageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Upload to S3
    const fileName = `upscaled-logos/${domain}-${Date.now()}.png`;
    const s3Key = await uploadFile(imageBuffer, fileName);
    
    // Generate S3 URL (public)
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    
    console.log(`[UPSCALER] ${domain} - Successfully upscaled and stored in S3`);
    
    return {
      success: true,
      upscaledUrl: s3Url,
      s3Key: s3Key
    };
    
  } catch (error) {
    console.error('[UPSCALER] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      upscaledUrl: imageUrl // Fallback to original
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
