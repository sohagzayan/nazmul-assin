import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './app/lib/auth-middleware';

const COOKIE_NAME = 'task_manager_token';
const PUBLIC_ROUTES = ['/', '/api/auth/login', '/api/auth/register', '/api/auth/session'];
const PROTECTED_ROUTES = ['/dashboard', '/teams', '/projects', '/tasks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Allow public routes and API routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/api/'))) {
    // If user has token and tries to access login page, redirect to dashboard
    if (pathname === '/' && token) {
      try {
        await verifySessionToken(token);
        // Token is valid, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token is invalid, let them access login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Check protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Verify token is valid
      await verifySessionToken(token);
      // Token is valid, allow access
      return NextResponse.next();
    } catch {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

