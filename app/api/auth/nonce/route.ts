import { NextResponse } from 'next/server';

function generateNonce(): string {
  // 32 bytes hex nonce
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function GET() {
  const nonce = generateNonce();
  const res = NextResponse.json({ nonce });
  // Bind nonce to client with httpOnly cookie for subsequent verification
  res.headers.set('Cache-Control', 'no-store');
  res.cookies.set('siwf_nonce', nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 5, // 5 minutes
  });
  return res;
}

