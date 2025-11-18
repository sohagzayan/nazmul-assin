import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifySessionToken } from '@/app/lib/auth';

const COOKIE_NAME = 'task_manager_token';

// Enum conversion maps (same as in route.ts)
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 16
    const { id: taskId } = await params;
    
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

    // Verify task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            createdById: true,
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found.' },
        { status: 404 }
      );
    }

    // Verify project belongs to user
    if (existingTask.project.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this task.' },
        { status: 403 }
      );
    }

    // If projectId is being changed, verify new project belongs to user
    if (projectId && projectId !== existingTask.projectId) {
      const newProject = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!newProject) {
        return NextResponse.json(
          { error: 'Project not found.' },
          { status: 404 }
        );
      }

      if (newProject.createdById !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to move task to this project.' },
          { status: 403 }
        );
      }

      // If assigned member is provided, verify they belong to the new project's team
      if (assignedMemberId) {
        const newProjectWithTeam = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        });

        if (newProjectWithTeam) {
          const memberExists = newProjectWithTeam.team.members.some(m => m.id === assignedMemberId);
          if (!memberExists) {
            return NextResponse.json(
              { error: 'Assigned member not found in project team.' },
              { status: 400 }
            );
          }
        }
      }
    } else if (assignedMemberId && assignedMemberId !== existingTask.assignedMemberId) {
      // If projectId hasn't changed but assignedMemberId has, verify member belongs to current project's team
      const projectWithTeam = await prisma.project.findUnique({
        where: { id: existingTask.projectId },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (projectWithTeam) {
        const memberExists = projectWithTeam.team.members.some(m => m.id === assignedMemberId);
        if (!memberExists) {
          return NextResponse.json(
            { error: 'Assigned member not found in project team.' },
            { status: 400 }
          );
        }
      }
    }

    // Validate priority and status if provided
    if (priority !== undefined && priority !== null) {
      const validPriorities = ['Low', 'Medium', 'High', 'LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value.' },
          { status: 400 }
        );
      }
    }

    if (status !== undefined && status !== null) {
      const validStatuses = ['Pending', 'In Progress', 'Done', 'PENDING', 'IN_PROGRESS', 'DONE'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value.' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (projectId !== undefined) {
      updateData.projectId = projectId;
    }
    if (assignedMemberId !== undefined) {
      updateData.assignedMemberId = assignedMemberId || null;
    }
    if (priority !== undefined && priority !== null) {
      // Check if already in Prisma format, otherwise convert
      const prismaPriorityValues = ['LOW', 'MEDIUM', 'HIGH'];
      if (typeof priority === 'string' && prismaPriorityValues.includes(priority)) {
        updateData.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
      } else if (typeof priority === 'string' && priorityToPrisma[priority]) {
        updateData.priority = priorityToPrisma[priority];
      } else {
        // Keep existing priority if conversion fails
        updateData.priority = existingTask.priority;
      }
    }
    if (status !== undefined && status !== null) {
      // Check if already in Prisma format, otherwise convert
      const prismaStatusValues = ['PENDING', 'IN_PROGRESS', 'DONE'];
      if (typeof status === 'string' && prismaStatusValues.includes(status)) {
        updateData.status = status as 'PENDING' | 'IN_PROGRESS' | 'DONE';
      } else if (typeof status === 'string' && statusToPrisma[status]) {
        updateData.status = statusToPrisma[status];
      } else {
        // Keep existing status if conversion fails
        updateData.status = existingTask.status;
      }
    }

    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update.' },
        { status: 400 }
      );
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Create activity log for task update (use projectId from updated task or existing task)
    const projectIdForLog = updatedTask.projectId || existingTask.projectId;
    try {
      await prisma.activityLog.create({
        data: {
          message: `Task "${updatedTask.title}" updated`,
          type: 'TASK_UPDATED',
          taskId: updatedTask.id,
          projectId: projectIdForLog,
        },
      });
    } catch (logError) {
      // Log error but don't fail the task update
      console.error('[CREATE ACTIVITY LOG]', logError);
    }

    // Transform to match frontend Task type
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      projectId: updatedTask.projectId,
      assignedMemberId: updatedTask.assignedMemberId,
      priority: priorityFromPrisma[updatedTask.priority] || updatedTask.priority,
      status: statusFromPrisma[updatedTask.status] || updatedTask.status,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    };

    return NextResponse.json({ task: transformedTask }, { status: 200 });
  } catch (error: any) {
    console.error('[UPDATE TASK]', error);
    
    const errorMessage = error?.message || 'Something went wrong while updating the task.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 16
    const { id: taskId } = await params;
    
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

    // Verify task exists and belongs to user's project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found.' },
        { status: 404 }
      );
    }

    // Verify project belongs to user
    if (task.project.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this task.' },
        { status: 403 }
      );
    }

    // Create activity log before deleting
    await prisma.activityLog.create({
      data: {
        message: `Task "${task.title}" deleted`,
        type: 'TASK_DELETED',
        taskId: task.id,
        projectId: task.projectId,
      },
    });

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[DELETE TASK]', error);
    
    const errorMessage = error?.message || 'Something went wrong while deleting the task.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

