/**
 * Health Check API Endpoint
 * Provides system health status for monitoring and load balancers
 * 
 * GET /api/health - Returns health status of all system components
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      latency?: number
      error?: string
    }
    memory: {
      status: 'healthy' | 'warning' | 'critical'
      heapUsed: number
      heapTotal: number
      rss: number
      percentUsed: number
    }
  }
}

const startTime = Date.now()

export async function GET() {
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: { status: 'unhealthy' },
      memory: { status: 'healthy', heapUsed: 0, heapTotal: 0, rss: 0, percentUsed: 0 },
    },
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart
    
    health.checks.database = {
      status: 'healthy',
      latency: dbLatency,
    }
  } catch (error) {
    health.status = 'unhealthy'
    health.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed',
    }
  }

  // Check memory usage
  const memUsage = process.memoryUsage()
  const percentUsed = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  health.checks.memory = {
    status: percentUsed > 90 ? 'critical' : percentUsed > 70 ? 'warning' : 'healthy',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    percentUsed: Math.round(percentUsed),
  }

  // Update overall status based on checks
  if (health.checks.database.status === 'unhealthy') {
    health.status = 'unhealthy'
  } else if (health.checks.memory.status === 'critical') {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

