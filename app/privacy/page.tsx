import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Web Museum',
  description: 'Web Museum Privacy Policy - Learn how we collect, use, and protect your personal information',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <div className="legal-page__header">
          <Link href="/" className="legal-page__logo">
            Web Museum
          </Link>
          <h1 className="legal-page__title">Privacy Policy</h1>
          <p className="legal-page__subtitle">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="legal-page__content">
          <section className="legal-page__section">
            <h2 className="legal-page__section-title">1. Introduction</h2>
            <p>
              Welcome to Web Museum ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital exhibition platform.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">2. Information We Collect</h2>
            
            <h3 className="legal-page__subsection-title">2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> When you create an account, we collect your email address, display name, and optional profile information such as bio, avatar, category, and location.</li>
              <li><strong>Content:</strong> We collect the exhibitions, artworks, and other content you create and upload to our platform.</li>
              <li><strong>Authentication:</strong> If you use social login (Google, GitHub, Microsoft, Apple), we receive basic profile information from those providers.</li>
            </ul>

            <h3 className="legal-page__subsection-title">2.2 Automatically Collected Information</h3>
            <ul>
              <li><strong>Usage Data:</strong> We collect information about how you interact with our platform, including pages visited, features used, and time spent.</li>
              <li><strong>Device Information:</strong> We may collect information about your device, browser type, and operating system.</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience and analyze platform usage.</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Communicate with you about your account and our services</li>
              <li>Personalize your experience on our platform</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Public Content:</strong> Exhibitions and artworks you mark as public will be visible to all users of the platform.</li>
              <li><strong>Service Providers:</strong> We may share information with third-party service providers who help us operate our platform (e.g., cloud storage, analytics).</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">5. Data Storage and Security</h2>
            <p>
              We use Firebase and other secure cloud services to store your data. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information through your account settings</li>
              <li>Delete your account and associated data</li>
              <li>Control the visibility of your content (public/private settings)</li>
              <li>Opt out of certain communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">8. Third-Party Services</h2>
            <p>
              Our platform integrates with third-party services including Firebase (authentication and database), cloud storage providers, and social login providers. These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">9. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__section-title">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through your account settings or by visiting our platform.
            </p>
          </section>
        </div>

        <div className="legal-page__footer">
          <Link href="/" className="legal-page__back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

