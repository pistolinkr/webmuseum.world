'use client';

import FeatureBlock from './FeatureBlock';

const features = [
  {
    icon: '📖',
    title: 'Narrative Stories',
    description: 'Experience exhibitions through immersive scroll-based narratives that guide you through each artwork.',
  },
  {
    icon: '🖼️',
    title: 'Interactive Gallery',
    description: 'Browse high-quality images with smooth zoom and pan interactions, powered by PhotoSwipe.',
  },
  {
    icon: '🌐',
    title: '3D Spaces',
    description: 'Walk through virtual exhibition halls in a 3D environment, bringing the museum experience online.',
  },
  {
    icon: '☁️',
    title: 'Cloud-Powered',
    description: 'Fast, reliable hosting with Firebase and Cloudflare R2 for seamless content delivery worldwide.',
  },
];

export default function LandingFeatures() {
  return (
    <section className="landing-features">
      <div className="landing-features__container">
        {features.map((feature, index) => (
          <FeatureBlock
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>
    </section>
  );
}

