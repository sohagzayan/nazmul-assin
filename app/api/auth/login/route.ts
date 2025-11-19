import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { createSessionToken, verifyPassword } from '@/app/lib/auth';

interface LoginPayload {
  identifier?: string;
  password?: string;
}

const COOKIE_NAME = 'task_manager_token';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const errors: Record<string, string> = {};

    if (!body.identifier || body.identifier.trim().length === 0) {
      errors.identifier = 'Username or email is required.';
    }

    if (!body.password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Invalid form data.', errors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: body.identifier },
          { email: body.identifier?.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid credentials.',
          errors: { identifier: 'No account found for that username/email.' },
        },
        { status: 401 }
      );
    }

    const passwordsMatch = await verifyPassword(
      body.password!,
      user.password
    );

    if (!passwordsMatch) {
      return NextResponse.json(
        {
          error: 'Invalid credentials.',
          errors: { password: 'Incorrect password.' },
        },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);
    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    // Enhanced error logging for production debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log full error details (visible in Vercel logs)
    console.error('[LOGIN ERROR]', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
      env: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
    
    // Check for common production issues
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('PrismaClient') || errorMessage.includes('prisma')) {
      return NextResponse.json(
        { 
          error: 'Database configuration error. Please check DATABASE_URL environment variable.',
          details: errorMessage,
          type: 'database_error'
        },
        { status: 500 }
      );
    }
    
    // Check if it's a JWT secret issue
    if (errorMessage.includes('JWT_SECRET') || errorMessage.includes('secret')) {
      return NextResponse.json(
        { 
          error: 'Authentication configuration error. Please check JWT_SECRET environment variable.',
          details: errorMessage,
          type: 'auth_error'
        },
        { status: 500 }
      );
    }
    
    // Check for MongoDB connection errors
    if (errorMessage.includes('Mongo') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your MongoDB connection string and network access.',
          details: errorMessage,
          type: 'connection_error'
        },
        { status: 500 }
      );
    }
    
    // Generic error with details
    return NextResponse.json(
      { 
        error: 'Something went wrong while signing in.',
        details: errorMessage,
        type: 'unknown_error'
      },
      { status: 500 }
    );
  }
}

