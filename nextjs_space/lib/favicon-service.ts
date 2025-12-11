/**
 * Premium Favicon/Logo Service - Enhanced Multi-Tier System
 * 
 * Multi-tier waterfall strategy prioritizing HIGH-QUALITY logos:
 * 
 * TIER 0: Domain Overrides (curated, highest quality official sources)
 * TIER 1: Premium Logo APIs (Clearbit, Logo.dev, Brandfetch - 128px+ PNG/SVG)
 * TIER 2: Website HTML Parsing (apple-touch-icon, og:image, manifest.json icons)
 * TIER 3: Aggregated Services (Unavatar, DuckDuckGo - validated quality)
 * TIER 4: Standard Favicons (favicon.ico from domain root)
 * TIER 5: Google Favicon API (lower quality but reliable)
 * TIER 6: Generated Fallback (letter-based icon with domain color)
 * 
 * Quality Validation:
 * - Minimum 64x64px preferred, 128x128px ideal
 * - PNG/SVG format preferred over ICO
 * - HTTP 200 status with valid image content-type
 * - Placeholder image detection (avoids generic fallbacks)
 */

// ============================================================================
// TIER 0: CURATED DOMAIN OVERRIDES - Highest Quality Official Sources
// ============================================================================

const DOMAIN_OVERRIDES: Record<string, string> = {
  // Social Media & Communications
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'google.com': 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
  'facebook.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png',
  'twitter.com': 'https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png',
  'x.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_icon_2.svg/2048px-X_icon_2.svg.png',
  'linkedin.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/768px-LinkedIn_logo_initials.png',
  'instagram.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png',
  'tiktok.com': 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
  'reddit.com': 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png',
  'pinterest.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pinterest-logo.png/800px-Pinterest-logo.png',
  'whatsapp.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
  'telegram.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png',
  'discord.com': 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
  'snapchat.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/512px-Snapchat_logo.svg.png',
  'twitch.tv': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Twitch_Glitch_Logo_Purple.svg/512px-Twitch_Glitch_Logo_Purple.svg.png',
  
  // Tech Giants
  'github.com': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  'amazon.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
  'apple.com': 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png',
  'microsoft.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png',
  'spotify.com': 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
  'openai.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/512px-OpenAI_Logo.svg.png',
  'nvidia.com': 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/527px-Nvidia_logo.svg.png',
  'tesla.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/279px-Tesla_Motors.svg.png',
  
  // Productivity & Collaboration
  'slack.com': 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
  'zoom.us': 'https://st1.zoom.us/static/6.3.13293/image/new/ZoomLogo.png',
  'notion.so': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
  'figma.com': 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b04e12108de7e7e0f3736dc6-1024x1024.png',
  'canva.com': 'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg',
  'medium.com': 'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
  'trello.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Trello_logo.svg/512px-Trello_logo.svg.png',
  'asana.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Asana_logo.svg/512px-Asana_logo.svg.png',
  'monday.com': 'https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/img/monday-logo-x2.png',
  'airtable.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Airtable_Logo.svg/512px-Airtable_Logo.svg.png',
  'miro.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Miro-logo.svg/512px-Miro-logo.svg.png',
  'linear.app': 'https://linear.app/static/apple-touch-icon.png',
  'clickup.com': 'https://clickup.com/landing/images/clickup-logo-gradient.png',
  
  // Developer Tools
  'gitlab.com': 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png',
  'bitbucket.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Bitbucket-blue-logomark-only.svg/512px-Bitbucket-blue-logomark-only.svg.png',
  'stackoverflow.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/512px-Stack_Overflow_icon.svg.png',
  'vercel.com': 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
  'netlify.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Netlify_logo_%282%29.svg/512px-Netlify_logo_%282%29.svg.png',
  'heroku.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Heroku_logo.svg/512px-Heroku_logo.svg.png',
  'docker.com': 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
  'kubernetes.io': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/512px-Kubernetes_logo_without_workmark.svg.png',
  'npmjs.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/540px-Npm-logo.svg.png',
  'pypi.org': 'https://pypi.org/static/images/logo-large.9f732b5f.svg',
  'codepen.io': 'https://cpwebassets.codepen.io/assets/favicon/apple-touch-icon-5ae1a0698dcc2402e9712f7d01ed509a57814f994c660df9f7a952f3060571f.png',
  'jsfiddle.net': 'https://jsfiddle.net/img/logo-s.png',
  'codesandbox.io': 'https://codesandbox.io/favicon.ico',
  'replit.com': 'https://replit.com/public/icons/favicon-196.png',
  
  // Cloud Services
  'aws.amazon.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png',
  'cloud.google.com': 'https://www.gstatic.com/devrel-devsite/prod/v0d244f667a3683225cca86d0ecf9b9b81b1e734e55a030bdcd3f3094b835c987/cloud/images/cloud-logo.svg',
  'azure.microsoft.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/512px-Microsoft_Azure.svg.png',
  'digitalocean.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/DigitalOcean_logo.svg/512px-DigitalOcean_logo.svg.png',
  'cloudflare.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/512px-Cloudflare_Logo.png',
  
  // E-commerce
  'shopify.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/512px-Shopify_logo_2018.svg.png',
  'etsy.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Etsy_logo.svg/512px-Etsy_logo.svg.png',
  'ebay.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/512px-EBay_logo.svg.png',
  'aliexpress.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/AliExpress_logo.svg/512px-AliExpress_logo.svg.png',
  'walmart.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/512px-Walmart_logo.svg.png',
  
  // Finance
  'stripe.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png',
  'paypal.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png',
  'coinbase.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Coinbase.svg/512px-Coinbase.svg.png',
  'binance.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/512px-Binance_logo.svg.png',
  'robinhood.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Robinhood_Logo.svg/512px-Robinhood_Logo.svg.png',
  'venmo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Venmo_Logo_Blue.svg/512px-Venmo_Logo_Blue.svg.png',
  
  // News & Media
  'nytimes.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_New_York_Times_Logo.svg/512px-The_New_York_Times_Logo.svg.png',
  'bbc.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_Logo_2021.svg/512px-BBC_Logo_2021.svg.png',
  'cnn.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png',
  'theguardian.com': 'https://assets.guim.co.uk/images/2170b16eb045a34f8c79761b203627b4/fallback-logo.png',
  'reuters.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Reuters_logo.svg/512px-Reuters_logo.svg.png',
  'washingtonpost.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/The_Logo_of_The_Washington_Post_Newspaper.svg/512px-The_Logo_of_The_Washington_Post_Newspaper.svg.png',
  'forbes.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Forbes_logo.svg/512px-Forbes_logo.svg.png',
  'bloomberg.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_logo.svg/512px-Bloomberg_logo.svg.png',
  'techcrunch.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/512px-TechCrunch_logo.svg.png',
  'wired.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Wired_logo.svg/512px-Wired_logo.svg.png',
  'theverge.com': 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/verge-logo.png',
  
  // Entertainment & Streaming
  'hulu.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/512px-Hulu_Logo.svg.png',
  'disneyplus.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/512px-Disney%2B_logo.svg.png',
  'hbomax.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/512px-HBO_Max_Logo.svg.png',
  'primevideo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/512px-Amazon_Prime_Video_logo.svg.png',
  'soundcloud.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Antu_soundcloud.svg/512px-Antu_soundcloud.svg.png',
  'deezer.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Deezer_logo.svg/512px-Deezer_logo.svg.png',
  
  // Gaming
  'steam.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
  'steampowered.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
  'epicgames.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Epic_Games_logo.svg/512px-Epic_Games_logo.svg.png',
  'playstation.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Playstation_logo_colour.svg/512px-Playstation_logo_colour.svg.png',
  'xbox.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Xbox_logo_%282019%29.svg/512px-Xbox_logo_%282019%29.svg.png',
  'nintendo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/512px-Nintendo.svg.png',
  'roblox.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Roblox_2022_Logo.svg/512px-Roblox_2022_Logo.svg.png',
  
  // Education
  'coursera.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-logo-square.svg/512px-Coursera-logo-square.svg.png',
  'udemy.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/512px-Udemy_logo.svg.png',
  'edx.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/EdX.svg/512px-EdX.svg.png',
  'khanacademy.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Khan_Academy_Logo_Old_version_2015.jpg/512px-Khan_Academy_Logo_Old_version_2015.jpg',
  'duolingo.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Duolingo_bird_illustration_feathers.svg/512px-Duolingo_bird_illustration_feathers.svg.png',
  
  // Design & Creative
  'dribbble.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Dribbble_Logo.svg/512px-Dribbble_Logo.svg.png',
  'behance.net': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Behance_logo.svg/512px-Behance_logo.svg.png',
  'unsplash.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_Unsplash.svg/512px-Logo_of_Unsplash.svg.png',
  'pexels.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Pexels_logo.svg/512px-Pexels_logo.svg.png',
  'adobe.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png',
  'sketch.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sketch_Logo.svg/512px-Sketch_Logo.svg.png',
  
  // AI & ML
  'anthropic.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/512px-Anthropic_logo.svg.png',
  'huggingface.co': 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
  'midjourney.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Midjourney_Emblem.png/512px-Midjourney_Emblem.png',
  'stability.ai': 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/c90ec098-0d9e-4c5d-996b-d26a3b3e7c57/stability-logo.png',
  'perplexity.ai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Perplexity_AI_logo.svg/512px-Perplexity_AI_logo.svg.png',
  
  // Other
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
  'jogg.ai': 'https://www.jogg.ai/favicon-96x96.png',
  'dropbox.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Dropbox_Icon.svg/512px-Dropbox_Icon.svg.png',
  'box.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Box%2C_Inc._logo.svg/512px-Box%2C_Inc._logo.svg.png',
  'evernote.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Evernote_Icon.png/512px-Evernote_Icon.png',
  'todoist.com': 'https://todoist.com/static/favicon/android-chrome-192x192.png',
  '1password.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/1Password_logo_2020.svg/512px-1Password_logo_2020.svg.png',
  'lastpass.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/LastPass_logo.svg/512px-LastPass_logo.svg.png',
  'bitwarden.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Bitwarden_logo.svg/512px-Bitwarden_logo.svg.png',
  'grammarly.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Grammarly_logo_%282021%29.svg/512px-Grammarly_logo_%282021%29.svg.png',
  'calendly.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Calendly_logo.svg/512px-Calendly_logo.svg.png',
  'typeform.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Typeform_logo.svg/512px-Typeform_logo.svg.png',
  'surveymonkey.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SurveyMonkey_Logo.svg/512px-SurveyMonkey_Logo.svg.png',
  'mailchimp.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mailchimp_Logo.svg/512px-Mailchimp_Logo.svg.png',
  'hubspot.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/512px-HubSpot_Logo.svg.png',
  'salesforce.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/512px-Salesforce.com_logo.svg.png',
  'zendesk.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Zendesk_logo.svg/512px-Zendesk_logo.svg.png',
  'intercom.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/Intercom_logo.svg/512px-Intercom_logo.svg.png',
  'atlassian.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Atlassian-blue-logo.svg/512px-Atlassian-blue-logo.svg.png',
  'jira.atlassian.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Jira_Logo.svg/512px-Jira_Logo.svg.png',
  'confluence.atlassian.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Confluence_logo.svg/512px-Confluence_logo.svg.png',
  'zapier.com': 'https://cdn.zapier.com/ssr/d1fcf06f11ab7d6ad5ac0a1d98c9d9c2a27da5a1/_next/static/media/zapier-logo.aae84e8f.svg',
  'ifttt.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/IFTTT_logo_%28simple%29.svg/512px-IFTTT_logo_%28simple%29.svg.png',
  'make.com': 'https://images.ctfassets.net/qqlj6g4ee76j/2nB8PW1hD7s9mHV5QHpJIy/3f9c25a51fdd1d7bec2b1d6a6f5db67a/make_emblem_light_background.svg',
  'webflow.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Webflow_logo.svg/512px-Webflow_logo.svg.png',
  'squarespace.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Squarespace_2019_logo.svg/512px-Squarespace_2019_logo.svg.png',
  'wix.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Wix.com_website_logo.svg/512px-Wix.com_website_logo.svg.png',
  'wordpress.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/WordPress_blue_logo.svg/512px-WordPress_blue_logo.svg.png',
  'wordpress.org': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/WordPress_blue_logo.svg/512px-WordPress_blue_logo.svg.png',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract clean domain from URL (removes www. and subdomain variations)
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove www. but keep other subdomains for certain sites
    let hostname = urlObj.hostname.replace(/^www\./, '')
    return hostname
  } catch {
    return ''
  }
}

