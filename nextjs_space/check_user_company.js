const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'khouston@thebasketballfactorynj.com' }
    })
    
    if (!user) {
      console.log('User not found!')
      return
    }
    
    console.log('User found:', { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier })
    
    // Check companies
    const companies = await prisma.company.findMany({
      where: { ownerId: user.id }
    })
    
    console.log(`\nCompanies for user: ${companies.length}`)
    companies.forEach(c => {
      console.log(`  - ${c.name} (ID: ${c.id})`)
    })
    
    // Check bookmarks
    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: user.id }
    })
    
    console.log(`\nTotal bookmarks: ${bookmarksCount}`)
    
    // Check bookmarks with companyId
    const bookmarksWithCompany = await prisma.bookmark.count({
      where: { 
        userId: user.id,
        companyId: { not: null }
      }
    })
    
    console.log(`Bookmarks with companyId: ${bookmarksWithCompany}`)
    
    // Check bookmarks without companyId
    const bookmarksWithoutCompany = await prisma.bookmark.count({
      where: { 
        userId: user.id,
        companyId: null
      }
    })
    
    console.log(`Bookmarks without companyId: ${bookmarksWithoutCompany}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
