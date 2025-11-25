'use client';

import { Exhibition } from '@/types';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

interface ExhibitionCardProps {
    exhibition: Exhibition;
    isOwner: boolean;
    onEdit?: (exhibition: Exhibition) => void;
    onDelete?: (exhibition: Exhibition) => void;
    priority?: boolean;
}

export default function ExhibitionCard({
    exhibition,
    isOwner,
    onEdit,
    onDelete,
    priority = false
}: ExhibitionCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // 3D Tilt Effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`relative group w-full ${priority ? 'md:col-span-2 aspect-[2/1]' : 'aspect-[4/5]'} rounded-xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}
        >
            <Link href={`/exhibition/${exhibition.id}/story`} className="block w-full h-full">
                {/* Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                        backgroundImage: exhibition.thumbnailUrl
                            ? `url(${exhibition.thumbnailUrl})`
                            : 'url(/web_museum_static_placeholder.png)',
                        transform: "translateZ(0px)" // Fix for Safari
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Content */}
                <div
                    className="absolute bottom-0 left-0 w-full p-6 text-white"
                    style={{ transform: "translateZ(20px)" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        {exhibition.isPublic ? (
                            <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] uppercase tracking-wider font-bold rounded-full backdrop-blur-sm">
                                Public Gallery
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[10px] uppercase tracking-wider font-bold rounded-full backdrop-blur-sm">
                                Private Collection
                            </span>
                        )}
                        <span className="text-xs text-white/60 font-medium">
                            {exhibition.artworks?.length || 0} Artworks
                        </span>
                    </div>

                    <h3 className={`font-serif font-bold leading-tight mb-2 ${priority ? 'text-3xl' : 'text-xl'}`}>
                        {exhibition.title}
                    </h3>

                    <p className="text-sm text-white/70 line-clamp-2 max-w-[90%] group-hover:text-white transition-colors">
                        {exhibition.description || "No description provided."}
                    </p>
                </div>
            </Link>

            {/* Owner Actions */}
            {isOwner && (
                <div
                    className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit?.(exhibition);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"
                        title="Edit Exhibition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete?.(exhibition);
                        }}
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-full text-red-200 hover:text-white transition-colors border border-red-500/20"
                        title="Delete Exhibition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )}
        </motion.div>
    );
}
