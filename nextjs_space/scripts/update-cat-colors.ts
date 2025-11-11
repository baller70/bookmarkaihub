import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany()
  
  for (const category of categories) {
    // Default light green for green folders, light blue for others  
    const backgroundColor = category.color === '#22c55e' ? '#dcfce7' : '#DBEAFE'
    
    await prisma.category.update({
      where: { id: category.id },
      data: { backgroundColor }
    })
    console.log(`Updated ${category.name}`)
  }
  
  console.log('All categories updated!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
