import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no definida');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const userHash = await bcrypt.hash('User1234!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin Demo',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'User Demo',
      passwordHash: userHash,
      role: 'USER',
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project-id' },
    update: { name: 'DEMO' },
    create: { id: 'demo-project-id', name: 'DEMO' },
  });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: project.id, userId: admin.id } },
    update: { role: 'ADMIN' },
    create: { projectId: project.id, userId: admin.id, role: 'ADMIN' },
  });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: project.id, userId: user.id } },
    update: { role: 'USER' },
    create: { projectId: project.id, userId: user.id, role: 'USER' },
  });

  // TODO: buildings, floors, devices, cables
  // Recomendación: crear IDs fijos para seed

  console.log('Seed Completado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
