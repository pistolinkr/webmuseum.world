import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const EMAIL_CODES_COLLECTION = 'email_codes';

// Generate 4-character random code (alphanumeric: A-Z, 0-9)
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

    // Send email with code
    try {
      // Use Resend API if available, otherwise log to console
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Web Museum <noreply@webmuseum.world>',
            to: [email],
            subject: 'Your Web Museum Verification Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verification Code</h2>
                <p>We send a verification code with your email, please check and fill with it.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h1 style="font-size: 32px; letter-spacing: 8px; color: #000; margin: 0;">${code}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
              </div>
            `,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json();
          console.error('Resend API error:', errorData);
          throw new Error('Failed to send email via Resend');
        }
      } else {
        // Fallback: log to console (for development)
        console.log(`📧 Email verification code for ${email}: ${code}`);
        console.log('⚠️ RESEND_API_KEY not set. Email not sent. Code logged above for development.');
      }
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails - code is still stored in Firestore
      // User can still verify manually if needed
    }

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

