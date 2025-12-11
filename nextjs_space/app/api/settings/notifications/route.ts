import { NextRequest, NextResponse } from 'next/server';
import { getDevSession } from '@/lib/dev-auth';
import { prisma } from '@/lib/db';

// Default notification settings
const defaultSettings = {
  // Channels
  emailNotifications: true,
  inAppNotifications: true,
  pushNotifications: false,
  
  // Event types
  newAIRecommendations: true,
  weeklyDigest: true,
  timeCapsuleReminders: true,
  collaborativeInvites: true,
  analyticsAlerts: false,
  brokenLinkAlerts: true,
  bookmarkReminders: true,
  securityAlerts: true,
  
  // Quiet hours
  quietHours: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursWeekends: true,
  
  // Digest scheduling
  digestFrequency: 'weekly',
  digestDay: 'monday',
  digestTime: '09:00',
  
  // Sound & Vibration
  soundEnabled: true,
  soundVolume: 50,
  vibrationEnabled: true,
  
  // Do Not Disturb
  dndEnabled: false,
  dndScheduled: false,
  dndStart: '22:00',
  dndEnd: '08:00',
  
  // Email preferences
  emailDigest: true,
  emailImmediate: false,
  unsubscribeToken: null,
};

// GET - Fetch notification settings
export async function GET(request: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, notificationSettings: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse existing settings or use defaults
    let settings = defaultSettings;
    if (user.notificationSettings) {
      try {
        const parsed = typeof user.notificationSettings === 'string' 
          ? JSON.parse(user.notificationSettings)
          : user.notificationSettings;
        settings = { ...defaultSettings, ...parsed };
      } catch (e) {
        console.error('Failed to parse notification settings:', e);
      }
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[NOTIFICATION_SETTINGS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

// POST - Save notification settings
export async function POST(request: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Merge with defaults to ensure all fields exist
    const settings = { ...defaultSettings, ...body };

    // Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationSettings: JSON.stringify(settings)
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[NOTIFICATION_SETTINGS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to save notification settings' },
      { status: 500 }
    );
  }
}

// PUT - Update specific notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getDevSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, notificationSettings: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates = await request.json();
    
    // Get existing settings
    let existingSettings = defaultSettings;
    if (user.notificationSettings) {
      try {
        const parsed = typeof user.notificationSettings === 'string'
          ? JSON.parse(user.notificationSettings)
          : user.notificationSettings;
        existingSettings = { ...defaultSettings, ...parsed };
      } catch (e) {
        console.error('Failed to parse existing notification settings:', e);
      }
    }

    // Merge updates
    const settings = { ...existingSettings, ...updates };

    // Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationSettings: JSON.stringify(settings)
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[NOTIFICATION_SETTINGS_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}




