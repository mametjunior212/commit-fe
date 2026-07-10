import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/public/HeroSection';
import WorkSection from '@/components/sections/public/WorkSection';
import TestimonialsSection from '@/components/sections/public/TestimonialsSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <WorkSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
