'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserExhibitions, deleteExhibition } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Exhibition, User } from '@/types';
import ExhibitionForm from '@/components/exhibition/ExhibitionForm';
import ExhibitionDeleteModal from '@/components/exhibition/ExhibitionDeleteModal';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import PasskeyManager from '@/components/auth/PasskeyManager';
import { uploadToFirebaseStorage, getUserProfilePicturePath, getUserCoverImagePath } from '@/lib/firebaseStorage';
import { GlowingStarsBackground } from '@/components/ui/glowing-stars';

export default function UserAccountPage() {
  const router = useRouter();
  const { currentUser, userData, loading: authLoading, signOut } = useAuth();
  const [bookmarkedExhibitions, setBookmarkedExhibitions] = useState<string[]>([]);
  const [myExhibitions, setMyExhibitions] = useState<Exhibition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [deletingExhibition, setDeletingExhibition] = useState<Exhibition | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'exhibitions' | 'about' | 'settings'>('exhibitions');
  const [editFormData, setEditFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    coverImageUrl: '',
  });
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);

  // Load bookmarks immediately (synchronous, fast)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookmarks = localStorage.getItem('bookmarkedExhibitions');
      if (savedBookmarks) {
        try {
          setBookmarkedExhibitions(JSON.parse(savedBookmarks));
        } catch (error) {
          console.error('Error parsing bookmarks:', error);
        }
      }
    }
  }, []); // Run once on mount

  // Load exhibitions in background after auth is ready
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      router.push('/');
      return;
    }

    // Load exhibitions in background (non-blocking)
    // UI will render immediately without waiting for exhibitions
    async function loadExhibitions() {
      if (!currentUser) return;
      
      try {
        const data = await getUserExhibitions(currentUser.uid);
        setMyExhibitions(data);
      } catch (error) {
        console.error('Error loading exhibitions:', error);
      }
    }
    
    loadExhibitions();
  }, [currentUser, authLoading, router]);

  const toggleBookmark = (exhibitionId: string) => {
    const newBookmarks = bookmarkedExhibitions.includes(exhibitionId)
      ? bookmarkedExhibitions.filter(id => id !== exhibitionId)
      : [...bookmarkedExhibitions, exhibitionId];
    
    setBookmarkedExhibitions(newBookmarks);
    localStorage.setItem('bookmarkedExhibitions', JSON.stringify(newBookmarks));
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // Reload exhibitions
    if (currentUser) {
      getUserExhibitions(currentUser.uid).then(setMyExhibitions);
    }
  };

  const handleEditSuccess = () => {
    setEditingExhibition(null);
    // Reload exhibitions
    if (currentUser) {
      getUserExhibitions(currentUser.uid).then(setMyExhibitions);
    }
  };

  const handleDeleteSuccess = () => {
    setDeletingExhibition(null);
    // Reload exhibitions
    if (currentUser) {
      getUserExhibitions(currentUser.uid).then(setMyExhibitions);
    }
  };

  const { updateUserProfile } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleEditClick = () => {
    console.log('Edit button clicked, setting editingProfile to true');
    if (userData) {
      setEditFormData({
        username: userData.username || '',
        displayName: userData.displayName || userData.name || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '',
        coverImageUrl: userData.coverImageUrl || '',
      });
    }
    setEditingProfile(true);
  };

  const handleProfileSave = async () => {
    console.log('Save button clicked');
    console.log('Current state:', { 
      currentUser: !!currentUser, 
      userData: !!userData,
      currentUserId: currentUser?.uid,
      userDataId: userData?.id,
      editFormData 
    });
    
    if (!currentUser) {
      console.error('Cannot save: currentUser is missing');
      alert('You must be logged in to save your profile. Please sign in again.');
      return;
    }
    
    if (savingProfile) {
      console.log('Save already in progress, ignoring click');
      return;
    }
    
    setSavingProfile(true);
    
    try {
      console.log('Updating profile with data:', editFormData);
      
      // Prepare updates object - only include fields that have values
      const updates: Partial<User> = {};
      
      if (editFormData.username.trim()) {
        updates.username = editFormData.username.trim();
      }
      if (editFormData.displayName.trim()) {
        updates.displayName = editFormData.displayName.trim();
      }
      if (editFormData.bio.trim()) {
        updates.bio = editFormData.bio.trim();
      }
      if (editFormData.avatarUrl.trim()) {
        updates.avatarUrl = editFormData.avatarUrl.trim();
      }
      if (editFormData.coverImageUrl.trim()) {
        updates.coverImageUrl = editFormData.coverImageUrl.trim();
      }
      
      console.log('Prepared updates:', updates);
      
      // updateUserProfile handles offline mode automatically
      await updateUserProfile(updates);
      console.log('Profile updated successfully');
      
      // Always exit edit mode after save attempt (success or failure)
      setEditingProfile(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      
      const errorMessage = error?.message || 'Failed to save profile. Please try again.';
      alert(`Error: ${errorMessage}`);
      
      // Still exit edit mode even on error so user can try again
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const path = getUserProfilePicturePath(currentUser.uid, extension);
      
      console.log('Starting avatar upload...');
      const imageUrl = await uploadToFirebaseStorage(file, path, (progress) => {
        console.log('Avatar upload progress:', Math.round(progress), '%');
      });
      
      if (imageUrl) {
        console.log('Avatar uploaded successfully:', imageUrl);
        setEditFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
        // URL is saved in editFormData, will be saved to Firestore when user clicks Save
      } else {
        throw new Error('Upload completed but no URL was returned');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to upload image. ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.code) {
        errorMessage += `Error code: ${error.code}`;
      } else {
        errorMessage += 'Please check Firebase Storage configuration and browser console for details.';
      }
      
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingCover(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const path = getUserCoverImagePath(currentUser.uid, extension);
      
      console.log('Starting cover upload...');
      const imageUrl = await uploadToFirebaseStorage(file, path, (progress) => {
        console.log('Cover upload progress:', Math.round(progress), '%');
      });
      
      if (imageUrl) {
        console.log('Cover uploaded successfully:', imageUrl);
        setEditFormData(prev => ({ ...prev, coverImageUrl: imageUrl }));
        // URL is saved in editFormData, will be saved to Firestore when user clicks Save
      } else {
        throw new Error('Upload completed but no URL was returned');
      }
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to upload image. ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.code) {
        errorMessage += `Error code: ${error.code}`;
      } else {
        errorMessage += 'Please check Firebase Storage configuration and browser console for details.';
      }
      
      alert(errorMessage);
    } finally {
      setUploadingCover(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleProfileUpdateSuccess = () => {
    setEditingProfile(false);
    // User data will be reloaded automatically by AuthContext
  };

  useEffect(() => {
    if (userData && !editingProfile) {
      console.log('Updating editFormData from userData:', userData);
      setEditFormData({
        username: userData.username || '',
        displayName: userData.displayName || userData.name || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '',
        coverImageUrl: userData.coverImageUrl || '',
      });
    }
  }, [userData, editingProfile]);

  // Show loading only while auth is initializing
  if (authLoading) {
    return <div className="account-page__loading">Loading...</div>;
  }

  // Redirect if not authenticated (handled in useEffect, but show nothing while redirecting)
  if (!currentUser) {
    return null;
  }

  return (
    <main className="account-page">
      <div className="account-page__container">
        {/* Cover Image */}
        <div className="account-page__cover">
          <div 
            className="account-page__cover-image"
            style={{
              backgroundImage: editingProfile && editFormData.coverImageUrl 
                ? `url(${editFormData.coverImageUrl})` 
                : userData?.coverImageUrl 
                  ? `url(${userData.coverImageUrl})` 
                  : `url(/web_museum_static_banner_.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
            }}
          >
            {editingProfile && (
              <div className="account-page__cover-upload-controls">
                {!showCoverUrlInput ? (
                  <>
                    <label className="account-page__cover-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover || uploadingAvatar}
                        style={{ display: 'none' }}
                      />
                      <div className={`account-page__cover-upload-button ${uploadingCover ? 'account-page__cover-upload-button--uploading' : ''}`}>
                        {uploadingCover ? 'Uploading...' : 'Change Cover'}
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCoverUrlInput(true)}
                      className="account-page__cover-url-button"
                      disabled={uploadingCover || uploadingAvatar}
                    >
                      Or Enter URL
                    </button>
                  </>
                ) : (
                  <div className="account-page__cover-url-input-wrapper">
                    <input
                      type="url"
                      placeholder="Enter cover image URL"
                      value={editFormData.coverImageUrl}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                      className="account-page__cover-url-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoverUrlInput(false)}
                      className="account-page__cover-url-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="account-page__header">
          <div className="account-page__header-content">
            {/* Profile Avatar */}
            <div className="account-page__avatar-section">
              <label className={`account-page__avatar-label ${editingProfile ? 'account-page__avatar-label--editable' : ''}`}>
                {(editingProfile ? editFormData.avatarUrl : userData?.avatarUrl) ? (
                  <img
                    src={editingProfile ? editFormData.avatarUrl : userData?.avatarUrl}
                    alt={userData?.displayName || userData?.name || 'Profile'}
                    className="account-page__profile-avatar"
                  />
                ) : (
                  <div 
                    className="account-page__profile-avatar account-page__profile-avatar--placeholder"
                    style={{
                      backgroundImage: 'url(/web_museum_static_profile-avatar.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'top center',
                    }}
                  >
                  </div>
                )}
                {editingProfile && (
                  <div className="account-page__avatar-upload-controls">
                    {!showAvatarUrlInput ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar || uploadingCover}
                          style={{ display: 'none' }}
                          id="avatar-file-input"
                        />
                        <label htmlFor="avatar-file-input" className="account-page__avatar-upload-overlay">
                          <div className={`account-page__avatar-upload-text ${uploadingAvatar ? 'account-page__avatar-upload-overlay--uploading' : ''}`}>
                            {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAvatarUrlInput(true)}
                          className="account-page__avatar-url-button"
                          disabled={uploadingAvatar || uploadingCover}
                        >
                          Or Enter URL
                        </button>
                      </>
                    ) : (
                      <div className="account-page__avatar-url-input-wrapper">
                        <input
                          type="url"
                          placeholder="Enter avatar image URL"
                          value={editFormData.avatarUrl}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                          className="account-page__avatar-url-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAvatarUrlInput(false)}
                          className="account-page__avatar-url-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </label>
            </div>

            {/* Profile Info */}
            <div className="account-page__profile-info">
              <div className="account-page__profile-header">
                <div className="account-page__profile-name-section">
                  {editingProfile ? (
                    <div className="account-page__profile-edit-fields">
                      <div className="account-page__profile-input-wrapper">
                        <span className="account-page__profile-input-prefix">@</span>
                        <input
                          type="text"
                          placeholder="username"
                          value={editFormData.username.replace(/^@/, '')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
                            setEditFormData({ ...editFormData, username: value });
                          }}
                          className="account-page__profile-input account-page__profile-input--username"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Display Name"
                        value={editFormData.displayName}
                        onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                        className="account-page__profile-input account-page__profile-input--displayname"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="account-page__profile-name">
                        {userData?.displayName || userData?.name || currentUser?.email}
                      </h1>
                      {userData?.username && (
                        <p className="account-page__profile-username">@{userData.username}</p>
                      )}
                    </>
                  )}
                  <div className="account-page__profile-stats">
                    <div className="account-page__stat-item">
                      <span className="account-page__stat-number">{myExhibitions.length}</span>
                      <span className="account-page__stat-text">Exhibitions</span>
                    </div>
                    <div className="account-page__stat-item">
                      <span className="account-page__stat-number">{myExhibitions.reduce((acc, ex) => acc + (ex.artworks?.length || 0), 0)}</span>
                      <span className="account-page__stat-text">Artworks</span>
                    </div>
                    <div className="account-page__stat-item">
                      <span className="account-page__stat-number">{bookmarkedExhibitions.length}</span>
                      <span className="account-page__stat-text">Bookmarks</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={editingProfile ? handleProfileSave : handleEditClick}
                  className="account-page__edit-profile-button"
                  disabled={savingProfile || (editingProfile && (uploadingAvatar || uploadingCover))}
                  type="button"
                >
                  {savingProfile ? 'Saving...' : editingProfile ? 'Save' : 'Edit Profile'}
                </button>
              </div>

              {userData && (
                <div className="account-page__profile-details">
                  {editingProfile ? (
                    <textarea
                      placeholder="Bio"
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      className="account-page__profile-textarea"
                      rows={3}
                    />
                  ) : (
                    userData.bio && (
                      <p className="account-page__profile-bio">{userData.bio}</p>
                    )
                  )}
                  {!editingProfile && (
                    <div className="account-page__profile-meta">
                      {userData.location && (
                        <span className="account-page__profile-location">📍 {userData.location}</span>
                      )}
                      {userData.category && (
                        <span className="account-page__profile-category">{userData.category}</span>
                      )}
                    {currentUser && (
                      <Link
                        href={`/user/${currentUser.uid}`}
                        className="account-page__view-profile-link"
                        prefetch={true}
                      >
                        View Public Profile →
                      </Link>
                    )}
                  </div>
                  )}
                </div>
              )}
              </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="account-page__tabs">
          <button
            className={`account-page__tab ${activeTab === 'exhibitions' ? 'account-page__tab--active' : ''}`}
            onClick={() => setActiveTab('exhibitions')}
          >
            Exhibitions
          </button>
          <button
            className={`account-page__tab ${activeTab === 'about' ? 'account-page__tab--active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`account-page__tab ${activeTab === 'settings' ? 'account-page__tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="account-page__content">
          {activeTab === 'exhibitions' && (
            <div className="account-page__tab-content">
        {editingProfile && userData && (
          <div className="account-page__form-container">
            <ProfileEditForm
              user={userData}
              onSuccess={handleProfileUpdateSuccess}
              onCancel={() => setEditingProfile(false)}
            />
          </div>
        )}

              {!editingProfile && (
                <>
          {showCreateForm && (
            <div className="account-page__form-container">
              <ExhibitionForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {editingExhibition && (
            <div className="account-page__form-container">
              <ExhibitionForm
                exhibition={editingExhibition}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingExhibition(null)}
              />
            </div>
          )}

                  {!showCreateForm && !editingExhibition && (
                    <>
                      <div className="account-page__section-header">
                        <h2 className="account-page__section-title">My Exhibitions</h2>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="account-page__create-button"
                        >
                          + Create New
                        </button>
                      </div>

          {myExhibitions.length > 0 ? (
            <div className="account-page__grid">
                          {myExhibitions.map((exhibition, index) => (
                            <div 
                              key={exhibition.id} 
                              className="account-exhibition-card"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                  <Link 
                    href={`/exhibition/${exhibition.id}/story`}
                    className="account-exhibition-card__link"
                    prefetch={true}
                  >
                                <div className="account-exhibition-card__image-wrapper">
                                  {exhibition.thumbnailUrl ? (
                      <img
                        src={exhibition.thumbnailUrl}
                        alt={exhibition.title}
                        className="account-exhibition-card__thumbnail"
                      />
                                  ) : (
                                    <div className="account-exhibition-card__thumbnail account-exhibition-card__thumbnail--placeholder">
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <path d="M3 9h18M9 3v18"/>
                                      </svg>
                                    </div>
                                  )}
                                  <div className="account-exhibition-card__overlay">
                      {exhibition.isPublic !== false ? (
                        <span className="account-exhibition-card__badge account-exhibition-card__badge--public">
                          Public
                        </span>
                      ) : (
                        <span className="account-exhibition-card__badge account-exhibition-card__badge--private">
                          Private
                        </span>
                                    )}
                                  </div>
                                </div>
                                <div className="account-exhibition-card__content">
                                  <h3 className="account-exhibition-card__title">{exhibition.title}</h3>
                                  {exhibition.artworks && exhibition.artworks.length > 0 && (
                                    <div className="account-exhibition-card__meta">
                                      <span className="account-exhibition-card__artwork-count">
                                        {exhibition.artworks.length} {exhibition.artworks.length === 1 ? 'artwork' : 'artworks'}
                                      </span>
                                    </div>
                      )}
                    </div>
                  </Link>
                  <div className="account-exhibition-card__actions">
                    <button
                      onClick={() => setEditingExhibition(exhibition)}
                                  className="account-exhibition-card__action account-exhibition-card__action--edit"
                      aria-label="Edit exhibition"
                    >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                    </button>
                    <button
                      onClick={() => setDeletingExhibition(exhibition)}
                      className="account-exhibition-card__action account-exhibition-card__action--delete"
                      aria-label="Delete exhibition"
                    >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="account-page__empty">
                          <div className="account-page__empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <path d="M3 9h18M9 3v18"/>
                            </svg>
                          </div>
                          <h3 className="account-page__empty-title">No exhibitions yet</h3>
                          <p className="account-page__empty-text">Start showcasing your art by creating your first exhibition.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="account-page__create-button account-page__create-button--empty"
              >
                Create Your First Exhibition
              </button>
            </div>
          )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="account-page__tab-content">
              {userData && (
                <div className="account-page__about">
                  <ProfileEditForm
                    user={userData}
                    onSuccess={handleProfileUpdateSuccess}
                    onCancel={() => setActiveTab('exhibitions')}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="account-page__tab-content">
              <div className="account-page__settings">
                <h2 className="account-page__section-title">Security</h2>
                <PasskeyManager />
                
                <div className="account-page__settings-section">
                  <h3 className="account-page__settings-subtitle">Account</h3>
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push('/');
                    }}
                    className="account-page__sign-out-button"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {deletingExhibition && (
          <ExhibitionDeleteModal
            exhibitionId={deletingExhibition.id}
            exhibitionTitle={deletingExhibition.title}
            isOpen={!!deletingExhibition}
            onClose={() => setDeletingExhibition(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </main>
  );
}

