
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default bookmark tools...')

  // Define all 22 tools
  // ORIGINAL 10 TOOLS TO KEEP:
  // 1. Notification
  // 2. Tasks
  // 3. Timer
  // 4. Media
  // 5. Comment
  // 6. To-Do Lists (renamed from Lists)
  // 7. Notes (renamed from Quick Notes)
  // 8. Habits
  // 9. AI Summary
  // 10. Time Tracking (kept from user approval)
  
  // NEW 12 TOOLS:
  // 11. E-Signatures
  // 12. Mind Map
  // 13. Vision Board
  // 14. Reminders & Follow-ups
  // 15. File Locker
  // 16. Calendar & Deadlines
  // 17. Contacts & Stakeholders
  // 18. Checklists & Templates
  // 19. Sharing & Permissions
  // 20. Comments + @Mentions (enhanced from Comment)
  // 21. Links & References Hub
  // 22. Export & Snapshot

  const defaultTools = [
    // === SYSTEM TOOLS (Always visible by default) ===
    {
      key: 'overview',
      label: 'OVERVIEW',
      description: 'View and edit bookmark details, tags, and notes',
      icon: 'Info',
      isDefault: true,
      isSystem: true,
      category: 'core',
    },
    
    // === ORIGINAL 10 TOOLS ===
    {
      key: 'notification',
      label: 'NOTIFICATION',
      description: 'Set reminders and alerts for this bookmark',
      icon: 'Bell',
      isDefault: true,
      isSystem: true,
      category: 'productivity',
    },
    {
      key: 'tasks',
      label: 'TASKS',
      description: 'Create and manage tasks related to this bookmark',
      icon: 'ListChecks',
      isDefault: true,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'timer',
      label: 'TIMER',
      description: 'Pomodoro timer for focused work sessions',
      icon: 'Timer',
      isDefault: true,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'media',
      label: 'MEDIA',
      description: 'Attach images, screenshots, and files',
      icon: 'Image',
      isDefault: true,
      isSystem: true,
      category: 'content',
    },
    {
      key: 'comment',
      label: 'COMMENT',
      description: 'Add comments and discussions',
      icon: 'MessageSquare',
      isDefault: true,
      isSystem: true,
      category: 'collaboration',
    },
    {
      key: 'todo-lists',
      label: 'TO-DO LISTS',
      description: 'Create simple to-do lists and checklists',
      icon: 'ListTodo',
      isDefault: true,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'notes',
      label: 'NOTES',
      description: 'Quick notes and scratch pad',
      icon: 'StickyNote',
      isDefault: true,
      isSystem: false,
      category: 'content',
    },
    {
      key: 'habits',
      label: 'HABITS',
      description: 'Track habits and streaks related to this bookmark',
      icon: 'Target',
      isDefault: false,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'ai-summary',
      label: 'AI SUMMARY',
      description: 'AI-generated summary and key points',
      icon: 'Sparkles',
      isDefault: true,
      isSystem: false,
      category: 'ai',
    },
    {
      key: 'time-tracking',
      label: 'TIME TRACKING',
      description: 'Track time spent and generate billing reports',
      icon: 'Clock',
      isDefault: false,
      isSystem: false,
      category: 'productivity',
    },
    
    // === NEW 12 TOOLS ===
    {
      key: 'e-signatures',
      label: 'E-SIGNATURES',
      description: 'Send documents for signature and track status',
      icon: 'PenLine',
      isDefault: false,
      isSystem: false,
      category: 'documents',
    },
    {
      key: 'mind-map',
      label: 'MIND MAP',
      description: 'Visual brainstorming and idea mapping',
      icon: 'GitFork',
      isDefault: false,
      isSystem: false,
      category: 'creativity',
    },
    {
      key: 'vision-board',
      label: 'VISION BOARD',
      description: 'Create visual boards with images and goals',
      icon: 'LayoutGrid',
      isDefault: false,
      isSystem: false,
      category: 'creativity',
    },
    {
      key: 'reminders',
      label: 'REMINDERS',
      description: 'Set follow-up reminders and recurring alerts',
      icon: 'AlarmClock',
      isDefault: false,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'file-locker',
      label: 'FILE LOCKER',
      description: 'Securely store and organize files',
      icon: 'FolderLock',
      isDefault: false,
      isSystem: false,
      category: 'documents',
    },
    {
      key: 'calendar',
      label: 'CALENDAR',
      description: 'Track deadlines, events, and milestones',
      icon: 'CalendarDays',
      isDefault: false,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'contacts',
      label: 'CONTACTS',
      description: 'Manage stakeholders and contact info',
      icon: 'Users',
      isDefault: false,
      isSystem: false,
      category: 'collaboration',
    },
    {
      key: 'checklists',
      label: 'CHECKLISTS',
      description: 'Reusable checklist templates',
      icon: 'ClipboardCheck',
      isDefault: false,
      isSystem: false,
      category: 'productivity',
    },
    {
      key: 'sharing',
      label: 'SHARING',
      description: 'Share bookmark and manage permissions',
      icon: 'Share2',
      isDefault: false,
      isSystem: false,
      category: 'collaboration',
    },
    {
      key: 'links-hub',
      label: 'LINKS HUB',
      description: 'Curate related links and references',
      icon: 'Link2',
      isDefault: false,
      isSystem: false,
      category: 'content',
    },
    {
      key: 'export',
      label: 'EXPORT',
      description: 'Export bookmark data to PDF/CSV/JSON',
      icon: 'Download',
      isDefault: false,
      isSystem: false,
      category: 'utility',
    },
  ]

  for (const tool of defaultTools) {
    await prisma.bookmarkTool.upsert({
      where: { key: tool.key },
      update: {
        label: tool.label,
        description: tool.description,
        icon: tool.icon,
        isDefault: tool.isDefault,
        isSystem: tool.isSystem,
        category: tool.category,
      },
      create: tool,
    })
  }

  // Clean up old tools that are no longer needed
  const oldToolKeys = ['arp', 'task', 'lists', 'reading-progress', 'code-snippets', 'highlights', 'version-monitor', 'price-tracker', 'related-resources', 'bookmark-share']
  
  for (const key of oldToolKeys) {
    try {
      await prisma.bookmarkTool.delete({
        where: { key }
      })
      console.log(`Deleted old tool: ${key}`)
    } catch (e) {
      // Tool might not exist, ignore
    }
  }

  console.log('✅ All 22 tools seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding tools:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
