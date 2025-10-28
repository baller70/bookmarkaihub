import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.count()
  const bookmarks = await prisma.bookmark.count()
  const categories = await prisma.category.count()
  const folders = await prisma.categoryFolder.count()
  const analytics = await prisma.analytics.count()
  
  console.log('Database counts:')
  console.log('Users:', users)
  console.log('Bookmarks:', bookmarks)
  console.log('Categories:', categories)
  console.log('Folders:', folders)
  console.log('Analytics:', analytics)
  
  const allUsers = await prisma.user.findMany()
  console.log('\nUsers in database:')
  allUsers.forEach(user => {
    console.log(`- ${user.email} (id: ${user.id})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
