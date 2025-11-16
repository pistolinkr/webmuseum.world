import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const EMAIL_CODES_COLLECTION = 'email_codes';

// Generate 4-digit random code
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Generate 4-digit code
    const code = generateCode();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

    // Store code in Firestore
    const codeDocRef = doc(db, EMAIL_CODES_COLLECTION, email.toLowerCase());
    await setDoc(codeDocRef, {
      code,
      email: email.toLowerCase(),
      expiresAt,
      createdAt: Timestamp.now(),
    });

    // TODO: Send email with code
    // For now, log to console (in production, use email service like SendGrid, Resend, etc.)
    console.log(`📧 Email verification code for ${email}: ${code}`);
    
    // In production, you would send an email here:
    // await sendEmail({
    //   to: email,
    //   subject: 'Your Web Museum verification code',
    //   body: `Your verification code is: ${code}. This code expires in 10 minutes.`
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent to email'
    });
  } catch (error: any) {
    console.error('Error sending email code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

