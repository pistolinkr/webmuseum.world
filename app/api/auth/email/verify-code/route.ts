import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const EMAIL_CODES_COLLECTION = 'email_codes';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Verify code from Firestore
    const codeDocRef = doc(db, EMAIL_CODES_COLLECTION, email.toLowerCase());
    const codeDoc = await getDoc(codeDocRef);

    if (!codeDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    const codeData = codeDoc.data();
    const now = new Date();
    const expiresAt = codeData.expiresAt.toDate();

    if (now > expiresAt) {
      await deleteDoc(codeDocRef);
      return NextResponse.json(
        { error: 'Code has expired' },
        { status: 400 }
      );
    }

    // Compare codes case-insensitively
    if (codeData.code.toUpperCase() !== code.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    // Code is valid - delete it after verification
    await deleteDoc(codeDocRef);
    
    return NextResponse.json({ 
      success: true,
      verified: true,
      message: 'Code verified successfully'
    });
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}

