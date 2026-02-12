import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CustomCursor from '@/components/CustomCursor';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WorkSection from '@/components/sections/WorkSection';
import ProcessSection from '@/components/sections/ProcessSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { OrganizationSchema, WebsiteSchema, ProfessionalServiceSchema } from '@/components/StructuredData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* <SEO 
        title="CommIT."
        description="We craft exceptional digital experiences through strategic design, innovative development, and creative storytelling. Transform your brand with our award-winning team."
        url="https://commit-id.org"
      /> */}
      {/* <OrganizationSchema />
      <WebsiteSchema />
      <ProfessionalServiceSchema /> */}

      <CustomCursor />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />
        
        <Navigation />
        
        <main>
          <HeroSection />
          {/* <AboutSection /> */}
          {/* <ServicesSection /> */}
          <WorkSection />
          {/* <ProcessSection /> */}
          <TestimonialsSection />
          {/* <CTASection /> */}
        </main>
        
        <Footer />
      </motion.div>
    </div>
  );
};

export default Index;
