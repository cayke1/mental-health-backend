import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: await hash('test', 8),
      },
      {
        name: 'Jane Doe',
        email: 'janedoe@gmail.com',
        password: await hash('test', 8),
      },
    ],
  });

  console.log('Users created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
