
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  // Clear existing data (optional - comment out in production)
  await prisma.bookmarkHistory.deleteMany()
  await prisma.bookmarkTag.deleteMany()
  await prisma.bookmarkCategory.deleteMany()
  await prisma.task.deleteMany()
  await prisma.note.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.analytics.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user (john@doe.com/johndoe123 - required for testing)
  const adminPassword = await bcrypt.hash('johndoe123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'John Doe',
      fullName: 'John Doe',
      isAdmin: true,
    },
  })

  // Create regular test user
  const testPassword = await bcrypt.hash('password123', 12)
  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: testPassword,
      name: 'Test User',
      fullName: 'Test User',
      isAdmin: false,
    },
  })

  console.log('✅ Created users')

  // Create categories (from inspection report)
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'AI TECHNOLOGY',
        description: 'AI-powered tools and platforms',
        color: '#3B82F6',
        icon: 'brain',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'AI AUTOMATION',
        description: 'Process automation with AI',
        color: '#8B5CF6',
        icon: 'zap',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'AI VIBE CODING',
        description: 'Development tools and coding resources',
        color: '#10B981',
        icon: 'code',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'PRODUCTIVITY TOOLS',
        description: 'Productivity and workflow enhancement',
        color: '#F59E0B',
        icon: 'briefcase',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'DESIGN',
        description: 'Design tools and inspiration',
        color: '#EF4444',
        icon: 'palette',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'SOCIAL MEDIA',
        description: 'Social networking platforms',
        color: '#06B6D4',
        icon: 'users',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ENTERTAINMENT',
        description: 'Streaming and entertainment',
        color: '#EC4899',
        icon: 'play',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'DEVELOPMENT',
        description: 'Developer tools and resources',
        color: '#6366F1',
        icon: 'terminal',
        userId: adminUser.id,
      },
    }),
  ])

  console.log('✅ Created categories')

  // Create category folders
  const folders = await Promise.all([
    prisma.categoryFolder.create({
      data: {
        name: 'Work',
        userId: adminUser.id,
      },
    }),
    prisma.categoryFolder.create({
      data: {
        name: 'Personal',
        userId: adminUser.id,
      },
    }),
    prisma.categoryFolder.create({
      data: {
        name: 'Learning',
        userId: adminUser.id,
      },
    }),
    prisma.categoryFolder.create({
      data: {
        name: 'Projects',
        userId: adminUser.id,
      },
    }),
  ])

  console.log('✅ Created category folders')

  // Assign some categories to folders
  await prisma.category.update({
    where: { id: categories[0].id }, // AI TECHNOLOGY
    data: { folderId: folders[2].id }, // Learning
  })
  await prisma.category.update({
    where: { id: categories[1].id }, // AI AUTOMATION
    data: { folderId: folders[0].id }, // Work
  })
  await prisma.category.update({
    where: { id: categories[3].id }, // PRODUCTIVITY TOOLS
    data: { folderId: folders[0].id }, // Work
  })
  await prisma.category.update({
    where: { id: categories[4].id }, // DESIGN
    data: { folderId: folders[3].id }, // Projects
  })

  console.log('✅ Assigned categories to folders')

  // Create tags with proper colors
  const tags = await Promise.all([
    // Priority tags
    prisma.tag.create({
      data: { name: 'high priority', color: '#EF4444', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'medium', color: '#F59E0B', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'low priority', color: '#10B981', userId: adminUser.id },
    }),
    // Content type tags
    prisma.tag.create({
      data: { name: 'AI', color: '#3B82F6', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'video conversion', color: '#8B5CF6', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'web development', color: '#10B981', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'content creation', color: '#F59E0B', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'productivity tools', color: '#06B6D4', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'data automation', color: '#8B5CF6', userId: adminUser.id },
    }),
    prisma.tag.create({
      data: { name: 'app integration', color: '#EC4899', userId: adminUser.id },
    }),
  ])

  console.log('✅ Created tags')

  // Create realistic bookmarks with proper favicons
  const bookmarksData = [
    {
      title: 'AMAZON',
      url: 'https://amazon.com',
      description: 'E-commerce platform for online shopping with millions of products.',
      favicon: 'https://icons.iconarchive.com/icons/uiconstock/socialmedia/512/Amazon-icon.png',
      priority: 'MEDIUM',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['productivity tools'],
      totalVisits: 45,
      engagementScore: 8,
      timeSpent: 120,
      usagePercentage: 85.5,
    },
    {
      title: 'YOUTUBE',
      url: 'https://youtube.com',
      description: 'Video sharing platform for entertainment, education, and tutorials.',
      favicon: 'https://yt3.googleusercontent.com/RC42NXRyydg7LpNQtMqspumG4sdrwORIArKZft474sPFG3cQWp5RJ1aoGNIN0GYME5zbIMB3Rw=s900-c-k-c0x00ffffff-no-rj',
      priority: 'HIGH',
      categoryName: 'ENTERTAINMENT',
      tags: ['video conversion', 'content creation'],
      totalVisits: 78,
      engagementScore: 9,
      timeSpent: 340,
      usagePercentage: 92.3,
    },
    {
      title: 'GITHUB',
      url: 'https://github.com',
      description: 'Version control and collaboration platform for developers.',
      favicon: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
      priority: 'HIGH',
      categoryName: 'DEVELOPMENT',
      tags: ['web development', 'AI'],
      totalVisits: 156,
      engagementScore: 10,
      timeSpent: 480,
      usagePercentage: 96.8,
    },
    {
      title: 'GOOGLE DRIVE',
      url: 'https://drive.google.com',
      description: 'Cloud storage and file synchronization service by Google.',
      favicon: 'https://icons.iconarchive.com/icons/marcus-roberto/google-play/512/Google-Drive-icon.png',
      priority: 'MEDIUM',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['productivity tools', 'data automation'],
      totalVisits: 89,
      engagementScore: 7,
      timeSpent: 180,
      usagePercentage: 78.4,
    },
    {
      title: 'NETFLIX',
      url: 'https://netflix.com',
      description: 'Streaming service for movies, TV shows and original content.',
      favicon: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png',
      priority: 'LOW',
      categoryName: 'ENTERTAINMENT',
      tags: ['content creation'],
      totalVisits: 34,
      engagementScore: 6,
      timeSpent: 240,
      usagePercentage: 45.2,
    },
    {
      title: 'SPOTIFY',
      url: 'https://spotify.com',
      description: 'Music streaming platform with millions of songs and podcasts.',
      favicon: 'https://files.softicons.com/download/android-icons/flat-icons-by-martz90/png/512x512/spotify.png',
      priority: 'MEDIUM',
      categoryName: 'ENTERTAINMENT',
      tags: ['content creation'],
      totalVisits: 67,
      engagementScore: 8,
      timeSpent: 160,
      usagePercentage: 71.6,
    },
    {
      title: 'TWITTER',
      url: 'https://twitter.com',
      description: 'Social networking platform for real-time news and conversations.',
      favicon: 'https://img.icons8.com/?size=1200&id=phOKFKYpe00C&format=jpg',
      priority: 'HIGH',
      categoryName: 'SOCIAL MEDIA',
      tags: ['high priority', 'app integration'],
      totalVisits: 123,
      engagementScore: 9,
      timeSpent: 290,
      usagePercentage: 89.7,
    },
    {
      title: 'LINKEDIN',
      url: 'https://linkedin.com',
      description: 'Professional networking platform for career development.',
      favicon: 'https://files.softicons.com/download/social-media-icons/flat-gradient-social-icons-by-guilherme-lima/png/512x512/Linkedin.png',
      priority: 'MEDIUM',
      categoryName: 'SOCIAL MEDIA',
      tags: ['productivity tools'],
      totalVisits: 42,
      engagementScore: 7,
      timeSpent: 90,
      usagePercentage: 56.3,
    },
    {
      title: 'STACK OVERFLOW',
      url: 'https://stackoverflow.com',
      description: 'Q&A platform for programmers and developers worldwide.',
      favicon: 'https://files.softicons.com/download/social-media-icons/flat-gradient-social-icons-by-guilherme-lima/png/512x512/Stackoverflow.png',
      priority: 'HIGH',
      categoryName: 'DEVELOPMENT',
      tags: ['web development', 'AI'],
      totalVisits: 98,
      engagementScore: 9,
      timeSpent: 210,
      usagePercentage: 88.1,
    },
    {
      title: 'MEDIUM',
      url: 'https://medium.com',
      description: 'Publishing platform for writers and thought leaders.',
      favicon: 'https://www.shareicon.net/data/512x512/2016/08/22/818731_media_512x512.png',
      priority: 'MEDIUM',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['content creation', 'AI'],
      totalVisits: 51,
      engagementScore: 7,
      timeSpent: 150,
      usagePercentage: 63.8,
    },
    {
      title: 'FIGMA',
      url: 'https://figma.com',
      description: 'Collaborative interface design tool for teams.',
      favicon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/figma-color.png',
      priority: 'HIGH',
      categoryName: 'DESIGN',
      tags: ['web development', 'content creation'],
      totalVisits: 87,
      engagementScore: 9,
      timeSpent: 320,
      usagePercentage: 91.2,
    },
    {
      title: 'NOTION',
      url: 'https://notion.so',
      description: 'All-in-one workspace for notes, docs, and collaboration.',
      favicon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      priority: 'HIGH',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['productivity tools', 'data automation'],
      totalVisits: 134,
      engagementScore: 10,
      timeSpent: 410,
      usagePercentage: 94.5,
    },
    {
      title: 'SLACK',
      url: 'https://slack.com',
      description: 'Team communication and collaboration platform.',
      favicon: 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
      priority: 'MEDIUM',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['app integration', 'productivity tools'],
      totalVisits: 76,
      engagementScore: 8,
      timeSpent: 200,
      usagePercentage: 73.9,
    },
    {
      title: 'ZOOM',
      url: 'https://zoom.us',
      description: 'Video conferencing and online meeting platform.',
      favicon: 'https://icons.iconarchive.com/icons/papirus-team/papirus-apps/512/Zoom-icon.png',
      priority: 'MEDIUM',
      categoryName: 'PRODUCTIVITY TOOLS',
      tags: ['app integration'],
      totalVisits: 45,
      engagementScore: 7,
      timeSpent: 180,
      usagePercentage: 59.4,
    },
    {
      title: 'CANVA',
      url: 'https://canva.com',
      description: 'Graphic design platform with templates and tools.',
      favicon: 'https://i.pinimg.com/736x/66/dc/63/66dc63280e28a73995381700dd4a7d01.jpg',
      priority: 'MEDIUM',
      categoryName: 'DESIGN',
      tags: ['content creation'],
      totalVisits: 62,
      engagementScore: 8,
      timeSpent: 140,
      usagePercentage: 68.7,
    },
  ]

  // Create bookmarks with relationships
  for (const bookmarkData of bookmarksData) {
    const category = categories.find(c => c.name === bookmarkData.categoryName)
    const bookmarkTags = tags.filter(t => bookmarkData.tags.includes(t.name))

    const bookmark = await prisma.bookmark.create({
      data: {
        title: bookmarkData.title,
        url: bookmarkData.url,
        description: bookmarkData.description,
        favicon: bookmarkData.favicon,
        priority: bookmarkData.priority as any,
        totalVisits: bookmarkData.totalVisits,
        engagementScore: bookmarkData.engagementScore,
        timeSpent: bookmarkData.timeSpent,
        usagePercentage: bookmarkData.usagePercentage,
        lastVisited: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        openTasks: Math.floor(Math.random() * 5),
        completedTasks: Math.floor(Math.random() * 10),
        totalTasks: Math.floor(Math.random() * 15),
        userId: adminUser.id,
        categories: category ? {
          create: {
            categoryId: category.id,
          },
        } : undefined,
        tags: {
          create: bookmarkTags.map(tag => ({
            tagId: tag.id,
          })),
        },
      },
    })

    // Create some bookmark history
    await prisma.bookmarkHistory.create({
      data: {
        action: 'CREATED',
        details: 'Bookmark added to collection',
        bookmarkId: bookmark.id,
      },
    })

    // Create a sample note for some bookmarks
    if (Math.random() > 0.5) {
      await prisma.note.create({
        data: {
          content: `Notes about ${bookmarkData.title}: This is a really useful ${bookmarkData.description?.toLowerCase() || 'resource'} that I frequently use for my projects.`,
          bookmarkId: bookmark.id,
        },
      })
    }

    // Create sample tasks for some bookmarks
    if (Math.random() > 0.6) {
      await prisma.task.create({
        data: {
          title: `Review ${bookmarkData.title} features`,
          description: `Explore new features and capabilities of ${bookmarkData.title}`,
          status: Math.random() > 0.5 ? 'OPEN' : 'IN_PROGRESS',
          priority: bookmarkData.priority as any,
          bookmarkId: bookmark.id,
          pomodoroSessions: Math.floor(Math.random() * 3),
          timeSpent: Math.floor(Math.random() * 60),
        },
      })
    }
  }

  console.log('✅ Created bookmarks with relationships')

  // Create analytics data for the last 30 days
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    await prisma.analytics.create({
      data: {
        date,
        userId: adminUser.id,
        totalVisits: Math.floor(Math.random() * 50) + 10,
        engagementScore: Math.floor(Math.random() * 10) + 1,
        bookmarksAdded: Math.floor(Math.random() * 5),
        bookmarksViewed: Math.floor(Math.random() * 30) + 5,
        timeSpent: Math.floor(Math.random() * 180) + 30,
      },
    })
  }

  console.log('✅ Created analytics data')

  // Create sample goals
  await Promise.all([
    prisma.goal.create({
      data: {
        title: 'PERSISTENCE TEST',
        description: 'Testing the persistence and reliability of bookmark storage',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        progress: 65.0,
        status: 'ACTIVE',
        userId: adminUser.id,
      },
    }),
    prisma.goal.create({
      data: {
        title: 'ORGANIZE AI RESOURCES',
        description: 'Categorize and tag all AI-related bookmarks properly',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        progress: 80.0,
        status: 'ACTIVE',
        userId: adminUser.id,
      },
    }),
    prisma.goal.create({
      data: {
        title: 'COMPLETE DESIGN SYSTEM',
        description: 'Finish building the complete design system documentation',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        progress: 95.0,
        status: 'ACTIVE',
        userId: adminUser.id,
      },
    }),
  ])

  console.log('✅ Created goals')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