/**
 * Get base domain (e.g., subdomain.example.com -> example.com)
 */
function getBaseDomain(domain: string): string {
  const parts = domain.split('.')
  if (parts.length > 2) {
    // Handle cases like co.uk, com.au etc.
    const tlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'co.in']
    const lastTwo = parts.slice(-2).join('.')
    if (tlds.includes(lastTwo)) {
      return parts.slice(-3).join('.')
    }
    return parts.slice(-2).join('.')
  }
  return domain
}

/**
 * Configuration for image quality validation
 */
interface QualityConfig {
  minWidth: number
  minHeight: number
  preferredFormats: string[]
  timeout: number
}

const DEFAULT_QUALITY_CONFIG: QualityConfig = {
  minWidth: 64,
  minHeight: 64,
  preferredFormats: ['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg'],
  timeout: 3000,
}

/**
 * Result of image validation with quality metadata
 */
interface ImageValidationResult {
  valid: boolean
  url: string
  contentType?: string
  contentLength?: number
  isPlaceholder?: boolean
  quality: 'high' | 'medium' | 'low' | 'unknown'
}

/**
 * Known placeholder image sizes (in bytes) to detect generic fallbacks
 */
const PLACEHOLDER_SIZES = new Set([
  726, // Common 1x1 gif
  807, // Common 1x1 png
  1406, // Google default favicon
  2326, // DuckDuckGo default
  0,
])

