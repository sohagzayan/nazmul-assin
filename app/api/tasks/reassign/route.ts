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

    // Get all user's teams with members
    const teams = await prisma.team.findMany({
      where: { createdById: user.id },
      include: {
        members: true,
        projects: {
          include: {
            tasks: true,
          },
        },
      },
    });

    const reassignments: Array<{
      taskId: string;
      taskTitle: string;
      fromMemberId: string;
      fromMemberName: string;
      toMemberId: string;
      toMemberName: string;
      projectId: string;
    }> = [];

    // Process each team
    for (const team of teams) {
      // Get all project IDs for this team
      const projectIds = team.projects.map(p => p.id);
      
      // Keep reassigning until no more overloaded members
      let hasReassignments = true;
      let iterationCount = 0;
      const maxIterations = 10; // Prevent infinite loops

      while (hasReassignments && iterationCount < maxIterations) {
        iterationCount++;
        hasReassignments = false;

        // Fetch current tasks for this team (refresh after each reassignment)
        const currentTasks = await prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
          },
        });

        // Process each member in the team
        for (const member of team.members) {
          const memberTasks = currentTasks.filter(
            task => task.assignedMemberId === member.id
          );
          const currentLoad = memberTasks.length;

          // If member is overloaded
          if (currentLoad > member.capacity) {
            hasReassignments = true;

            // Get overloaded tasks (exclude High priority)
            const overloadedTasks = memberTasks
              .filter(task => task.priority !== 'HIGH') // Keep High priority tasks
              .sort((a, b) => {
                // Sort by priority: Low first, then Medium
                const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              });

            // Calculate how many tasks to move
            const tasksToMove = overloadedTasks.slice(0, currentLoad - member.capacity);

            // For each task to move, find a suitable assignee
            for (const task of tasksToMove) {
              // Find available members (with free capacity) in the same team
              // Recalculate member loads from current tasks
              const availableMembers = team.members
                .filter(m => {
                  const mTasks = currentTasks.filter(t => t.assignedMemberId === m.id);
                  return mTasks.length < m.capacity;
                })
                .sort((a, b) => {
                  // Sort by current load (least loaded first)
                  const aTasks = currentTasks.filter(t => t.assignedMemberId === a.id).length;
                  const bTasks = currentTasks.filter(t => t.assignedMemberId === b.id).length;
                  return aTasks - bTasks;
                });

              if (availableMembers.length > 0) {
                const newAssignee = availableMembers[0];
                
              // Only reassign if different member
              if (newAssignee.id !== task.assignedMemberId) {
                // Update task assignment
                await prisma.task.update({
                  where: { id: task.id },
                  data: { assignedMemberId: newAssignee.id },
                });

                // Get project for activity log (ensure projectId exists)
                const projectId = task.projectId;
                if (projectId) {
                  try {
                    // Create activity log
                    await prisma.activityLog.create({
                      data: {
                        message: `Task "${task.title}" reassigned from ${member.name} to ${newAssignee.name}`,
                        type: 'REASSIGNMENT',
                        taskId: task.id,
                        projectId: projectId,
                        fromMemberId: member.id,
                        toMemberId: newAssignee.id,
                      },
                    });
                  } catch (logError: any) {
                    // Log error but don't fail the reassignment
                    console.error('[CREATE ACTIVITY LOG]', logError);
                  }
                }

                reassignments.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  fromMemberId: member.id,
                  fromMemberName: member.name,
                  toMemberId: newAssignee.id,
                  toMemberName: newAssignee.name,
                  projectId: projectId || '',
                });

                  // Update the task in currentTasks array for next iteration
                  const taskIndex = currentTasks.findIndex(t => t.id === task.id);
                  if (taskIndex !== -1) {
                    currentTasks[taskIndex] = {
                      ...currentTasks[taskIndex],
                      assignedMemberId: newAssignee.id,
                    };
                  }
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      reassignments,
      count: reassignments.length,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[REASSIGN TASKS]', error);
    
    const errorMessage = error?.message || 'Something went wrong while reassigning tasks.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

