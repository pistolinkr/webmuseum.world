import LandingHero from '@/components/landing/LandingHero';
import VisualAccent from '@/components/landing/VisualAccent';
import LandingFeatures from '@/components/landing/LandingFeatures';
import FeaturedExhibitions from '@/components/home/FeaturedExhibitions';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <VisualAccent />
      <FeaturedExhibitions />
      <FeaturedArtists />
      <LandingFeatures />
      <LandingFooter />
    </>
  );
}
