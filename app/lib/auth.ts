'use server';

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

const encoder = new TextEncoder();

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encoder.encode(secret));
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return payload as { userId: string };
}

