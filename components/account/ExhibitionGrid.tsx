'use client';

import { Exhibition } from '@/types';
import ExhibitionCard from './ExhibitionCard';
import { motion } from 'framer-motion';

interface ExhibitionGridProps {
    exhibitions: Exhibition[];
    isOwner: boolean;
    onEdit?: (exhibition: Exhibition) => void;
    onDelete?: (exhibition: Exhibition) => void;
    onCreate?: () => void;
}

export default function ExhibitionGrid({
    exhibitions,
    isOwner,
    onEdit,
    onDelete,
    onCreate
}: ExhibitionGridProps) {
    if (exhibitions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <path d="M3 9h18M9 3v18" />
                    </svg>
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">The Gallery is Empty</h3>
                <p className="text-gray-500 max-w-md mb-8">
                    Your museum awaits its first collection. Curate your masterpieces and share them with the world.
                </p>
                {isOwner && onCreate && (
                    <button
                        onClick={onCreate}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-80 transition shadow-lg"
                    >
                        Curate First Exhibition
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
            {exhibitions.map((exhibition, index) => (
                <ExhibitionCard
                    key={exhibition.id}
                    exhibition={exhibition}
                    isOwner={isOwner}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    priority={index === 0} // First item is featured
                />
            ))}
        </div>
    );
}
