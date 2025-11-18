'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!currentUser) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="footer"
    >
      <div className="footer__container">
        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__section">
            <Link href="/" className="footer__logo">
              <Image
                src="/icon-white.png"
                alt="Web Museum"
                width={32}
                height={32}
                className="footer__logo-image"
              />
              <span className="footer__logo-text">Web Museum</span>
            </Link>
            <p className="footer__description">
              A digital exhibition platform for artists and art lovers to showcase and discover art online.
            </p>
          </div>

          {/* Links Sections */}
          <div className="footer__links">
            <div className="footer__section">
              <h3 className="footer__section-title">Explore</h3>
              <ul className="footer__link-list">
                <li>
                  <Link href="/exhibition" className="footer__link">
                    Exhibitions
                  </Link>
                </li>
                <li>
                  <Link href="/artist" className="footer__link">
                    Artists
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="footer__link">
                    Discover
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer__section">
              <h3 className="footer__section-title">Account</h3>
              <ul className="footer__link-list">
                <li>
                  <Link href="/auth/login" className="footer__link">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="footer__link">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/account" 
                    className="footer__link"
                    onClick={handleAccountClick}
                  >
                    My Account
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer__section">
              <h3 className="footer__section-title">Legal</h3>
              <ul className="footer__link-list">
                <li>
                  <Link href="/privacy" className="footer__link">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Pistolinkr. All rights reserved.
          </p>
          <p className="footer__tagline">
            Made with G.gear service 𝚫 team.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