/**
 * Validate if a URL returns a valid, high-quality image
 */
async function validateImageUrl(
  url: string,
  config: QualityConfig = DEFAULT_QUALITY_CONFIG
): Promise<ImageValidationResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkHub/1.0)',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { valid: false, url, quality: 'unknown' }
    }

    const contentType = response.headers.get('content-type') || ''
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10)

    // Check if it's an image
    if (!contentType.startsWith('image/')) {
      return { valid: false, url, quality: 'unknown' }
    }

    // Check for placeholder images (very small file sizes)
    if (PLACEHOLDER_SIZES.has(contentLength) || contentLength < 500) {
      return {
        valid: false,
        url,
        contentType,
        contentLength,
        isPlaceholder: true,
        quality: 'low',
      }
    }

    // Determine quality based on content type and size
    let quality: 'high' | 'medium' | 'low' = 'medium'
    if (contentType.includes('svg') || contentLength > 10000) {
      quality = 'high'
    } else if (contentType.includes('ico') || contentLength < 5000) {
      quality = 'low'
    }

    return {
      valid: true,
      url,
      contentType,
      contentLength,
      isPlaceholder: false,
      quality,
    }
  } catch {
    return { valid: false, url, quality: 'unknown' }
  }
}

/**
 * Simple verification for quick checks
 */
async function verifyImageUrl(url: string, timeout: number = 3000): Promise<boolean> {
  const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout })
  return result.valid
}

// ============================================================================
// TIER 1: PREMIUM LOGO APIs
// ============================================================================

/**
 * Try Clearbit Logo API (premium, high-quality PNG logos)
 * Returns 128px+ PNG logos for most major companies
 */
async function tryClearbitLogo(domain: string): Promise<string | null> {
  const url = `https://logo.clearbit.com/${domain}`
  console.log('[Tier 1 - Clearbit] Checking:', domain)

  const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout: 2500 })
  if (result.valid && !result.isPlaceholder) {
    console.log('[Tier 1 - Clearbit] ✓ Found high-quality logo')
    return url
  }
  return null
}

