import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { prisma } from '@/lib/db';

// POST - Send test notification
export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();

    switch (type) {
      case 'email':
        // In production, this would send an actual email
        // For now, we'll simulate the delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Log the test notification
        console.log(`[TEST_EMAIL] Sending test email to ${session.user.email}`);
        
        return NextResponse.json({ 
          success: true, 
          message: `Test email sent to ${session.user.email}`,
          type: 'email'
        });

      case 'push':
        // In production, this would trigger a push notification via a service worker
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`[TEST_PUSH] Triggering push notification for ${session.user.email}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Push notification triggered',
          type: 'push'
        });

      case 'in-app':
        // In-app notifications are handled client-side
        return NextResponse.json({ 
          success: true, 
          message: 'In-app notification will be shown',
          type: 'in-app'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[NOTIFICATION_TEST]', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}




