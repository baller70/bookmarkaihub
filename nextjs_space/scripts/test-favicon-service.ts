/**
 * Test script for the enhanced favicon service
 * Run with: npx ts-node scripts/test-favicon-service.ts
 */

import { getFaviconUrl, getFaviconWithMetadata } from '../lib/favicon-service'

const TEST_URLS = [
  // Major brands (should hit domain overrides - Tier 0)
  'https://www.netflix.com/browse',
  'https://github.com/vercel/next.js',
  'https://www.youtube.com/watch?v=abc123',
  'https://www.google.com/search?q=test',
  
  // Companies with Clearbit logos (should hit Tier 1)
  'https://www.stripe.com/payments',
  'https://www.dropbox.com/home',
  'https://www.shopify.com/store',
  
  // Smaller sites that may require HTML parsing (Tier 2)
  'https://news.ycombinator.com',
  'https://css-tricks.com',
  'https://dev.to',
  
  // Edge cases
  'https://example.com',
  'https://localhost:3000',
  'https://some-random-unknown-site-123456.com',
]

async function runTests() {
  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║           FAVICON SERVICE - MULTI-TIER FALLBACK TEST                 ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')
  console.log('\n')
  
  const results: Array<{
    url: string
    favicon: string
    tier: number
    source: string
    quality: string
    time: number
  }> = []
  
  for (const url of TEST_URLS) {
    console.log(`\n\n${'─'.repeat(70)}`)
    console.log(`Testing: ${url}`)
    console.log('─'.repeat(70))
    
    const startTime = Date.now()
    
    try {
      const metadata = await getFaviconWithMetadata(url)
      const elapsed = Date.now() - startTime
      
      results.push({
        url,
        favicon: metadata.url,
        tier: metadata.tier,
        source: metadata.source,
        quality: metadata.quality,
        time: elapsed,
      })
      
      console.log(`\n✅ SUCCESS`)
      console.log(`   Tier: ${metadata.tier}`)
      console.log(`   Source: ${metadata.source}`)
      console.log(`   Quality: ${metadata.quality}`)
      console.log(`   Time: ${elapsed}ms`)
      console.log(`   Favicon URL: ${metadata.url.substring(0, 80)}${metadata.url.length > 80 ? '...' : ''}`)
      
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.log(`\n❌ ERROR: ${error}`)
      console.log(`   Time: ${elapsed}ms`)
      
      results.push({
        url,
        favicon: 'ERROR',
        tier: -1,
        source: 'error',
        quality: 'none',
        time: elapsed,
      })
    }
  }
  
  // Summary
  console.log('\n\n')
  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║                           TEST SUMMARY                               ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')
  console.log('\n')
  
  // Group by tier
  const byTier: Record<number, typeof results> = {}
  for (const r of results) {
    if (!byTier[r.tier]) byTier[r.tier] = []
    byTier[r.tier].push(r)
  }
  
  const tierNames: Record<number, string> = {
    0: 'Domain Overrides (Curated)',
    1: 'Premium APIs (Clearbit/Logo.dev/Brandfetch)',
    2: 'HTML Parsing (apple-touch-icon, og:image)',
    3: 'Aggregated Services (Unavatar/DuckDuckGo)',
    4: 'Standard Favicon (favicon.ico)',
    5: 'Google Favicon API',
    6: 'Generated Placeholder',
    [-1]: 'Errors',
  }
  
  for (const tier of Object.keys(byTier).map(Number).sort()) {
    const items = byTier[tier]
    console.log(`\n📊 TIER ${tier}: ${tierNames[tier] || 'Unknown'}`)
    console.log(`   Count: ${items.length}`)
    console.log(`   URLs:`)
    for (const item of items) {
      const domain = new URL(item.url).hostname
      console.log(`     - ${domain} (${item.time}ms)`)
    }
  }
  
  // Stats
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
  const highQuality = results.filter(r => r.quality === 'high').length
  const mediumQuality = results.filter(r => r.quality === 'medium').length
  const lowQuality = results.filter(r => r.quality === 'low' || r.quality === 'fallback').length
  
  console.log('\n')
  console.log('📈 STATISTICS')
  console.log(`   Total URLs tested: ${results.length}`)
  console.log(`   Average fetch time: ${Math.round(avgTime)}ms`)
  console.log(`   High quality: ${highQuality} (${Math.round(highQuality / results.length * 100)}%)`)
  console.log(`   Medium quality: ${mediumQuality} (${Math.round(mediumQuality / results.length * 100)}%)`)
  console.log(`   Low/Fallback: ${lowQuality} (${Math.round(lowQuality / results.length * 100)}%)`)
  
  console.log('\n')
  console.log('✨ Test complete!')
}

// Run tests
runTests().catch(console.error)




