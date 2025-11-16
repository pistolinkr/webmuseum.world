'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPasskeys, deletePasskey } from '@/lib/firestore';

interface PasskeyInfo {
  id: string;
  deviceName?: string;
  createdAt: Date;
}

export default function PasskeyManager() {
  const { currentUser, registerPasskey, isPasskeySupported } = useAuth();
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadPasskeys();
    }
  }, [currentUser]);

  const loadPasskeys = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userPasskeys = await getUserPasskeys(currentUser.uid);
      setPasskeys(userPasskeys);
    } catch (err: any) {
      setError(err.message || 'Failed to load passkeys');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) return;

    setRegistering(true);
    setError('');

    try {
      await registerPasskey(deviceName || undefined);
      setDeviceName('');
      await loadPasskeys();
    } catch (err: any) {
      setError(err.message || 'Failed to register passkey');
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

  return (
    <div className="passkey-manager">
      <h3 className="passkey-manager__title">Manage Passkeys</h3>
      <p className="passkey-manager__description">
        Passkeys allow you to sign in using your device's biometric authentication (Face ID, Touch ID, Windows Hello) or a security key.
      </p>

      {error && (
        <div className="passkey-manager__error" role="alert">
          {error}
        </div>
      )}

      <div className="passkey-manager__register">
        <h4 className="passkey-manager__subtitle">Register New Passkey</h4>
        <div className="passkey-manager__register-form">
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Device name (e.g., iPhone, MacBook)"
            className="passkey-manager__input"
            disabled={registering}
          />
          <button
            onClick={handleRegister}
            disabled={registering}
            className="passkey-manager__button"
          >
            {registering ? 'Registering...' : 'Register Passkey'}
          </button>
        </div>
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

