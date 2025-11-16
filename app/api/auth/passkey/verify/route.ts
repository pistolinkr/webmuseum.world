import { NextRequest, NextResponse } from 'next/server';
import { getPasskey } from '@/lib/firestore';

/**
 * API route to verify passkey authentication
 * This is a simplified version - in production, you'd need to verify the signature
 * using a WebAuthn library like @simplewebauthn/server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credentialId, authenticatorData, clientDataJSON, signature } = body;

    if (!credentialId || !authenticatorData || !clientDataJSON || !signature) {
      return NextResponse.json(
        { error: 'Missing authentication data' },
        { status: 400 }
      );
    }

    // Get passkey from database
    const passkey = await getPasskey(credentialId);

    if (!passkey) {
      return NextResponse.json(
        { error: 'Invalid credential' },
        { status: 401 }
      );
    }

    // TODO: Verify signature using WebAuthn library
    // For now, we'll just return success if the credential exists
    // In production, use @simplewebauthn/server to verify:
    // const verification = await verifyAuthenticationResponse({
    //   response: { credentialId, authenticatorData, clientDataJSON, signature },
    //   expectedChallenge: challenge,
    //   expectedOrigin: origin,
    //   expectedRPID: rpId,
    //   authenticator: { credentialID: passkey.id, credentialPublicKey: passkey.publicKey, counter: passkey.counter }
    // });

    return NextResponse.json({
      success: true,
      userId: passkey.userId,
    });
  } catch (error: any) {
    console.error('Error verifying passkey:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

