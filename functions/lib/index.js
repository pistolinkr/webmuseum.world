"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailCode = exports.sendVerificationCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const REGION = 'us-central1';
const db = admin.firestore();
const EMAIL_VERIFICATION_COLLECTION = 'emailVerificationCodes';
const RESEND_API_KEY = process.env.RESEND_API_KEY || functions.config().resend?.key;
const WEB_MUSEUM_BRAND = {
    name: 'Web Museum',
    supportEmail: 'support@webmuseum.world',
    domain: 'https://webmuseumworld.vercel.app',
};
if (!RESEND_API_KEY) {
    console.warn('⚠️ Resend API key is not configured. Set functions config resend.key or environment variable.');
}
function generateVerificationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
function createEmailTemplate(code) {
    return `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000; padding: 40px 0;">
    <tr>
      <td align="center" style="padding: 0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color: #ffffff;">
          <tr>
            <td style="background-color:#111111; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 32px;">
              <div style="text-align:center;">
                <p style="font-size:20px; font-weight:600; letter-spacing:0.5px; margin:0 0 24px; color:#ffffff;">Web Museum</p>
                <p style="font-size:24px; font-weight:600; margin:0 0 16px; color:#ffffff;">Your Verification Code</p>
                <p style="font-size:36px; letter-spacing:4px; font-weight:700; margin:20px 0; color:#ffffff;">${code}</p>
                <p style="font-size:14px; color:#aaaaaa; margin:0 0 24px;">
                  This code will expire in 5 minutes.<br/>
                  Enter it in the Web Museum window to continue.
                </p>
                <p style="font-size:13px; color:#777777; margin:0;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}
exports.sendVerificationCode = functions.region(REGION).https.onCall(async (data) => {
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
    }
    catch (error) {
        console.error('Error sending verification code:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send verification code.');
    }
});
exports.verifyEmailCode = functions.region(REGION).https.onCall(async (data) => {
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
        const expiresAt = data?.expiresAt;
        if (!expiresAt || admin.firestore.Timestamp.now().toMillis() > expiresAt.toMillis()) {
            await docRef.delete();
            throw new functions.https.HttpsError('deadline-exceeded', 'Verification code has expired.');
        }
        if (data?.code !== code) {
            throw new functions.https.HttpsError('permission-denied', 'Invalid verification code.');
        }
        await docRef.update({ used: true, verifiedAt: admin.firestore.Timestamp.now() });
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Error verifying code:', error);
        throw new functions.https.HttpsError('internal', 'Failed to verify code.');
    }
});
//# sourceMappingURL=index.js.map