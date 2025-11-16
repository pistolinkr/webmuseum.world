'use client';

import { motion } from 'framer-motion';

interface FeatureBlockProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureBlock({ icon, title, description, delay = 0 }: FeatureBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut', delay }}
      className="feature-block"
    >
      <div className="feature-block__icon">{icon}</div>
      <h3 className="feature-block__title">{title}</h3>
      <p className="feature-block__description">{description}</p>
    </motion.div>
  );
}

