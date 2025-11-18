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
      // In Next.js 16, cookies() might need to be awaited
      const cookieStore = await Promise.resolve(cookies());
      if (cookieStore && typeof cookieStore.get === 'function') {
        token = cookieStore.get(COOKIE_NAME)?.value;
      } else {
        console.error('[GET TEAMS] Invalid cookieStore:', typeof cookieStore);
      }
    } catch (error: any) {
      console.error('[GET TEAMS] Error accessing cookies:', error?.message || error);
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

    const teams = await prisma.team.findMany({
      where: {
        createdById: user.id,
      },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend Team type
    const transformedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      createdBy: team.createdById,
      members: team.members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
      })),
    }));

    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error('[GET TEAMS]', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching teams.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from request headers (more reliable than cookies() in some Next.js versions)
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
    const { name, members } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required.' },
        { status: 400 }
      );
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: 'At least one team member is required.' },
        { status: 400 }
      );
    }

    // Validate members
    const validMembers = members.filter((m: any) => m.name && m.role);
    if (validMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid team member is required.' },
        { status: 400 }
      );
    }

    // Ensure capacity is a number
    const membersToCreate = validMembers.map((member: any) => ({
      name: member.name.trim(),
      role: member.role.trim(),
      capacity: typeof member.capacity === 'number' ? member.capacity : parseInt(String(member.capacity || 0), 10),
    }));

    // Create team first, then members (more reliable with MongoDB)
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        createdById: user.id,
      },
    });

    // Create members separately
    const createdMembers = await Promise.all(
      membersToCreate.map((memberData) =>
        prisma.teamMember.create({
          data: {
            ...memberData,
            teamId: team.id,
          },
        })
      )
    );

    // Fetch team with members
    const teamWithMembers = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: true,
      },
    });

    if (!teamWithMembers) {
      return NextResponse.json(
        { error: 'Failed to retrieve created team.' },
        { status: 500 }
      );
    }

    // Transform to match frontend Team type
    const transformedTeam = {
      id: teamWithMembers.id,
      name: teamWithMembers.name,
      createdBy: teamWithMembers.createdById,
      members: teamWithMembers.members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
      })),
    };

    return NextResponse.json({ team: transformedTeam }, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE TEAM]', error);
    
    // Return more detailed error message for debugging
    const errorMessage = error?.message || 'Something went wrong while creating the team.';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

