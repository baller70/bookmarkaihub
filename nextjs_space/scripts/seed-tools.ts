
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default bookmark tools...')

  // Define default tools
  const defaultTools = [
    {
      key: 'overview',
      label: 'OVERVIEW',
      icon: 'Info',
      isDefault: true,
      isSystem: true,
    },
    {
      key: 'arp',
      label: 'ARP',
      icon: 'FileText',
      isDefault: true,
      isSystem: true,
    },
    {
      key: 'notification',
      label: 'NOTIFICATION',
      icon: 'Bell',
      isDefault: true,
      isSystem: true,
    },
    {
      key: 'task',
      label: 'TASK + TIMER',
      icon: 'CheckSquare',
      isDefault: true,
      isSystem: true,
    },
    {
      key: 'media',
      label: 'MEDIA',
      icon: 'Image',
      isDefault: true,
      isSystem: true,
    },
    {
      key: 'comment',
      label: 'COMMENT',
      icon: 'MessageSquare',
      isDefault: true,
      isSystem: true,
    },
    // Individual task management tools
    {
      key: 'tasks',
      label: 'TASKS',
      icon: 'ListChecks',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'lists',
      label: 'LISTS',
      icon: 'ListTodo',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'timer',
      label: 'TIMER',
      icon: 'Timer',
      isDefault: false,
      isSystem: false,
    },
    // Other custom tools
    {
      key: 'notes',
      label: 'QUICK NOTES',
      icon: 'StickyNote',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'habits',
      label: 'HABITS',
      icon: 'Target',
      isDefault: false,
      isSystem: false,
    },
    // NEW TOOLS - Phase 1 & 2
    // PRO TIER TOOLS
    {
      key: 'reading-progress',
      label: 'READING PROGRESS',
      icon: 'Book',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'code-snippets',
      label: 'CODE SNIPPETS',
      icon: 'Code',
      isDefault: false,
      isSystem: false,
    },
    // ELITE TIER TOOLS
    {
      key: 'highlights',
      label: 'WEB HIGHLIGHTS',
      icon: 'Highlighter',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'ai-summary',
      label: 'AI SUMMARY',
      icon: 'Sparkles',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'version-monitor',
      label: 'VERSION MONITOR',
      icon: 'GitBranch',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'price-tracker',
      label: 'PRICE TRACKER',
      icon: 'DollarSign',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'related-resources',
      label: 'RELATED RESOURCES',
      icon: 'Link2',
      isDefault: false,
      isSystem: false,
    },
    {
      key: 'bookmark-share',
      label: 'SHARING',
      icon: 'Share2',
      isDefault: false,
      isSystem: false,
    },
  ]

  for (const tool of defaultTools) {
    await prisma.bookmarkTool.upsert({
      where: { key: tool.key },
      update: tool,
      create: tool,
    })
  }

  console.log('✅ Default tools seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding tools:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
