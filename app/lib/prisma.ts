import { PrismaClient as PrismaClientType } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType;
};

let prismaInstance: PrismaClientType;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClientType({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.error('[PRISMA] Failed to initialize PrismaClient:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(`Failed to initialize Prisma Client: ${errorMessage}`);
}

export const prisma = prismaInstance;

