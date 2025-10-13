import { NextRequest, NextResponse } from 'next/server';

// Note: requires installing @farcaster/auth-client in your project
// import { verifySignInMessage } from '@farcaster/auth-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieNonce = req.cookies.get('siwf_nonce')?.value;
    if (!cookieNonce) {
      return NextResponse.json({ error: 'Missing nonce cookie' }, { status: 400 });
    }

    const { message, signature } = body || {};
    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 });
    }

    // TODO: Uncomment and validate when dependency is installed
    // const result = await verifySignInMessage({ message, signature });
    // if (!result.valid || result.nonce !== cookieNonce) {
    //   return NextResponse.json({ error: 'Invalid sign-in message' }, { status: 401 });
    // }

    // Clear nonce cookie after use
    const res = NextResponse.json({ ok: true /*, fid: result.fid */ });
    res.cookies.set('siwf_nonce', '', { path: '/', maxAge: 0 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
