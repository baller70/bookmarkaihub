import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Productivity',
    description: 'Tools and resources to boost your productivity',
    icon: 'zap'
  },
  {
    name: 'Development',
    description: 'Development tools, frameworks, and resources',
    icon: 'code'
  },
  {
    name: 'Design',
    description: 'Design tools, inspiration, and resources',
    icon: 'palette'
  },
  {
    name: 'Marketing',
    description: 'Marketing tools and strategies',
    icon: 'megaphone'
  },
  {
    name: 'AI & Machine Learning',
    description: 'AI tools and machine learning resources',
    icon: 'bot'
  },
  {
    name: 'Business',
    description: 'Business tools and resources',
    icon: 'briefcase'
  },
  {
    name: 'Learning',
    description: 'Educational resources and courses',
    icon: 'graduation-cap'
  },
  {
    name: 'Entertainment',
    description: 'Entertainment and media resources',
    icon: 'film'
  }
];

async function main() {
  console.log('Seeding marketplace categories...');

  for (const category of categories) {
    await prisma.marketplaceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
    console.log(`✓ Created/updated category: ${category.name}`);
  }

  console.log('✅ Marketplace categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding marketplace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
