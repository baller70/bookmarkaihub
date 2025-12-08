import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limit store (resets on server restart)
// For production at scale, consider using Redis
const rateLimitStore = new Map<string, { count: number; timestamp: number }>()

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Auth endpoints: stricter limits to prevent brute force
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 requests per 15 min
  // API endpoints: moderate limits
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  // General requests: generous limits
  general: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests per minute
}

// Clean up old entries periodically (simple garbage collection)
function cleanupRateLimitStore() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.timestamp > maxAge) {
      rateLimitStore.delete(key)
    }
  }
}

// Get client identifier (IP or fallback)
function getClientIdentifier(request: NextRequest): string {
  // Try various headers for real IP behind proxies
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  return cfConnectingIp || realIp || forwarded?.split(',')[0]?.trim() || 'anonymous'
}

// Check rate limit for a specific client and endpoint type
function checkRateLimit(
  clientId: string,
  endpointType: 'auth' | 'api' | 'general'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMIT_CONFIG[endpointType]
  const key = `${clientId}:${endpointType}`
  const now = Date.now()
  
  const current = rateLimitStore.get(key)
  
  if (!current || now - current.timestamp >= config.windowMs) {
    // Window expired or new client, reset counter
    rateLimitStore.set(key, { count: 1, timestamp: now })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }
  
  if (current.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetIn = config.windowMs - (now - current.timestamp)
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    }
  }
  
  // Increment counter
  current.count++
  rateLimitStore.set(key, current)
  
  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetIn: config.windowMs - (now - current.timestamp),
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Periodic cleanup (roughly every 100 requests)
  if (Math.random() < 0.01) {
    cleanupRateLimitStore()
  }
  
  // Skip rate limiting for static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }
  
  const clientId = getClientIdentifier(request)
  
  // Determine endpoint type for rate limiting
  let endpointType: 'auth' | 'api' | 'general' = 'general'
  
  if (pathname.startsWith('/api/auth')) {
    endpointType = 'auth'
  } else if (pathname.startsWith('/api')) {
    endpointType = 'api'
  }
  
  const rateLimitResult = checkRateLimit(clientId, endpointType)
  
  // Create response with rate limit headers
  const response = rateLimitResult.allowed
    ? NextResponse.next()
    : NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitResult.resetIn / 1000)} seconds.`
        },
        { status: 429 }
      )
  
  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG[endpointType].maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetIn / 1000)))
  
  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

