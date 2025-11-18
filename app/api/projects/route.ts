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
      console.error('[GET PROJECTS] Error accessing cookies:', error?.message || error);
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

    const projects = await prisma.project.findMany({
      where: {
        createdById: user.id,
      },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend Project type
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      createdBy: project.createdById,
      createdAt: project.createdAt.toISOString(),
    }));

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error('[GET PROJECTS]', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching projects.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from request headers
    const token = getCookieFromHeaders(request, COOKIE_NAME);

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

    const body = await request.json();
    const { name, description, teamId } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project description is required.' },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required.' },
        { status: 400 }
      );
    }

    // Verify team exists and belongs to user
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found.' },
        { status: 404 }
      );
    }

    if (team.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to assign project to this team.' },
        { status: 403 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        teamId: teamId,
        createdById: user.id,
      },
    });

    // Transform to match frontend Project type
    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      createdBy: project.createdById,
      createdAt: project.createdAt.toISOString(),
    };

    return NextResponse.json({ project: transformedProject }, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE PROJECT]', error);
    
    const errorMessage = error?.message || 'Something went wrong while creating the project.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get token from request headers
    const token = getCookieFromHeaders(request, COOKIE_NAME);

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

    // Get project ID from URL
    const url = new URL(request.url);
    const projectId = url.searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required.' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    if (project.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this project.' },
        { status: 403 }
      );
    }

    // Check if project has tasks (optional: prevent deletion if project has tasks)
    if (project.tasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing tasks. Please delete tasks first.' },
        { status: 400 }
      );
    }

    // Delete project (tasks are already checked, so safe to delete)
    await prisma.project.delete({
      where: { id: project.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[DELETE PROJECT]', error);
    
    const errorMessage = error?.message || 'Something went wrong while deleting the project.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

