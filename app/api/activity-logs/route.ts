import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/prisma';
import { verifySessionToken } from '@/app/lib/auth';

const COOKIE_NAME = 'task_manager_token';

// Helper function to get cookie from headers
function getCookieFromHeaders(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[name];
}

export async function GET() {
  try {
    // Get token using cookies() for GET requests
    let token: string | undefined;
    try {
      const cookieStore = await Promise.resolve(cookies());
      if (cookieStore && typeof cookieStore.get === 'function') {
        token = cookieStore.get(COOKIE_NAME)?.value;
      }
    } catch (error: any) {
      console.error('[GET ACTIVITY LOGS] Error accessing cookies:', error?.message || error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let user;
    try {
      const { userId } = await verifySessionToken(token);
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all projects created by user to filter activity logs
    const userProjects = await prisma.project.findMany({
      where: { createdById: user.id },
      select: { id: true },
    });

    const projectIds = userProjects.map(p => p.id);

    // Get activity logs for user's projects, ordered by timestamp (newest first)
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Limit to 50 most recent
    });

    // Transform to match frontend ActivityLog type
    const transformedLogs = activityLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      message: log.message,
      type: log.type === 'REASSIGNMENT' ? 'reassignment' :
            log.type === 'TASK_CREATED' ? 'task_created' :
            log.type === 'TASK_UPDATED' ? 'task_updated' :
            'task_deleted',
    }));

    return NextResponse.json({ activityLogs: transformedLogs });
  } catch (error) {
    console.error('[GET ACTIVITY LOGS]', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching activity logs.' },
      { status: 500 }
    );
  }
}

