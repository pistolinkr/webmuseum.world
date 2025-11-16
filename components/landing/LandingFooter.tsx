'use client';

import { motion } from 'framer-motion';

export default function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.6 }}
      className="landing-footer"
    >
      <div className="landing-footer__container">
        <p className="landing-footer__text">
          © {new Date().getFullYear()} Web Museum. Built with care for art lovers.
        </p>
      </div>
    </motion.footer>
  );
}

