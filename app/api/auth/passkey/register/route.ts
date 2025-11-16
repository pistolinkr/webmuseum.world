import { NextRequest, NextResponse } from 'next/server';
import { savePasskey } from '@/lib/firestore';
import { PasskeyCredential } from '@/lib/webauthn';

/**
 * API route to register a passkey
 * This endpoint receives the passkey credential from the client and stores it
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, credential } = body;

    if (!userId || !credential) {
      return NextResponse.json(
        { error: 'Missing userId or credential' },
        { status: 400 }
      );
    }

    const passkeyData: PasskeyCredential = {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter || 0,
      deviceName: credential.deviceName,
      createdAt: credential.createdAt ? new Date(credential.createdAt) : new Date(),
    };

    const success = await savePasskey(userId, passkeyData);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save passkey' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error registering passkey:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

