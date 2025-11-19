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
    console.error('[LOGIN]', error);
    
    // Check for common production issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection issue
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('PrismaClient')) {
      return NextResponse.json(
        { 
          error: 'Database configuration error. Please check DATABASE_URL environment variable.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    // Check if it's a JWT secret issue
    if (errorMessage.includes('JWT_SECRET')) {
      return NextResponse.json(
        { 
          error: 'Authentication configuration error. Please check JWT_SECRET environment variable.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    // Generic error with more details in development
    return NextResponse.json(
      { 
        error: 'Something went wrong while signing in.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

