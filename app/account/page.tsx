'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserExhibitions, deleteExhibition } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Exhibition, User } from '@/types';
import ExhibitionForm from '@/components/exhibition/ExhibitionForm';
import ExhibitionDeleteModal from '@/components/exhibition/ExhibitionDeleteModal';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { uploadToFirebaseStorage, getUserProfilePicturePath, getUserCoverImagePath } from '@/lib/firebaseStorage';
import HeroSection from '@/components/account/HeroSection';
import DashboardStats from '@/components/account/DashboardStats';
import ArtistSidebar from '@/components/account/ArtistSidebar';
import ExhibitionGrid from '@/components/account/ExhibitionGrid';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserAccountPage() {
  const router = useRouter();
  const { currentUser, userData, loading: authLoading, updateUserProfile, signOut } = useAuth();
  const [myExhibitions, setMyExhibitions] = useState<Exhibition[]>([]);

  // UI States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [deletingExhibition, setDeletingExhibition] = useState<Exhibition | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, authLoading, router]);

  // Load Exhibitions
  useEffect(() => {
    async function loadExhibitions() {
      if (!currentUser) return;
      try {
        const data = await getUserExhibitions(currentUser.uid);
        setMyExhibitions(data);
      } catch (error) {
        console.error('Error loading exhibitions:', error);
      }
    }
    if (currentUser) {
      loadExhibitions();
    }
  }, [currentUser]);

  // Handlers
  const handleCreateSuccess = async () => {
    setShowCreateForm(false);
    if (currentUser) {
      const data = await getUserExhibitions(currentUser.uid);
      setMyExhibitions(data);
    }
  };

  const handleEditSuccess = async () => {
    setEditingExhibition(null);
    if (currentUser) {
      const data = await getUserExhibitions(currentUser.uid);
      setMyExhibitions(data);
    }
  };

  const handleDeleteSuccess = async () => {
    setDeletingExhibition(null);
    if (currentUser) {
      const data = await getUserExhibitions(currentUser.uid);
      setMyExhibitions(data);
    }
  };

  const handleProfileUpdateSuccess = () => {
    setEditingProfile(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!currentUser) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const path = getUserProfilePicturePath(currentUser.uid, extension);
      const imageUrl = await uploadToFirebaseStorage(file, path);

      if (imageUrl) {
        await updateUserProfile({ avatarUrl: imageUrl });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!currentUser) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingCover(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const path = getUserCoverImagePath(currentUser.uid, extension);
      const imageUrl = await uploadToFirebaseStorage(file, path);

      if (imageUrl) {
        await updateUserProfile({ coverImageUrl: imageUrl });
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  // Loading State
  if (authLoading || !currentUser || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate Stats (Mock + Real)
  const stats = {
    views: myExhibitions.reduce((acc, ex) => acc + (ex.views || 0), 0) + 1240, // Mock base
    subscribers: 42, // Mock
    artworks: myExhibitions.reduce((acc, ex) => acc + (ex.artworks?.length || 0), 0),
    likes: myExhibitions.reduce((acc, ex) => acc + (ex.likes || 0), 0) + 85, // Mock base
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-black pb-20">
      {/* Hero Section */}
      <HeroSection
        user={userData}
        isOwner={true}
        onEditProfile={() => setEditingProfile(true)}
        onUploadCover={handleCoverUpload}
        onUploadAvatar={handleAvatarUpload}
        uploadingCover={uploadingCover}
        uploadingAvatar={uploadingAvatar}
      />

      {/* Dashboard Stats (Floating) */}
      <DashboardStats
        stats={stats}
        onCreateExhibition={() => setShowCreateForm(true)}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Exhibition Catalog */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-black dark:text-white">
                Curated Collections
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="lg:hidden px-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-full"
                >
                  Settings
                </button>
              </div>
            </div>

            <ExhibitionGrid
              exhibitions={myExhibitions}
              isOwner={true}
              onEdit={setEditingExhibition}
              onDelete={setDeletingExhibition}
              onCreate={() => setShowCreateForm(true)}
            />
          </div>

          {/* Sidebar: Artist Info & Settings */}
          <div className="hidden lg:block lg:col-span-4 space-y-8">
            <ArtistSidebar user={userData} isOwner={true} />

            {/* Settings Link */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Gallery Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showCreateForm || editingExhibition) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
              <ExhibitionForm
                exhibition={editingExhibition || undefined}
                onSuccess={editingExhibition ? handleEditSuccess : handleCreateSuccess}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingExhibition(null);
                }}
              />
            </div>
          </motion.div>
        )}

        {editingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-6">
              <h2 className="text-2xl font-serif font-bold mb-6">Edit Profile</h2>
              <ProfileEditForm
                user={userData}
                onSuccess={handleProfileUpdateSuccess}
                onCancel={() => setEditingProfile(false)}
              />
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-6">Gallery Settings</h2>
                <SettingsPanel />
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push('/');
                    }}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {deletingExhibition && (
          <ExhibitionDeleteModal
            exhibitionId={deletingExhibition.id}
            exhibitionTitle={deletingExhibition.title}
            isOpen={!!deletingExhibition}
            onClose={() => setDeletingExhibition(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
