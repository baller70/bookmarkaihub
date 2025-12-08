# Cloudflare Configuration Guide for BookmarkHub

This guide provides step-by-step instructions for configuring Cloudflare to protect your BookmarkHub application with DDoS protection, CDN, and security features.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Your domain name (e.g., `bookmarkhub.com`)
- Access to your domain registrar's DNS settings

## Step 1: Add Your Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter your domain name (e.g., `bookmarkhub.com`)
4. Select the **Free** plan
5. Cloudflare will scan your existing DNS records

## Step 2: Update Your Nameservers

1. Cloudflare will provide you with two nameservers (e.g., `ada.ns.cloudflare.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Replace your current nameservers with Cloudflare's nameservers
4. Wait 24-48 hours for propagation (usually faster)

## Step 3: Configure DNS Records

In Cloudflare DNS settings, ensure these records exist:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | Your server IP | ✅ Proxied (orange cloud) |
| A | www | Your server IP | ✅ Proxied (orange cloud) |
| CNAME | api | @ | ✅ Proxied (if separate API subdomain) |

**Important**: The orange cloud (Proxied) enables Cloudflare's protection. Gray cloud bypasses it.

## Step 4: SSL/TLS Settings

Navigate to **SSL/TLS** in the sidebar:

### Overview Tab
- Set encryption mode to **Full (strict)**
- This ensures end-to-end encryption

### Edge Certificates Tab
- ✅ Enable **Always Use HTTPS**
- ✅ Enable **Automatic HTTPS Rewrites**
- Set **Minimum TLS Version** to **TLS 1.2**

### Origin Server Tab
- Create an **Origin Certificate** if your host doesn't have one
- This creates a free SSL certificate for your origin server

## Step 5: Security Settings

Navigate to **Security** in the sidebar:

### Settings Tab
- Set **Security Level** to **Medium** (adjust based on traffic)
- ✅ Enable **Browser Integrity Check**
- Set **Challenge Passage** to **30 minutes**

### DDoS Tab
- DDoS protection is **automatically enabled** on all plans
- Review **DDoS Override** settings if you have specific needs

### Bots Tab (Free features)
- ✅ Enable **Bot Fight Mode**
- This blocks known bad bots automatically

## Step 6: Configure Firewall Rules (WAF)

Navigate to **Security > WAF**:

### Managed Rules (Free tier)
Enable these free managed rulesets:
- ✅ Cloudflare Managed Ruleset
- ✅ Cloudflare OWASP Core Ruleset

### Custom Rules (Create these)

**Rule 1: Block Bad Countries** (if applicable)
```
Expression: (ip.geoip.country in {"CN" "RU" "KP"})
Action: Block
```
*Note: Adjust countries based on your user base*

**Rule 2: Rate Limit Login Attempts**
```
Expression: (http.request.uri.path contains "/api/auth")
Action: Challenge (CAPTCHA)
Rate: 10 requests per minute
```

**Rule 3: Block Known Attack Patterns**
```
Expression: (http.request.uri.query contains "SELECT" or http.request.uri.query contains "UNION")
Action: Block
```

## Step 7: Speed Optimization

Navigate to **Speed** in the sidebar:

### Optimization Tab
- ✅ Enable **Auto Minify** for JavaScript, CSS, HTML
- ✅ Enable **Brotli** compression
- ✅ Enable **Early Hints**
- ✅ Enable **Rocket Loader** (test first - may break some JS)

### Caching Tab
Navigate to **Caching > Configuration**:
- Set **Browser Cache TTL** to **4 hours**
- Set **Caching Level** to **Standard**

## Step 8: Page Rules (Optional but Recommended)

Navigate to **Rules > Page Rules**:

**Rule 1: Cache Static Assets**
```
URL: *bookmarkhub.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

**Rule 2: Bypass Cache for API**
```
URL: *bookmarkhub.com/api/*
Settings:
  - Cache Level: Bypass
```

**Rule 3: Force HTTPS on All Pages**
```
URL: http://*bookmarkhub.com/*
Settings:
  - Always Use HTTPS
```

## Step 9: Analytics & Monitoring

Navigate to **Analytics & Logs**:

- Review **Traffic** tab for visitor insights
- Check **Security** tab for blocked threats
- Monitor **Performance** for load times

## Recommended Free Tier Settings Summary

| Setting | Recommended Value |
|---------|-------------------|
| SSL/TLS Mode | Full (strict) |
| Always Use HTTPS | ✅ Enabled |
| Minimum TLS Version | TLS 1.2 |
| Security Level | Medium |
| Bot Fight Mode | ✅ Enabled |
| Browser Integrity Check | ✅ Enabled |
| Auto Minify | ✅ JS, CSS, HTML |
| Brotli | ✅ Enabled |

## Verifying Your Setup

After configuration, verify:

1. **SSL Check**: Visit https://www.ssllabs.com/ssltest/
   - Enter your domain
   - Aim for A+ rating

2. **Security Headers**: Visit https://securityheaders.com/
   - Enter your domain
   - Should show A or A+ (our Next.js config helps here)

3. **Performance**: Visit https://www.webpagetest.org/
   - Run a test from multiple locations
   - Verify CDN is working (check response headers for `cf-ray`)

## Troubleshooting

### "Too Many Redirects" Error
- Ensure SSL mode is **Full (strict)**, not **Flexible**
- Check your origin server has a valid SSL certificate

### Origin Server Errors (5xx)
- Temporarily set SSL to **Full** (not strict) to diagnose
- Check your origin server logs

### Assets Not Loading
- Verify DNS records are proxied (orange cloud)
- Check Page Rules aren't blocking assets

## Environment Variables for Your App

No additional environment variables are needed for basic Cloudflare protection. The protection works at the DNS/network level.

However, if you want to use Cloudflare's API:

```bash
# Optional - for Cloudflare API access
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ZONE_ID=your-zone-id
```

---

## Next Steps

1. Set up [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/) for admin routes (free for up to 50 users)
2. Configure [Web Analytics](https://www.cloudflare.com/web-analytics/) (free, privacy-focused)
3. Explore [Cloudflare Workers](https://workers.cloudflare.com/) for edge computing (free tier available)

