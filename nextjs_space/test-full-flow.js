require('dotenv/config');

// Test fetching one of the Clearbit logos to see its actual dimensions
async function testClearbitLogo() {
  const url = 'https://logo.clearbit.com/amazon.com?size=400';
  
  console.log('\n🔍 Testing Clearbit Logo Fetch...\n');
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')} bytes`);
    
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`Downloaded: ${buffer.length} bytes`);
    
    // Try to get dimensions with sharp
    const sharp = require('sharp');
    const metadata = await sharp(buffer).metadata();
    
    console.log(`\n📐 Image Metadata:`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  Width: ${metadata.width}px`);
    console.log(`  Height: ${metadata.height}px`);
    console.log(`  Channels: ${metadata.channels}`);
    console.log(`  Has Alpha: ${metadata.hasAlpha}`);
    
    const minDim = Math.min(metadata.width || 0, metadata.height || 0);
    console.log(`\n  Minimum dimension: ${minDim}px`);
    
    if (minDim < 600) {
      console.log(`  ❌ FAILS 600px requirement - would need upscaling`);
    } else {
      console.log(`  ✅ MEETS 600px requirement - no upscaling needed`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testClearbitLogo();
