'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPasskeys, deletePasskey } from '@/lib/firestore';

interface PasskeyInfo {
  id: string;
  deviceName?: string;
  createdAt: Date;
}

// Auto-detect device name from user agent
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Device';
  
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'iPhone/iPad';
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
  return 'Device';
}

export default function PasskeyManager() {
  const { currentUser, registerPasskey, isPasskeySupported } = useAuth();
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadPasskeys();
    }
  }, [currentUser]);

  const loadPasskeys = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    try {
      const userPasskeys = await getUserPasskeys(currentUser.uid);
      setPasskeys(userPasskeys);
    } catch (err: any) {
      console.error('Failed to load passkeys:', err);
      // Don't show error if it's just a loading issue
      if (err.message && !err.message.includes('not found')) {
        setError(err.message || 'Failed to load passkeys');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) {
      setError('Please sign in to register a passkey');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      // Auto-detect device name - no user input needed
      const deviceName = getDeviceName();
      await registerPasskey(deviceName);
      // Reload passkeys after successful registration
      await loadPasskeys();
    } catch (err: any) {
      console.error('Failed to register passkey:', err);
      setError(err.message || 'Failed to register passkey. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this passkey?')) return;

    setLoading(true);
    setError('');

    try {
      await deletePasskey(credentialId);
      await loadPasskeys();
    } catch (err: any) {
      setError(err.message || 'Failed to delete passkey');
    } finally {
      setLoading(false);
    }
  };

  if (!isPasskeySupported()) {
    return (
      <div className="passkey-manager">
        <p className="passkey-manager__unsupported">
          Passkeys are not supported in this browser. Please use a modern browser that supports WebAuthn.
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="passkey-manager">
        <p className="passkey-manager__description">
          Please sign in to manage your passkeys.
        </p>
      </div>
    );
  }

  return (
    <div className="passkey-manager">
      <h3 className="passkey-manager__title">Manage Passkeys</h3>
      <p className="passkey-manager__description">
        Passkeys allow you to sign in quickly using your device's biometric authentication (Face ID, Touch ID, Windows Hello) or a security key.
      </p>

      {error && (
        <div className="passkey-manager__error" role="alert">
          {error}
        </div>
      )}

      <div className="passkey-manager__register">
        <h4 className="passkey-manager__subtitle">Add This Device</h4>
        <p className="passkey-manager__register-hint">
          Click the button below to add this device. You'll be prompted to use your device's biometric authentication or security key.
        </p>
        <button
          onClick={handleRegister}
          disabled={registering}
          className="passkey-manager__button passkey-manager__button--primary"
        >
          {registering ? 'Adding device...' : 'Add This Device'}
        </button>
      </div>

      <div className="passkey-manager__list">
        <h4 className="passkey-manager__subtitle">Registered Passkeys</h4>
        {loading ? (
          <p className="passkey-manager__loading">Loading passkeys...</p>
        ) : passkeys.length > 0 ? (
          <ul className="passkey-manager__passkeys">
            {passkeys.map((passkey) => (
              <li key={passkey.id} className="passkey-manager__passkey">
                <div className="passkey-manager__passkey-info">
                  <span className="passkey-manager__passkey-name">
                    {passkey.deviceName || 'Unknown Device'}
                  </span>
                  <span className="passkey-manager__passkey-date">
                    Registered {new Date(passkey.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(passkey.id)}
                  className="passkey-manager__delete"
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="passkey-manager__empty">No passkeys registered yet.</p>
        )}
      </div>
    </div>
  );
}

