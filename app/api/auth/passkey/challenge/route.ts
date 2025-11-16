import { NextRequest, NextResponse } from 'next/server';
import { getUserPasskeys, getUser } from '@/lib/firestore';

/**
 * API route to get a challenge for passkey authentication
 * Returns challenge and list of allowed credentials for the user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a random challenge
    const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Find user by email (you may need to add a function to find user by email)
    // For now, we'll return the challenge and let the client handle user lookup
    // In production, you'd want to find the user and get their passkeys

    return NextResponse.json({
      challenge,
      // In a real implementation, you'd fetch user's passkeys here
      // allowCredentials: passkeys.map(p => ({ id: p.id, type: 'public-key' }))
    });
  } catch (error: any) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

