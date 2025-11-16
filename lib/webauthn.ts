/**
 * WebAuthn (Passkeys) utility functions
 * Supports both registration and authentication
 */

export interface PasskeyCredential {
  id: string; // credentialId (base64url encoded)
  publicKey: string; // base64url encoded
  counter: number;
  deviceName?: string;
  createdAt: Date;
}

export interface WebAuthnChallenge {
  challenge: string;
  userId?: string; // For registration
  email?: string; // For authentication
}

/**
 * Check if WebAuthn/Passkeys are supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         'PublicKeyCredential' in window &&
         typeof PublicKeyCredential !== 'undefined';
}

/**
 * Generate a random challenge string
 */
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert base64url to ArrayBuffer
 */
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const paddedBase64 = base64 + '='.repeat(padding === 0 ? 0 : 4 - padding);
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert ArrayBuffer to base64url
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Register a new passkey (WebAuthn credential)
 */
export async function registerPasskey(
  userId: string,
  email: string,
  displayName: string,
  deviceName?: string
): Promise<PasskeyCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn/Passkeys are not supported in this browser');
  }

  const challenge = generateChallenge();
  
  // Get current origin/hostname
  const rpId = window.location.hostname;
  
  // Create credential
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: base64UrlToArrayBuffer(challenge),
    rp: {
      name: 'Web Museum',
      id: rpId,
    },
    user: {
      id: base64UrlToArrayBuffer(userId),
      name: email,
      displayName: displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Prefer platform authenticators (Touch ID, Face ID, Windows Hello)
      userVerification: 'preferred',
      requireResidentKey: true, // Allow passkeys
    },
    timeout: 60000,
    attestation: 'direct',
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential || !(credential instanceof PublicKeyCredential)) {
      throw new Error('Failed to create credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Extract credential ID and attestation object
    const credentialId = arrayBufferToBase64Url(credential.rawId);
    const attestationObject = arrayBufferToBase64Url(response.attestationObject);
    const clientDataJSON = arrayBufferToBase64Url(response.clientDataJSON);

    return {
      id: credentialId,
      publicKey: attestationObject, // Store attestation object (server will extract public key)
      counter: 0,
      deviceName: deviceName || getDeviceName(),
      createdAt: new Date(),
    };
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Registration was cancelled or timed out');
    }
    throw error;
  }
}

/**
 * Authenticate with a passkey
 */
export async function authenticateWithPasskey(
  challenge: string,
  allowCredentials?: Array<{ id: string; type: string }>
): Promise<{ credentialId: string; authenticatorData: string; clientDataJSON: string; signature: string; userHandle?: string }> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn/Passkeys are not supported in this browser');
  }

  const rpId = window.location.hostname;
  
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: base64UrlToArrayBuffer(challenge),
    allowCredentials: allowCredentials?.map(cred => ({
      id: base64UrlToArrayBuffer(cred.id),
      type: cred.type as PublicKeyCredentialType,
      transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
    })),
    timeout: 60000,
    userVerification: 'preferred',
    rpId: rpId,
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    if (!assertion || !(assertion instanceof PublicKeyCredential)) {
      throw new Error('Failed to get assertion');
    }

    const response = assertion.response as AuthenticatorAssertionResponse;

    return {
      credentialId: arrayBufferToBase64Url(assertion.rawId),
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : undefined,
    };
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Authentication was cancelled or timed out');
    }
    throw error;
  }
}

/**
 * Get device name for passkey registration
 */
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'iOS Device';
  }
  if (/Android/.test(ua)) {
    return 'Android Device';
  }
  if (/Mac/.test(ua)) {
    return 'Mac';
  }
  if (/Windows/.test(ua)) {
    return 'Windows PC';
  }
  if (/Linux/.test(ua)) {
    return 'Linux PC';
  }
  return 'Unknown Device';
}

