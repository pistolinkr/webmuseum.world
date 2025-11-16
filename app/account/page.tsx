'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserExhibitions, deleteExhibition } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Exhibition } from '@/types';
import ExhibitionForm from '@/components/exhibition/ExhibitionForm';
import ExhibitionDeleteModal from '@/components/exhibition/ExhibitionDeleteModal';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import PasskeyManager from '@/components/auth/PasskeyManager';

export default function UserAccountPage() {
  const router = useRouter();
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [bookmarkedExhibitions, setBookmarkedExhibitions] = useState<string[]>([]);
  const [myExhibitions, setMyExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [deletingExhibition, setDeletingExhibition] = useState<Exhibition | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      router.push('/');
      return;
    }

    async function loadData() {
      try {
        // Load user's exhibitions
        const data = await getUserExhibitions(currentUser.uid);
        setMyExhibitions(data);
        
        // Load bookmarks from localStorage
        const savedBookmarks = localStorage.getItem('bookmarkedExhibitions');
        if (savedBookmarks) {
          setBookmarkedExhibitions(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  const handleProfileUpdateSuccess = () => {
    setEditingProfile(false);
    // User data will be reloaded automatically by AuthContext
  };

  if (authLoading || loading) {
    return <div className="account-page__loading">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <main className="account-page">
      <div className="account-page__container">
        <div className="account-page__header">
          <div className="account-page__header-content">
            <h1 className="account-page__title">My Account</h1>
            {userData && (
              <div className="account-page__user-info">
                <div className="account-page__user-header">
                  {userData.avatarUrl && (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.displayName || userData.name || 'Profile'}
                      className="account-page__user-avatar"
                    />
                  )}
                  <div>
                    <p className="account-page__user-name">
                      {userData.displayName || userData.name || currentUser.email}
                    </p>
                    {userData.bio && (
                      <p className="account-page__user-bio">{userData.bio}</p>
                    )}
                    <div className="account-page__user-meta">
                      {userData.category && (
                        <span className="account-page__user-category">{userData.category}</span>
                      )}
                      {userData.location && (
                        <span className="account-page__user-location">📍 {userData.location}</span>
                      )}
                    </div>
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
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="account-page__edit-profile-button"
          >
            {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile && userData && (
          <div className="account-page__form-container">
            <ProfileEditForm
              user={userData}
              onSuccess={handleProfileUpdateSuccess}
              onCancel={() => setEditingProfile(false)}
            />
          </div>
        )}

        <section className="account-page__section">
          <div className="account-page__section-header">
            <h2 className="account-page__section-title">My Exhibitions</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="account-page__create-button"
            >
              + Create New Exhibition
            </button>
          </div>

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

          {myExhibitions.length > 0 ? (
            <div className="account-page__grid">
              {myExhibitions.map((exhibition) => (
                <div key={exhibition.id} className="account-exhibition-card">
                  <Link 
                    href={`/exhibition/${exhibition.id}/story`}
                    className="account-exhibition-card__link"
                    prefetch={true}
                  >
                    {exhibition.thumbnailUrl && (
                      <img
                        src={exhibition.thumbnailUrl}
                        alt={exhibition.title}
                        className="account-exhibition-card__thumbnail"
                      />
                    )}
                    <h3 className="account-exhibition-card__title">{exhibition.title}</h3>
                    {exhibition.description && (
                      <p className="account-exhibition-card__description">
                        {exhibition.description}
                      </p>
                    )}
                    <div className="account-exhibition-card__meta">
                      {exhibition.date && (
                        <span className="account-exhibition-card__date">{exhibition.date}</span>
                      )}
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
                  </Link>
                  <div className="account-exhibition-card__actions">
                    <button
                      onClick={() => setEditingExhibition(exhibition)}
                      className="account-exhibition-card__action"
                      aria-label="Edit exhibition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingExhibition(exhibition)}
                      className="account-exhibition-card__action account-exhibition-card__action--delete"
                      aria-label="Delete exhibition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="account-page__empty">
              <p>You haven't created any exhibitions yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="account-page__create-button account-page__create-button--empty"
              >
                Create Your First Exhibition
              </button>
            </div>
          )}
        </section>

        {deletingExhibition && (
          <ExhibitionDeleteModal
            exhibitionId={deletingExhibition.id}
            exhibitionTitle={deletingExhibition.title}
            isOpen={!!deletingExhibition}
            onClose={() => setDeletingExhibition(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}

        <section className="account-page__section">
          <h2 className="account-page__section-title">Security</h2>
          <PasskeyManager />
        </section>
      </div>
    </main>
  );
}

