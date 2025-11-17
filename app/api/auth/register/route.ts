import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword } from '@/app/lib/auth';

interface RegisterPayload {
  username?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;
    const errors: Record<string, string> = {};

    if (!body.username || body.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.email = 'A valid email is required.';
    }

    if (!body.password || body.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Invalid form data.', errors },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email }],
      },
    });

    if (existingUser) {
      const conflictField =
        existingUser.username === body.username ? 'username' : 'email';

      return NextResponse.json(
        {
          error:
            conflictField === 'username'
              ? 'Username is already in use.'
              : 'Email is already in use.',
          errors: {
            [conflictField]:
              conflictField === 'username'
                ? 'Choose a different username.'
                : 'Choose a different email.',
          },
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(body.password!);

    await prisma.user.create({
      data: {
        username: body.username!.trim(),
        email: body.email!.toLowerCase(),
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully. Please sign in.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER]', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating your account.' },
      { status: 500 }
    );
  }
}

