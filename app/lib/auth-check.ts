'use client';

/**
 * Directly check if user is authenticated by calling the session API
 * This bypasses React state and RTK Query for immediate redirect
 */
export async function checkAuthAndRedirect(): Promise<boolean> {
  try {
    console.log('[AUTH CHECK] Making direct fetch to /api/auth/session');
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store',
      },
    });

    console.log('[AUTH CHECK] Response status:', response.status);
    const data = await response.json();
    console.log('[AUTH CHECK] Response data:', data);
    
    if (data?.authenticated && data.user) {
      // User is authenticated - redirect to dashboard IMMEDIATELY
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        console.log('[AUTH CHECK] User authenticated! Current path:', currentPath);
        
        if (currentPath === '/' || currentPath === '') {
          console.log('[AUTH CHECK] Redirecting to /dashboard using window.location.href');
          // Use window.location.href for immediate, unblockable redirect
          window.location.href = '/dashboard';
          // Also try replace as backup
          window.location.replace('/dashboard');
          return true;
        }
      }
      return true;
    }
    
    console.log('[AUTH CHECK] User not authenticated');
    return false;
  } catch (error) {
    console.error('[AUTH CHECK] Failed to check authentication:', error);
    return false;
  }
}

