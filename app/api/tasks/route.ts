import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/prisma';
import { verifySessionToken } from '@/app/lib/auth';

const COOKIE_NAME = 'task_manager_token';

// Enum conversion maps
const priorityToPrisma: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
  'Low': 'LOW',
  'Medium': 'MEDIUM',
  'High': 'HIGH',
};

const statusToPrisma: Record<string, 'PENDING' | 'IN_PROGRESS' | 'DONE'> = {
  'Pending': 'PENDING',
  'In Progress': 'IN_PROGRESS',
  'Done': 'DONE',
};

const priorityFromPrisma: Record<string, 'Low' | 'Medium' | 'High'> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
};

const statusFromPrisma: Record<string, 'Pending' | 'In Progress' | 'Done'> = {
  'PENDING': 'Pending',
  'IN_PROGRESS': 'In Progress',
  'DONE': 'Done',
};

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
      console.error('[GET TASKS] Error accessing cookies:', error?.message || error);
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

    // Get all projects created by user to filter tasks
    const userProjects = await prisma.project.findMany({
      where: { createdById: user.id },
      select: { id: true },
    });

    const projectIds = userProjects.map(p => p.id);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend Task type (convert Prisma enums to frontend format)
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedMemberId: task.assignedMemberId,
      priority: priorityFromPrisma[task.priority] || task.priority,
      status: statusFromPrisma[task.status] || task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));

    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('[GET TASKS]', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching tasks.' },
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
    const { title, description, projectId, assignedMemberId, priority, status } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task title is required.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task description is required.' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required.' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
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
        { error: 'Unauthorized to create task in this project.' },
        { status: 403 }
      );
    }

    // Validate assigned member if provided
    if (assignedMemberId) {
      const memberExists = project.team.members.some(m => m.id === assignedMemberId);
      if (!memberExists) {
        return NextResponse.json(
          { error: 'Assigned member not found in project team.' },
          { status: 400 }
        );
      }
    }

    // Validate priority and status
    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Pending', 'In Progress', 'Done'];

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value.' },
        { status: 400 }
      );
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value.' },
        { status: 400 }
      );
    }

    // Convert to Prisma enum values
    const prismaPriority = priorityToPrisma[priority || 'Medium'] || 'MEDIUM';
    const prismaStatus = statusToPrisma[status || 'Pending'] || 'PENDING';

    // Create task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        projectId: projectId,
        assignedMemberId: assignedMemberId || null,
        priority: prismaPriority,
        status: prismaStatus,
      },
    });

    // Create activity log for task creation
    await prisma.activityLog.create({
      data: {
        message: `Task "${task.title}" created`,
        type: 'TASK_CREATED',
        taskId: task.id,
        projectId: projectId,
      },
    });

    // Transform to match frontend Task type (convert Prisma enums to frontend format)
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedMemberId: task.assignedMemberId,
      priority: priorityFromPrisma[task.priority] || task.priority,
      status: statusFromPrisma[task.status] || task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json({ task: transformedTask }, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE TASK]', error);
    
    const errorMessage = error?.message || 'Something went wrong while creating the task.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