/**
 * Try Logo.dev (high-quality logos with size parameter)
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  const url = `https://img.logo.dev/${domain}?token=pk_X-LM61eDSGydDUXfpr_ivA&size=200`
  console.log('[Tier 1 - Logo.dev] Checking:', domain)

  const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout: 2500 })
  if (result.valid && !result.isPlaceholder) {
    console.log('[Tier 1 - Logo.dev] ✓ Found high-quality logo')
    return url
  }
  return null
}

/**
 * Try Brandfetch (brand assets platform)
 */
async function tryBrandfetch(domain: string): Promise<string | null> {
  // Try multiple Brandfetch endpoints
  const endpoints = [
    `https://cdn.brandfetch.io/${domain}/w/512/h/512?c=1id_VmBTFfP0rbz`,
    `https://cdn.brandfetch.io/${domain}/fallback/icon/`,
    `https://cdn.brandfetch.io/${domain}/fallback/lettermark/`,
  ]

  console.log('[Tier 1 - Brandfetch] Checking:', domain)

  for (const url of endpoints) {
    const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout: 2000 })
    if (result.valid && !result.isPlaceholder && result.quality !== 'low') {
      console.log('[Tier 1 - Brandfetch] ✓ Found high-quality logo')
      return url
    }
  }
  return null
}

// ============================================================================
// TIER 2: WEBSITE HTML PARSING
// ============================================================================

/**
 * Parse website HTML for high-quality icons
 * Looks for: apple-touch-icon, og:image, manifest.json icons, high-res favicons
 */
