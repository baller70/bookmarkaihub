require('dotenv/config');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testRealUpscale() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  TESTING REAL UPSCALE FLOW - AMAZON LOGO                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const imageUrl = 'https://logo.clearbit.com/amazon.com?size=400';
  const domain = 'amazon.com';
  
  try {
    // Step 1: Fetch the image
    console.log('Step 1: Fetching image from', imageUrl);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ Downloaded: ${(buffer.length / 1024).toFixed(1)}KB`);
    
    // Step 2: Get dimensions
    console.log('\nStep 2: Checking dimensions...');
    const metadata = await sharp(buffer).metadata();
    console.log(`📐 Original: ${metadata.width}x${metadata.height}px`);
    
    const minDim = Math.min(metadata.width, metadata.height);
    console.log(`📏 Minimum dimension: ${minDim}px`);
    
    if (minDim >= 600) {
      console.log('✅ Image already meets 600px requirement - no upscaling needed');
      return;
    }
    
    console.log('❌ Image needs upscaling');
    
    // Step 3: Calculate target dimensions
    console.log('\nStep 3: Calculating target dimensions...');
    const scaleFactor = Math.ceil(600 / minDim);
    const targetWidth = metadata.width * scaleFactor;
    const targetHeight = metadata.height * scaleFactor;
    console.log(`🔢 Scale factor: ${scaleFactor}x`);
    console.log(`🎯 Target: ${targetWidth}x${targetHeight}px`);
    
    // Step 4: Upscale
    console.log('\nStep 4: Upscaling with Sharp + Lanczos3...');
    const upscaledBuffer = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        kernel: 'lanczos3',
        fit: 'fill',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 6,
        adaptiveFiltering: true,
        palette: false
      })
      .toBuffer();
    
    console.log(`✅ Upscaled: ${(upscaledBuffer.length / 1024).toFixed(1)}KB`);
    
    // Step 5: Verify final dimensions
    console.log('\nStep 5: Verifying final dimensions...');
    const finalMeta = await sharp(upscaledBuffer).metadata();
    console.log(`📐 Final: ${finalMeta.width}x${finalMeta.height}px`);
    
    const finalMin = Math.min(finalMeta.width, finalMeta.height);
    if (finalMin >= 600) {
      console.log(`✅ MEETS 600px requirement (${finalMin}px)`);
    } else {
      console.log(`❌ STILL FAILS 600px requirement (${finalMin}px)`);
      throw new Error('Upscaling did not meet minimum requirement');
    }
    
    // Step 6: Test S3 upload
    console.log('\nStep 6: Testing S3 upload...');
    const region = process.env.AWS_REGION || 'us-west-2';
    const bucketName = process.env.AWS_BUCKET_NAME;
    const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
    
    console.log(`  Region: ${region}`);
    console.log(`  Bucket: ${bucketName}`);
    console.log(`  Folder Prefix: ${folderPrefix}`);
    
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME not configured');
    }
    
    const s3Client = new S3Client({
      region: region,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });
    
    const timestamp = Date.now();
    const fileName = `public/upscaled-logos/${domain}-${timestamp}.png`;
    const key = `${folderPrefix}${fileName}`;
    
    console.log(`  S3 Key: ${key}`);
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: upscaledBuffer,
        ContentType: 'image/png'
      })
    );
    
    console.log(`✅ Successfully uploaded to S3!`);
    
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    console.log(`\n📸 S3 URL: ${s3Url}`);
    
    console.log('\n✅✅✅ FULL UPSCALE FLOW WORKS! ✅✅✅\n');
    
  } catch (error) {
    console.error('\n❌❌❌ UPSCALE FLOW FAILED! ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealUpscale();
