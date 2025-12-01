const fetch = require('node-fetch');

async function generateMetadata() {
  try {
    console.log('🤖 Starting AI metadata generation for all bookmarks...\n');
    
    // Get session/auth (we'll use the API directly with a test)
    const response = await fetch('http://localhost:3000/api/bookmarks/generate-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // This will use the dev server session
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ AI METADATA GENERATION COMPLETE!\n');
    console.log(`📊 Results:`);
    console.log(`   • Total bookmarks processed: ${result.total}`);
    console.log(`   • Successfully generated: ${result.success}`);
    console.log(`   • Errors: ${result.errors}\n`);
    
    if (result.details && result.details.length > 0) {
      console.log('📝 Details:');
      result.details.forEach((detail, index) => {
        console.log(`\n${index + 1}. ${detail.title}`);
        if (detail.description) {
          console.log(`   Description: ${detail.description}`);
        }
        if (detail.tags && detail.tags.length > 0) {
          console.log(`   Tags: ${detail.tags.join(', ')}`);
        }
        if (detail.error) {
          console.log(`   ❌ Error: ${detail.error}`);
        }
      });
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

generateMetadata();
