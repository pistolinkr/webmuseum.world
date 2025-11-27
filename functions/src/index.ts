import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const REGION = 'us-central1';
const db = admin.firestore();
const EMAIL_VERIFICATION_COLLECTION = 'emailVerificationCodes';
const RESEND_API_KEY = process.env.RESEND_API_KEY || functions.config().resend?.key;
const WEB_MUSEUM_BRAND = {
  name: 'Web Museum',
  supportEmail: 'support@webmuseum.world',
  domain: 'https://webmuseum.world',
};

if (!RESEND_API_KEY) {
  console.warn('⚠️ Resend API key is not configured. Set functions config resend.key or environment variable.');
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()_+-=[]{}|;:,.<>?';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createEmailTemplate(code: string): string {
  return `
  <!DOCTYPE html>
  <html style="background-color: #ffffff;">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html {
        background-color: #ffffff !important;
      }
      body {
        background-color: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      table {
        background-color: #ffffff !important;
      }
      td {
        background-color: #ffffff !important;
      }
      .card {
        background-color: #24282C !important;
      }
      .text-white {
        color: #ffffff !important;
      }
    </style>
  </head>
  <body style="background-color: #ffffff !important; margin: 0; padding: 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px 0; background-color: #ffffff !important;">
      <tr>
        <td align="center" style="padding: 0 24px; background-color: #ffffff !important;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background-color: #ffffff !important;">
            <tr>
              <td class="card" style="background-color:#24282C !important; border-radius: 16px; padding: 32px;">
                <div style="text-align:center;">
                  <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin:0 0 24px;">
                    <img src="https://webmuseum.world/logo/white.png" alt="Web Museum" width="24" height="24" style="display:block; object-fit:contain;" />
                    <p class="text-white" style="font-size:20px; font-weight:600; letter-spacing:0.5px; margin:0; color:#ffffff !important;">Web Museum</p>
                  </div>
                  <p class="text-white" style="font-size:24px; font-weight:600; margin:0 0 16px; color:#ffffff !important;">Your Verification Code</p>
                  <p class="text-white" style="font-size:36px; letter-spacing:4px; font-weight:700; margin:20px 0; color:#ffffff !important;">${code}</p>
                  <p class="text-white" style="font-size:14px; color:#ffffff !important; margin:0 0 24px; opacity:0.8;">
                    This code will expire in 5 minutes.<br/>
                    Enter it in the Web Museum window to continue.
                  </p>
                  <p class="text-white" style="font-size:13px; color:#ffffff !important; margin:0; opacity:0.6;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export const sendVerificationCode = functions.region(REGION).https.onCall(async (data) => {
  const email = (data.email || '').toLowerCase().trim();

  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid email is required.');
  }

  if (!RESEND_API_KEY) {
    throw new functions.https.HttpsError('failed-precondition', 'Email service is not configured.');
  }

  const code = generateVerificationCode();
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(now.toMillis() + 5 * 60 * 1000);

  try {
    await db.collection(EMAIL_VERIFICATION_COLLECTION).doc(email).set({
      email,
      code,
      createdAt: now,
      expiresAt,
      used: false,
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${WEB_MUSEUM_BRAND.name} <noreply@webmuseum.world>`,
        to: [email],
        subject: `${WEB_MUSEUM_BRAND.name} Verification Code`,
        html: createEmailTemplate(code),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Resend API error:', response.status, errorBody);
      throw new Error('Failed to send email via Resend');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send verification code.');
  }
});

export const verifyEmailCode = functions.region(REGION).https.onCall(async (data) => {
  const email = (data.email || '').toLowerCase().trim();
  const code = (data.code || '').toUpperCase().trim();

  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and code are required.');
  }

  try {
    const docRef = db.collection(EMAIL_VERIFICATION_COLLECTION).doc(email);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Verification code not found or has expired.');
    }

    const data = docSnap.data();
    if (data?.used) {
      throw new functions.https.HttpsError('failed-precondition', 'Verification code has already been used.');
    }

    const expiresAt: admin.firestore.Timestamp = data?.expiresAt;
    if (!expiresAt || admin.firestore.Timestamp.now().toMillis() > expiresAt.toMillis()) {
      await docRef.delete();
      throw new functions.https.HttpsError('deadline-exceeded', 'Verification code has expired.');
    }

    if (data?.code !== code) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid verification code.');
    }

    await docRef.update({ used: true, verifiedAt: admin.firestore.Timestamp.now() });

    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error verifying code:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify code.');
  }
});
