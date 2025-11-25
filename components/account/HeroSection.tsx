'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';
import { useState, useRef } from 'react';

interface HeroSectionProps {
    user: User;
    isOwner: boolean;
    onEditProfile?: () => void;
    onUploadCover?: (file: File) => void;
    onUploadAvatar?: (file: File) => void;
    uploadingCover?: boolean;
    uploadingAvatar?: boolean;
}

export default function HeroSection({
    user,
    isOwner,
    onEditProfile,
    onUploadCover,
    onUploadAvatar,
    uploadingCover,
    uploadingAvatar
}: HeroSectionProps) {
    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

    const handleCoverClick = () => {
        if (isOwner && coverInputRef.current) {
            coverInputRef.current.click();
        }
    };

    const handleAvatarClick = () => {
        if (isOwner && avatarInputRef.current) {
            avatarInputRef.current.click();
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUploadCover) {
            onUploadCover(file);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUploadAvatar) {
            onUploadAvatar(file);
        }
    };

    return (
        <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden group">
            {/* Parallax Cover */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: user.coverImageUrl
                        ? `url(${user.coverImageUrl})`
                        : `url(/web_museum_static_banner_.png)`
                }}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
            >
                <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/20" />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Owner Cover Edit Button */}
            {isOwner && (
                <div className="absolute top-24 right-8 z-20">
                    <input
                        type="file"
                        ref={coverInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverChange}
                    />
                    <button
                        onClick={handleCoverClick}
                        disabled={uploadingCover}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {uploadingCover ? 'Uploading...' : 'Change Cover'}
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row items-end gap-8 max-w-7xl mx-auto">
                {/* Avatar */}
                <div
                    className="relative shrink-0"
                    onMouseEnter={() => setIsHoveringAvatar(true)}
                    onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white/10 shadow-2xl overflow-hidden bg-neutral-900 relative">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.displayName || 'Artist'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: 'url(/web_museum_static_profile-avatar.png)' }}
                            />
                        )}

                        {/* Avatar Upload Overlay */}
                        {isOwner && (
                            <div
                                className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${isHoveringAvatar || uploadingAvatar ? 'opacity-100' : 'opacity-0'}`}
                                onClick={handleAvatarClick}
                            >
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <span className="text-white text-xs font-medium uppercase tracking-wider">
                                    {uploadingAvatar ? 'Uploading...' : 'Change'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Text Info */}
                <div className="flex-1 mb-2">
                    <motion.h1
                        className="text-4xl md:text-6xl font-serif text-white font-bold tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {user.displayName || user.name || 'Anonymous Artist'}
                    </motion.h1>
                    <motion.p
                        className="text-white/80 text-lg mt-2 font-light max-w-xl line-clamp-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {user.bio || "Curating digital experiences."}
                    </motion.p>

                    {user.location && (
                        <motion.div
                            className="flex items-center gap-2 mt-3 text-white/60 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {user.location}
                        </motion.div>
                    )}
                </div>

                {/* Actions */}
                <motion.div
                    className="flex gap-3 mb-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {isOwner ? (
                        <button
                            onClick={onEditProfile}
                            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition shadow-lg hover:shadow-xl"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition shadow-lg hover:shadow-xl">
                                Subscribe
                            </button>
                            <button className="px-6 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 transition backdrop-blur-sm">
                                Share
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
