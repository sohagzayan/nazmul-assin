import { NextResponse } from 'next/server';

const COOKIE_NAME = 'task_manager_token';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });
  return response;
}

