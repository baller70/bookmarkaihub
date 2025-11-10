
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
      label: 'TASK',
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
    // New tools
    {
      key: 'todo',
      label: 'TO-DO LIST',
      icon: 'ListTodo',
      isDefault: false,
      isSystem: false,
    },
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
