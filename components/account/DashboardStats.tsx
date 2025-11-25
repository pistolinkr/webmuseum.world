'use client';

import { motion } from 'framer-motion';

interface DashboardStatsProps {
    stats: {
        views: number;
        subscribers: number;
        artworks: number;
        likes: number;
    };
    onCreateExhibition: () => void;
}

export default function DashboardStats({ stats, onCreateExhibition }: DashboardStatsProps) {
    return (
        <div className="sticky top-20 z-40 mx-auto max-w-6xl -mt-8 px-4 mb-12">
            <motion.div
                className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start overflow-x-auto pb-2 md:pb-0">
                    <StatItem label="Total Views" value={stats.views.toLocaleString()} trend="+12%" />
                    <StatItem label="Subscribers" value={stats.subscribers.toLocaleString()} trend="+5" />
                    <StatItem label="Artworks" value={stats.artworks.toLocaleString()} />
                    <StatItem label="Likes" value={stats.likes.toLocaleString()} />
                </div>

                <button
                    onClick={onCreateExhibition}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition shadow-md whitespace-nowrap"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Curate Exhibition</span>
                </button>
            </motion.div>
        </div>
    );
}

const StatItem = ({ label, value, trend }: { label: string, value: string, trend?: string }) => (
    <div className="flex flex-col min-w-[80px]">
        <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{value}</span>
            {trend && <span className="text-[10px] md:text-xs text-green-500 font-medium">{trend}</span>}
        </div>
    </div>
);
