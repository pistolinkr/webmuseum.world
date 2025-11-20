'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

export default function SettingsPanel() {
  const { currentUser, userData, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize theme from localStorage
  const getInitialTheme = (): 'light' | 'dark' | 'system' => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      return savedTheme || 'system';
    }
    return 'system';
  };

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      exhibitionComments: true,
      newFollowers: true,
      exhibitionUpdates: true,
    },
    privacy: {
      profileVisibility: 'public' as 'public' | 'private',
      defaultExhibitionVisibility: 'public' as 'public' | 'private',
      showEmail: false,
      showLocation: true,
    },
    theme: getInitialTheme(),
    language: 'en',
  });

  useEffect(() => {
    const userSettings = userData?.settings;
    if (userSettings) {
      setSettings({
        notifications: {
          email: true,
          exhibitionComments: true,
          newFollowers: true,
          exhibitionUpdates: true,
          ...(userSettings.notifications ?? {}),
        },
        privacy: {
          profileVisibility: 'public',
          defaultExhibitionVisibility: 'public',
          showEmail: false,
          showLocation: true,
          ...(userSettings.privacy ?? {}),
        },
        theme: userSettings.theme || 'system',
        language: userSettings.language || 'en',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      await updateUserProfile({
        settings,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
    
    // Apply theme immediately
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // System theme - remove manual override
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themechange'));
  };

  // Sync settings with userData when it loads
  useEffect(() => {
    const userSettings = userData?.settings;
    if (userSettings) {
      setSettings(prev => ({
        notifications: {
          email: true,
          exhibitionComments: true,
          newFollowers: true,
          exhibitionUpdates: true,
          ...(userSettings.notifications ?? {}),
        },
        privacy: {
          profileVisibility: 'public',
          defaultExhibitionVisibility: 'public',
          showEmail: false,
          showLocation: true,
          ...(userSettings.privacy ?? {}),
        },
        theme: userSettings.theme || getInitialTheme(),
        language: userSettings.language || 'en',
      }));
    }
  }, [userData]);

  const handleExportData = async () => {
    if (!currentUser || !userData) return;

    try {
      const exportData = {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          displayName: userData.displayName,
          bio: userData.bio,
          createdAt: userData.createdAt,
        },
        settings: userData.settings,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webmuseum-data-${new Date().toISOString().split('T')[0]}.json`;
      a.style.display = 'none';
      
      // Safely append and remove
      if (document.body) {
        document.body.appendChild(a);
        a.click();
        
        // Use setTimeout to ensure click completes before removal
        setTimeout(() => {
          try {
            if (a.parentNode && document.body.contains(a)) {
              document.body.removeChild(a);
            }
          } catch (e) {
            // Element may have been removed by React or other code
            console.warn('Could not remove download link:', e);
          }
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Fallback if body is not available
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone. All your exhibitions, artworks, and data will be permanently deleted.')) {
      return;
    }

    if (!confirm('This is your last chance. Type DELETE to confirm.')) {
      return;
    }

    // TODO: Implement account deletion
    alert('Account deletion is not yet implemented. Please contact support.');
  };

  // Check connected accounts
  const connectedAccounts = {
    google: currentUser?.providerData?.some((p: any) => p.providerId === 'google.com') || false,
    github: currentUser?.providerData?.some((p: any) => p.providerId === 'github.com') || false,
    microsoft: currentUser?.providerData?.some((p: any) => p.providerId === 'microsoft.com') || false,
    apple: currentUser?.providerData?.some((p: any) => p.providerId === 'apple.com') || false,
  };

  return (
    <div className="settings-panel">
      {/* Notifications */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Notifications</h3>
        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Email Notifications</label>
            <p className="settings-panel__description">Receive email updates about your account and exhibitions</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, email: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Exhibition Comments</label>
            <p className="settings-panel__description">Get notified when someone comments on your exhibitions</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.notifications.exhibitionComments}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, exhibitionComments: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">New Followers</label>
            <p className="settings-panel__description">Be notified when someone follows your profile</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.notifications.newFollowers}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, newFollowers: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Exhibition Updates</label>
            <p className="settings-panel__description">Receive updates about exhibitions you follow</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.notifications.exhibitionUpdates}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, exhibitionUpdates: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Privacy</h3>
        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Profile Visibility</label>
            <p className="settings-panel__description">Control who can see your profile</p>
          </div>
          <select
            className="settings-panel__select"
            value={settings.privacy.profileVisibility}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              privacy: { ...prev.privacy, profileVisibility: e.target.value as 'public' | 'private' }
            }))}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Default Exhibition Visibility</label>
            <p className="settings-panel__description">Default visibility for new exhibitions</p>
          </div>
          <select
            className="settings-panel__select"
            value={settings.privacy.defaultExhibitionVisibility}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              privacy: { ...prev.privacy, defaultExhibitionVisibility: e.target.value as 'public' | 'private' }
            }))}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Show Email</label>
            <p className="settings-panel__description">Display your email on your public profile</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.privacy.showEmail}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showEmail: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Show Location</label>
            <p className="settings-panel__description">Display your location on your public profile</p>
          </div>
          <label className="settings-panel__toggle">
            <input
              type="checkbox"
              checked={settings.privacy.showLocation}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showLocation: e.target.checked }
              }))}
            />
            <span className="settings-panel__toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Appearance */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Appearance</h3>
        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Theme</label>
            <p className="settings-panel__description">Choose your preferred theme</p>
          </div>
          <div className="settings-panel__theme-options">
            <button
              className={`settings-panel__theme-button ${settings.theme === 'light' ? 'settings-panel__theme-button--active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button
              className={`settings-panel__theme-button ${settings.theme === 'dark' ? 'settings-panel__theme-button--active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
            <button
              className={`settings-panel__theme-button ${settings.theme === 'system' ? 'settings-panel__theme-button--active' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              System
            </button>
          </div>
        </div>

        <div className="settings-panel__option">
          <div className="settings-panel__option-content">
            <label className="settings-panel__label">Language</label>
            <p className="settings-panel__description">Select your preferred language</p>
          </div>
          <select
            className="settings-panel__select"
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Connected Accounts</h3>
        <div className="settings-panel__connected-accounts">
          <div className="settings-panel__connected-account">
            <div className="settings-panel__account-info">
              <span className="settings-panel__account-name">Google</span>
              {connectedAccounts.google && (
                <span className="settings-panel__account-status">Connected</span>
              )}
            </div>
            {!connectedAccounts.google && (
              <button className="settings-panel__connect-button">Connect</button>
            )}
          </div>

          <div className="settings-panel__connected-account">
            <div className="settings-panel__account-info">
              <span className="settings-panel__account-name">GitHub</span>
              {connectedAccounts.github && (
                <span className="settings-panel__account-status">Connected</span>
              )}
            </div>
            {!connectedAccounts.github && (
              <button className="settings-panel__connect-button">Connect</button>
            )}
          </div>

          <div className="settings-panel__connected-account">
            <div className="settings-panel__account-info">
              <span className="settings-panel__account-name">Microsoft</span>
              {connectedAccounts.microsoft && (
                <span className="settings-panel__account-status">Connected</span>
              )}
            </div>
            {!connectedAccounts.microsoft && (
              <button className="settings-panel__connect-button">Connect</button>
            )}
          </div>

          <div className="settings-panel__connected-account">
            <div className="settings-panel__account-info">
              <span className="settings-panel__account-name">Apple</span>
              {connectedAccounts.apple && (
                <span className="settings-panel__account-status">Connected</span>
              )}
            </div>
            {!connectedAccounts.apple && (
              <button className="settings-panel__connect-button">Connect</button>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Data Management</h3>
        <div className="settings-panel__data-actions">
          <button
            onClick={handleExportData}
            className="settings-panel__data-button"
          >
            Export My Data
          </button>
          <p className="settings-panel__data-description">
            Download a copy of your account data in JSON format
          </p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="account-page__settings-section">
        <h3 className="account-page__settings-subtitle">Account</h3>
        <div className="settings-panel__danger-zone">
          <button
            onClick={handleDeleteAccount}
            className="settings-panel__delete-button"
          >
            Delete Account
          </button>
          <p className="settings-panel__danger-description">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-panel__save-section">
        {saveStatus === 'success' && (
          <div className="settings-panel__save-message settings-panel__save-message--success">
            Settings saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="settings-panel__save-message settings-panel__save-message--error">
            Failed to save settings. Please try again.
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="settings-panel__save-button"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

