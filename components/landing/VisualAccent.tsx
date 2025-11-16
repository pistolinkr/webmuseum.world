'use client';

import { motion } from 'framer-motion';

export default function VisualAccent() {
  return (
    <section className="landing-accent">
      <div className="landing-accent__container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.4 }}
          className="landing-accent__shape"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="landing-accent__float"
          >
            <div className="landing-accent__circle landing-accent__circle--1" />
            <div className="landing-accent__circle landing-accent__circle--2" />
            <div className="landing-accent__circle landing-accent__circle--3" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

