// prisma/seed.ts

import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const roundsOfHashing = 8;

  const user1 = await prisma.user.upsert({
    where: { email: 'testuser1@example.com' },
    update: {},
    create: {
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password1', roundsOfHashing),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'testuser2@example.com' },
    update: {},
    create: {
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password1', roundsOfHashing),
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
