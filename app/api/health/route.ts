import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const checks = {
      environment: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      databaseUrlFormat: process.env.DATABASE_URL
        ? (process.env.DATABASE_URL.includes('/') ? 'Has database name' : 'Missing database name')
        : 'Not set',
      prismaClient: 'unknown',
    };

    // Try to import Prisma
    try {
      const { prisma } = await import('@/app/lib/prisma');
      // Try a simple query
      await prisma.$connect();
      checks.prismaClient = 'connected';
      await prisma.$disconnect();
    } catch (error) {
      checks.prismaClient = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      status: 'ok',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



