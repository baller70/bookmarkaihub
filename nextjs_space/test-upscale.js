const sharp = require('sharp');

async function testSharp() {
  try {
    console.log('Testing Sharp library...');
    
    // Create a small test image
    const testBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
    
    console.log(`✅ Created test image: ${testBuffer.length} bytes`);
    
    // Try to upscale it
    const upscaled = await sharp(testBuffer)
      .resize(600, 600, {
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
    
    console.log(`✅ Upscaled image: ${upscaled.length} bytes`);
    
    // Check dimensions
    const metadata = await sharp(upscaled).metadata();
    console.log(`✅ Upscaled dimensions: ${metadata.width}x${metadata.height}px`);
    
    console.log('\n✅✅✅ SHARP IS WORKING CORRECTLY! ✅✅✅\n');
    
  } catch (error) {
    console.error('❌ SHARP TEST FAILED:', error);
  }
}

testSharp();
