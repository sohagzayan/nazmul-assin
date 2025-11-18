import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifySessionToken } from '@/app/lib/auth';

const COOKIE_NAME = 'task_manager_token';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      console.log('[SESSION] No token found in cookies');
      return NextResponse.json(
        { authenticated: false },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { userId } = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      console.log('[SESSION] User not found for userId:', userId);
      return NextResponse.json(
        { authenticated: false },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    console.log('[SESSION] User authenticated:', user.username);
    return NextResponse.json(
      { authenticated: true, user },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