async function tryParseWebsiteIcons(url: string, domain: string): Promise<string | null> {
  console.log('[Tier 2 - HTML Parse] Fetching website:', domain)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const html = await response.text()
    const baseUrl = new URL(url).origin

    // Priority order of icon selectors
    const iconPatterns = [
      // Apple Touch Icons (highest quality, typically 180x180 or larger)
      /<link[^>]*rel=["']apple-touch-icon(?:-precomposed)?["'][^>]*href=["']([^"']+)["']/gi,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon(?:-precomposed)?["']/gi,

      // Open Graph Image (often high-quality brand images)
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/gi,

      // Large PNG favicons
      /<link[^>]*rel=["']icon["'][^>]*sizes=["'](?:192x192|256x256|512x512)["'][^>]*href=["']([^"']+)["']/gi,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']icon["'][^>]*sizes=["'](?:192x192|256x256|512x512)["']/gi,

      // Any sized icon with type="image/png"
      /<link[^>]*rel=["']icon["'][^>]*type=["']image\/png["'][^>]*href=["']([^"']+)["']/gi,

      // Shortcut icon
      /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["']/gi,
    ]

    // Also look for manifest.json
    const manifestMatch = html.match(/<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["']/i)
    if (manifestMatch) {
      const manifestUrl = resolveUrl(manifestMatch[1], baseUrl)
      const manifestIcon = await tryParseManifest(manifestUrl, baseUrl)
      if (manifestIcon) {
        console.log('[Tier 2 - Manifest] ✓ Found high-quality icon from manifest')
        return manifestIcon
      }
    }

    // Try each pattern
    for (const pattern of iconPatterns) {
      const matches = html.matchAll(pattern)
      for (const match of matches) {
        const iconUrl = resolveUrl(match[1], baseUrl)
        const result = await validateImageUrl(iconUrl, { ...DEFAULT_QUALITY_CONFIG, timeout: 2000 })

        if (result.valid && !result.isPlaceholder && result.quality !== 'low') {
          console.log('[Tier 2 - HTML Parse] ✓ Found high-quality icon:', result.quality)
          return iconUrl
        }
      }
    }

    return null
  } catch (error) {
    console.log('[Tier 2 - HTML Parse] Error parsing website')
    return null
  }
}

/**
 * Parse manifest.json for icons
 */
async function tryParseManifest(manifestUrl: string, baseUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(manifestUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const manifest = await response.json()

    if (manifest.icons && Array.isArray(manifest.icons)) {
      // Sort by size (largest first)
      const sortedIcons = manifest.icons
        .filter((icon: any) => icon.src)
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.sizes?.split('x')[0] || '0', 10)
          const sizeB = parseInt(b.sizes?.split('x')[0] || '0', 10)
          return sizeB - sizeA
        })

      // Try largest icons first
      for (const icon of sortedIcons.slice(0, 3)) {
        const iconUrl = resolveUrl(icon.src, baseUrl)
        const result = await validateImageUrl(iconUrl)
        if (result.valid && !result.isPlaceholder) {
          return iconUrl
        }
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Resolve relative URLs to absolute
 */
function resolveUrl(href: string, baseUrl: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href
  }
  if (href.startsWith('//')) {
    return 'https:' + href
  }
  if (href.startsWith('/')) {
    return baseUrl + href
  }
  return baseUrl + '/' + href
}

// ============================================================================
// TIER 3: AGGREGATED SERVICES
// ============================================================================

/**
 * Try Unavatar (aggregated logo sources)
 */
async function tryUnavatar(domain: string): Promise<string | null> {
  const url = `https://unavatar.io/${domain}?fallback=false`
  console.log('[Tier 3 - Unavatar] Checking:', domain)

  const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout: 2500 })
  if (result.valid && !result.isPlaceholder) {
    console.log('[Tier 3 - Unavatar] ✓ Found logo')
    return url
  }
  return null
}

/**
 * Try DuckDuckGo Icons (decent quality, validated)
 */
async function tryDuckDuckGo(domain: string): Promise<string | null> {
  const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`
  console.log('[Tier 3 - DuckDuckGo] Checking:', domain)

  const result = await validateImageUrl(url, { ...DEFAULT_QUALITY_CONFIG, timeout: 2000 })
  if (result.valid && !result.isPlaceholder && result.contentLength && result.contentLength > 1000) {
    console.log('[Tier 3 - DuckDuckGo] ✓ Found valid icon')
    return url
  }
  return null
}

// ============================================================================
// TIER 4: STANDARD FAVICON
// ============================================================================

/**
 * Try standard favicon.ico from domain root
 */
async function tryStandardFavicon(url: string): Promise<string | null> {
  try {
    const baseUrl = new URL(url).origin
    const faviconUrl = `${baseUrl}/favicon.ico`
    console.log('[Tier 4 - Standard Favicon] Checking:', faviconUrl)

    const result = await validateImageUrl(faviconUrl, { ...DEFAULT_QUALITY_CONFIG, timeout: 2000 })
    if (result.valid && !result.isPlaceholder && result.contentLength && result.contentLength > 500) {
      console.log('[Tier 4 - Standard Favicon] ✓ Found favicon.ico')
      return faviconUrl
    }
    return null
  } catch {
    return null
  }
}

// ============================================================================
// TIER 5: GOOGLE FAVICON API
// ============================================================================

/**
 * Get Google Favicon (reliable but lower quality)
 */
function getGoogleFavicon(domain: string, size: number = 256): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

// ============================================================================
// TIER 6: AI-SUGGESTED SIMILAR LOGOS
// ============================================================================

/**
 * Extract meaningful keywords from a domain name
 * e.g., "hippocampus.com" -> ["hippo", "campus"]
 * e.g., "bluebird-finance.io" -> ["blue", "bird", "finance"]
 */
function extractKeywordsFromDomain(domain: string): string[] {
  // Remove TLD and common words
  const baseName = domain.split('.')[0]
  
  // Split by common separators
  const parts = baseName
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .toLowerCase()
    .split(' ')
    .filter(p => p.length > 2)
  
  // Common words to filter out
  const stopWords = new Set(['www', 'the', 'app', 'web', 'get', 'try', 'use', 'new', 'pro', 'hub', 'lab', 'labs', 'inc', 'llc', 'ltd', 'corp'])
  
  return parts.filter(p => !stopWords.has(p))
}

/**
 * Get icon category/style based on domain keywords
 */
function getIconStyleForDomain(domain: string): { style: string; seed: string; colors: string[] } {
  const keywords = extractKeywordsFromDomain(domain)
  const baseName = domain.split('.')[0].toLowerCase()
  
  // Map common themes to icon styles
  const themeMap: Record<string, { style: string; colors: string[] }> = {
    // Animals
    'bird': { style: 'adventurer', colors: ['3b82f6', '60a5fa'] },
    'dog': { style: 'big-smile', colors: ['f59e0b', 'fbbf24'] },
    'cat': { style: 'avataaars', colors: ['8b5cf6', 'a78bfa'] },
    'fish': { style: 'bottts', colors: ['06b6d4', '22d3ee'] },
    'bear': { style: 'big-ears', colors: ['78350f', 'a16207'] },
    'fox': { style: 'adventurer', colors: ['ea580c', 'f97316'] },
    'wolf': { style: 'avataaars-neutral', colors: ['64748b', '94a3b8'] },
    'lion': { style: 'big-smile', colors: ['ca8a04', 'eab308'] },
    'eagle': { style: 'adventurer', colors: ['1e3a8a', '1d4ed8'] },
    'owl': { style: 'big-ears-neutral', colors: ['7c3aed', '8b5cf6'] },
    'hippo': { style: 'big-smile', colors: ['6366f1', '818cf8'] },
    'panda': { style: 'big-ears', colors: ['1f2937', '374151'] },
    'rabbit': { style: 'big-ears', colors: ['ec4899', 'f472b6'] },
    
    // Tech themes
    'tech': { style: 'bottts', colors: ['3b82f6', '6366f1'] },
    'code': { style: 'bottts-neutral', colors: ['10b981', '34d399'] },
    'dev': { style: 'bottts', colors: ['8b5cf6', 'a78bfa'] },
    'cloud': { style: 'shapes', colors: ['0ea5e9', '38bdf8'] },
    'data': { style: 'bottts-neutral', colors: ['06b6d4', '22d3ee'] },
    'ai': { style: 'bottts', colors: ['8b5cf6', 'c084fc'] },
    'bot': { style: 'bottts', colors: ['64748b', '94a3b8'] },
    'cyber': { style: 'bottts-neutral', colors: ['22c55e', '4ade80'] },
    
    // Business themes
    'finance': { style: 'initials', colors: ['0f766e', '14b8a6'] },
    'bank': { style: 'initials', colors: ['1e40af', '3b82f6'] },
    'pay': { style: 'shapes', colors: ['059669', '10b981'] },
    'shop': { style: 'shapes', colors: ['dc2626', 'ef4444'] },
    'store': { style: 'shapes', colors: ['ea580c', 'f97316'] },
    'market': { style: 'initials', colors: ['7c3aed', '8b5cf6'] },
    
    // Creative themes
    'design': { style: 'shapes', colors: ['ec4899', 'f472b6'] },
    'art': { style: 'adventurer', colors: ['f43f5e', 'fb7185'] },
    'creative': { style: 'adventurer', colors: ['8b5cf6', 'c084fc'] },
    'studio': { style: 'shapes', colors: ['6366f1', '818cf8'] },
    'media': { style: 'shapes', colors: ['ef4444', 'f87171'] },
    
    // Nature themes  
    'green': { style: 'adventurer', colors: ['16a34a', '22c55e'] },
    'blue': { style: 'shapes', colors: ['2563eb', '3b82f6'] },
    'red': { style: 'shapes', colors: ['dc2626', 'ef4444'] },
    'sun': { style: 'adventurer', colors: ['f59e0b', 'fbbf24'] },
    'moon': { style: 'adventurer', colors: ['6366f1', '818cf8'] },
    'star': { style: 'shapes', colors: ['eab308', 'facc15'] },
    'ocean': { style: 'adventurer', colors: ['0891b2', '06b6d4'] },
    'forest': { style: 'adventurer', colors: ['15803d', '22c55e'] },
    'mountain': { style: 'shapes', colors: ['475569', '64748b'] },
  }
  
  // Find matching theme
  for (const keyword of keywords) {
    for (const [theme, config] of Object.entries(themeMap)) {
      if (keyword.includes(theme) || theme.includes(keyword)) {
        return { ...config, seed: baseName }
      }
    }
  }
  
  // Default: use domain-based seed with neutral style
  return { 
    style: 'bottts', 
    seed: baseName,
    colors: ['6366f1', '818cf8'] // Default indigo
  }
}

/**
 * Generate multiple similar/themed logos for a domain
 * Uses DiceBear API with different styles
 */
function generateSimilarLogos(domain: string): string[] {
  const { style, seed, colors } = getIconStyleForDomain(domain)
  const baseName = domain.split('.')[0]
  
  // Generate varied options using different services and styles
  const options: string[] = []
  
  // DiceBear styles - professional looking
  const diceBearStyles = [
    'bottts',           // Robot/tech style
    'shapes',           // Geometric shapes
    'initials',         // Letter-based
    'adventurer',       // Character style
    'big-smile',        // Friendly face
    'thumbs',           // Hand gesture
    'icons',            // Simple icons
  ]
  
  // Add the best matching style first
  options.push(
    `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=256&backgroundColor=${colors[0]}`
  )
  
  // Add variations with different styles
  for (const s of diceBearStyles) {
    if (s !== style) {
      options.push(
        `https://api.dicebear.com/7.x/${s}/png?seed=${encodeURIComponent(seed)}&size=256`
      )
    }
  }
  
  // Add Robohash variations (unique robot/monster/head icons)
  options.push(`https://robohash.org/${encodeURIComponent(baseName)}?set=set1&size=256x256`) // Robots
  options.push(`https://robohash.org/${encodeURIComponent(baseName)}?set=set2&size=256x256`) // Monsters
  options.push(`https://robohash.org/${encodeURIComponent(baseName)}?set=set3&size=256x256`) // Robot heads
  options.push(`https://robohash.org/${encodeURIComponent(baseName)}?set=set4&size=256x256`) // Cats
  
  // Add Boring Avatars (professional geometric patterns)
  const boringStyles = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus']
  for (const bs of boringStyles) {
    options.push(
      `https://source.boringavatars.com/${bs}/256/${encodeURIComponent(baseName)}?colors=${colors.join(',')}`
    )
  }
  
  return options
}

