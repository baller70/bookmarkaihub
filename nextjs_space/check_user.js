const { PrismaClient } = require('@prisma/client');
require('dotenv/config');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'khouston@thebasketballfactorynj.com' },
    select: {
      id: true,
      email: true,
      name: true,
      fullName: true,
      isAdmin: true,
      subscriptionTier: true,
      _count: {
        select: {
          bookmarks: true,
          categories: true,
          companies: true,
        }
      }
    }
  });
  
  console.log('User found:', JSON.stringify(user, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
