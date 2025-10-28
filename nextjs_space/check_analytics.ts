import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const analytics = await prisma.analytics.findMany({
    take: 5,
    orderBy: {
      date: 'desc'
    }
  })
  
  console.log('\nRecent Analytics entries:')
  analytics.forEach(a => {
    console.log(`- Date: ${a.date.toISOString().split('T')[0]}, Bookmark: ${a.bookmarkId}, Visits: ${a.totalVisits}, Time: ${a.totalTimeSpent}m`)
  })
  
  console.log(`\nTotal analytics entries: ${await prisma.analytics.count()}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
