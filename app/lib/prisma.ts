import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaInstance = globalForPrisma.prisma;

if (!prismaInstance) {
  try {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
    });
  } catch (error) {
    console.error('[PRISMA] Failed to initialize PrismaClient:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize Prisma Client: ${errorMessage}`);
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;