/**
 * Get a similar/AI-suggested logo for cycling
 * Returns different generated logos on each call based on index
 */
async function getSimilarLogo(domain: string, index: number = 0): Promise<string> {
  const options = generateSimilarLogos(domain)
  const selectedIndex = index % options.length
  return options[selectedIndex]
}

// ============================================================================
// TIER 7: GENERATED FALLBACK (Letter-based)
// ============================================================================

/**
 * Generate a consistent color from domain name
 */
function generateDomainColor(domain: string): string {
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Generate pleasant colors (avoiding too dark or too light)
  const hue = Math.abs(hash % 360)
  const saturation = 65 + (Math.abs(hash >> 8) % 20) // 65-85%
  const lightness = 45 + (Math.abs(hash >> 16) % 15) // 45-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Generate a placeholder icon URL using UI Avatars service
 */
function generatePlaceholderIcon(domain: string): string {
  const baseDomain = getBaseDomain(domain)
  const letter = baseDomain.charAt(0).toUpperCase()
  const color = generateDomainColor(domain)

  // Convert HSL to hex for UI Avatars
  const hexColor = hslToHex(color)

  // Use UI Avatars for a nice generated icon
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(letter)}&background=${hexColor.replace('#', '')}&color=ffffff&size=256&bold=true&format=png`
}

/**
 * Convert HSL string to hex color
 */
function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return '#6366f1' // Default indigo

  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// ============================================================================
// MAIN EXPORT: GET HIGH-QUALITY FAVICON URL
// ============================================================================

/**
 * Main function - Get high-quality favicon/logo
 *
 * MULTI-TIER WATERFALL STRATEGY:
 * Tier 0: Domain overrides - Curated highest quality sources
 * Tier 1: Premium APIs - Clearbit, Logo.dev, Brandfetch
 * Tier 2: HTML Parsing - apple-touch-icon, og:image, manifest.json
 * Tier 3: Aggregated - Unavatar, DuckDuckGo
 * Tier 4: Standard - favicon.ico from domain root
 * Tier 5: Google - Reliable fallback
 * Tier 6: Generated - Letter-based placeholder
 */
export async function getFaviconUrl(url: string): Promise<string> {
  const domain = extractDomain(url)
  const baseDomain = getBaseDomain(domain)

  if (!domain) {
    console.error('[Favicon] Invalid URL')
    return generatePlaceholderIcon('unknown')
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('[Favicon Service] Fetching high-quality logo for:', domain)
  console.log('═══════════════════════════════════════════════════════════')

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 0: Check domain overrides (highest priority - curated sources)
  // ─────────────────────────────────────────────────────────────────────────
  if (DOMAIN_OVERRIDES[domain]) {
    console.log('[Tier 0 - Override] ✓ Using curated high-quality source')
    return DOMAIN_OVERRIDES[domain]
  }
  // Also check base domain
  if (DOMAIN_OVERRIDES[baseDomain]) {
    console.log('[Tier 0 - Override] ✓ Using curated source for base domain')
    return DOMAIN_OVERRIDES[baseDomain]
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 1: Premium Logo APIs (parallel requests for speed)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 1] Trying premium logo APIs...')

  // Try Clearbit first (usually has best quality)
  const clearbitLogo = await tryClearbitLogo(domain)
  if (clearbitLogo) return clearbitLogo

  // Try Logo.dev
  const logoDevLogo = await tryLogoDev(domain)
  if (logoDevLogo) return logoDevLogo

  // Try Brandfetch
  const brandfetchLogo = await tryBrandfetch(domain)
  if (brandfetchLogo) return brandfetchLogo

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 2: Parse website HTML for high-res icons
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 2] Parsing website HTML for icons...')
  const htmlIcon = await tryParseWebsiteIcons(url, domain)
  if (htmlIcon) return htmlIcon

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 3: Aggregated services
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 3] Trying aggregated services...')

  const unavatarLogo = await tryUnavatar(domain)
  if (unavatarLogo) return unavatarLogo

  const ddgIcon = await tryDuckDuckGo(domain)
  if (ddgIcon) return ddgIcon

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 4: Standard favicon.ico
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 4] Trying standard favicon.ico...')
  const standardFavicon = await tryStandardFavicon(url)
  if (standardFavicon) return standardFavicon

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 5: Google Favicon API (reliable but lower quality)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 5] Using Google Favicon API...')
  const googleFavicon = getGoogleFavicon(domain)
  const googleResult = await validateImageUrl(googleFavicon, { ...DEFAULT_QUALITY_CONFIG, timeout: 2000 })

  if (googleResult.valid && !googleResult.isPlaceholder) {
    console.log('[Tier 5 - Google] ✓ Using Google favicon')
    return googleFavicon
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIER 6: Generated fallback (always works)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Tier 6] Generating placeholder icon...')
  const placeholder = generatePlaceholderIcon(domain)
  console.log('[Tier 6 - Generated] ✓ Created letter-based icon')

  return placeholder
}

/**
 * Backwards compatibility alias
 */
export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}

/**
 * Get favicon with quality metadata (for debugging/analytics)
 */
export async function getFaviconWithMetadata(url: string): Promise<{
  url: string
  tier: number
  source: string
  quality: string
}> {
  const domain = extractDomain(url)
  const baseDomain = getBaseDomain(domain)

  if (!domain) {
    const placeholder = generatePlaceholderIcon('unknown')
    return { url: placeholder, tier: 6, source: 'generated', quality: 'fallback' }
  }

  // Tier 0
  if (DOMAIN_OVERRIDES[domain] || DOMAIN_OVERRIDES[baseDomain]) {
    return {
      url: DOMAIN_OVERRIDES[domain] || DOMAIN_OVERRIDES[baseDomain],
      tier: 0,
      source: 'curated_override',
      quality: 'high',
    }
  }

  // Tier 1
  const clearbit = await tryClearbitLogo(domain)
  if (clearbit) return { url: clearbit, tier: 1, source: 'clearbit', quality: 'high' }

  const logoDev = await tryLogoDev(domain)
  if (logoDev) return { url: logoDev, tier: 1, source: 'logo.dev', quality: 'high' }

  const brandfetch = await tryBrandfetch(domain)
  if (brandfetch) return { url: brandfetch, tier: 1, source: 'brandfetch', quality: 'high' }

  // Tier 2
  const htmlIcon = await tryParseWebsiteIcons(url, domain)
  if (htmlIcon) return { url: htmlIcon, tier: 2, source: 'html_parse', quality: 'high' }

  // Tier 3
  const unavatar = await tryUnavatar(domain)
  if (unavatar) return { url: unavatar, tier: 3, source: 'unavatar', quality: 'medium' }

  const ddg = await tryDuckDuckGo(domain)
  if (ddg) return { url: ddg, tier: 3, source: 'duckduckgo', quality: 'medium' }

  // Tier 4
  const standard = await tryStandardFavicon(url)
  if (standard) return { url: standard, tier: 4, source: 'favicon.ico', quality: 'medium' }

  // Tier 5
  const google = getGoogleFavicon(domain)
  const googleValid = await validateImageUrl(google)
  if (googleValid.valid && !googleValid.isPlaceholder) {
    return { url: google, tier: 5, source: 'google', quality: 'low' }
  }

  // Tier 6
  const placeholder = generatePlaceholderIcon(domain)
  return { url: placeholder, tier: 6, source: 'generated', quality: 'fallback' }
}

/**
 * Source definition for cycling through alternatives
 */
interface FaviconSource {
  id: string
  tier: number
  name: string
  fetcher: () => Promise<string | null>
}

/**
 * Get ALL available favicon sources for a URL
 * Returns an array of all sources that have valid favicons
 * Used for cycling through alternatives when user wants a different logo
 */
export async function getAllAvailableFavicons(url: string): Promise<Array<{
  url: string
  tier: number
  source: string
  quality: string
}>> {
  const domain = extractDomain(url)
  const baseDomain = getBaseDomain(domain)
  const results: Array<{ url: string; tier: number; source: string; quality: string }> = []

  if (!domain) {
    return [{ url: generatePlaceholderIcon('unknown'), tier: 6, source: 'generated', quality: 'fallback' }]
  }

  console.log('\n[Favicon Service] Gathering ALL available logos for:', domain)

  // Tier 0: Domain overrides
  if (DOMAIN_OVERRIDES[domain]) {
    results.push({ url: DOMAIN_OVERRIDES[domain], tier: 0, source: 'curated_override', quality: 'high' })
  } else if (DOMAIN_OVERRIDES[baseDomain]) {
    results.push({ url: DOMAIN_OVERRIDES[baseDomain], tier: 0, source: 'curated_override', quality: 'high' })
  }

  // Tier 1: Premium APIs (check all in parallel)
  const [clearbit, logoDev, brandfetch] = await Promise.all([
    tryClearbitLogo(domain),
    tryLogoDev(domain),
    tryBrandfetch(domain),
  ])

  if (clearbit) results.push({ url: clearbit, tier: 1, source: 'clearbit', quality: 'high' })
  if (logoDev) results.push({ url: logoDev, tier: 1, source: 'logo.dev', quality: 'high' })
  if (brandfetch) results.push({ url: brandfetch, tier: 1, source: 'brandfetch', quality: 'high' })

  // Tier 2: HTML parsing
  const htmlIcon = await tryParseWebsiteIcons(url, domain)
  if (htmlIcon) results.push({ url: htmlIcon, tier: 2, source: 'html_parse', quality: 'high' })

  // Tier 3: Aggregated services
  const [unavatar, ddg] = await Promise.all([
    tryUnavatar(domain),
    tryDuckDuckGo(domain),
  ])

  if (unavatar) results.push({ url: unavatar, tier: 3, source: 'unavatar', quality: 'medium' })
  if (ddg) results.push({ url: ddg, tier: 3, source: 'duckduckgo', quality: 'medium' })

  // Tier 4: Standard favicon
  const standard = await tryStandardFavicon(url)
  if (standard) results.push({ url: standard, tier: 4, source: 'favicon.ico', quality: 'medium' })

  // Tier 5: Google
  const google = getGoogleFavicon(domain)
  const googleValid = await validateImageUrl(google)
  if (googleValid.valid && !googleValid.isPlaceholder) {
    results.push({ url: google, tier: 5, source: 'google', quality: 'low' })
  }

  // Tier 6: Similar/AI-Suggested logos (multiple options for variety)
  const similarLogos = generateSimilarLogos(domain)
  const similarSources = [
    'similar_themed',      // Best matching theme
    'similar_robot',       // Tech/robot style
    'similar_geometric',   // Shapes
    'similar_character',   // Character/avatar
    'similar_friendly',    // Friendly face
    'similar_abstract',    // Abstract patterns
  ]
  
  // Add 6 similar logo options
  for (let i = 0; i < Math.min(6, similarLogos.length); i++) {
    results.push({ 
      url: similarLogos[i], 
      tier: 6, 
      source: similarSources[i] || `similar_${i + 1}`,
      quality: 'generated' 
    })
  }

  // Tier 7: Letter-based fallback (always add as last resort)
  results.push({ url: generatePlaceholderIcon(domain), tier: 7, source: 'letter_icon', quality: 'fallback' })

  console.log(`[Favicon Service] Found ${results.length} available sources`)

  return results
}

/**
 * Get the next available favicon, skipping the current one
 * Cycles through all available sources
 */
export async function getNextFavicon(
  url: string,
  currentFavicon: string | null
): Promise<{
  url: string
  tier: number
  source: string
  quality: string
  index: number
  totalOptions: number
}> {
  const allOptions = await getAllAvailableFavicons(url)

  if (allOptions.length === 0) {
    const domain = extractDomain(url)
    const placeholder = generatePlaceholderIcon(domain || 'unknown')
    return { url: placeholder, tier: 6, source: 'generated', quality: 'fallback', index: 0, totalOptions: 1 }
  }

  // Find current favicon in options
  let currentIndex = -1
  if (currentFavicon) {
    currentIndex = allOptions.findIndex(opt => opt.url === currentFavicon)
  }

  // Get next option (cycle back to start if at end)
  const nextIndex = (currentIndex + 1) % allOptions.length
  const nextOption = allOptions[nextIndex]

  console.log(`[Favicon Service] Cycling from option ${currentIndex + 1} to ${nextIndex + 1} of ${allOptions.length}`)

  return {
    ...nextOption,
    index: nextIndex,
    totalOptions: allOptions.length,
  }
}
