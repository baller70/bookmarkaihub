import { NextRequest, NextResponse } from 'next/server'
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getActiveCompanyId } from '@/lib/company'

// POST - Create a new bulk upload log
export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const companyId = await getActiveCompanyId(userId)
    
    const body = await request.json()
    const {
      totalLinks,
      successCount,
      failedCount,
      duplicateCount,
      skippedCount,
      settings,
      source,
      importMethod,
      linksData
    } = body

    // Create the log entry
    const log = await prisma.bulkUploadLog.create({
      data: {
        userId,
        companyId,
        totalLinks,
        successCount,
        failedCount,
        duplicateCount,
        skippedCount,
        settings: settings || {},
        source: source || 'bulk_uploader',
        importMethod,
        linksData: linksData || []
      }
    })

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error('Bulk upload log error:', error)
    return NextResponse.json(
      { error: 'Failed to log bulk upload' },
      { status: 500 }
    )
  }
}

// GET - Retrieve bulk upload logs
export async function GET(request: NextRequest) {
  try {
    const session = await getDevSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const companyId = await getActiveCompanyId(userId)
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Fetch logs for the user and active company
    const logs = await prisma.bulkUploadLog.findMany({
      where: {
        userId,
        companyId: companyId || undefined
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Fetch upload logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upload logs' },
      { status: 500 }
    )
  }
}
