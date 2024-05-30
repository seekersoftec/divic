// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // Replace "User" with your actual model name
  const user1 = await prisma.user.upsert({
    where: { email: 'testuser1@example.com' }, // Unique identifier for your user model
    update: {},
    create: {
      email: 'testuser1@example.com',
      password: 'hashed_password1', // Replace with a hashed password
      // other user fields
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'testuser2@example.com' }, // Unique identifier for your user model
    update: {},
    create: {
      email: 'testuser2@example.com',
      password: 'hashed_password2', // Replace with a hashed password
      // other user fields
    },
  });

  console.log({ user1, user2 });
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma Client at the end
    await prisma.$disconnect();
  });
