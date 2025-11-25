'use client';

import { User } from '@/types';
import { motion } from 'framer-motion';

interface ArtistSidebarProps {
    user: User;
    isOwner: boolean;
}

export default function ArtistSidebar({ user, isOwner }: ArtistSidebarProps) {
    return (
        <div className="space-y-8">
            {/* Artist Statement */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Artist Statement</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    {user.bio || "This artist has not published a statement yet."}
                </p>
            </section>

            {/* Connect */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Connect</h3>
                <div className="flex flex-col gap-3">
                    {user.website && (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-black dark:hover:text-white transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            Website
                        </a>
                    )}
                    {/* Placeholder Socials */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        LinkedIn
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        Instagram
                    </div>
                </div>
            </section>

            {/* Monetization Preview */}
            <section className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-serif font-bold mb-2">Join the Inner Circle</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Get exclusive access to behind-the-scenes content and early exhibition previews.
                </p>
                <button className="w-full py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    Become a Patron
                </button>
            </section>

            {/* Achievements / Badges */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Achievements</h3>
                <div className="flex gap-2 flex-wrap">
                    <Badge label="Early Adopter" />
                    <Badge label="Curator" />
                    <Badge label="Verified" />
                </div>
            </section>
        </div>
    );
}

const Badge = ({ label }: { label: string }) => (
    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
        {label}
    </span>
);
