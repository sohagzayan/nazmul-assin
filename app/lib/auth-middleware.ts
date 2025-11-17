import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

const encoder = new TextEncoder();

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return payload as { userId: string };
}

