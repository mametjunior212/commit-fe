import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RegisterSection from '@/components/sections/RegisterSection';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    let id = localStorage.getItem('data_user')
    if (id) {
      window.location.href = '/member';
    }
  })
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

      {/* <CustomCursor /> */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />

        <Navigation />

        <main>
          <RegisterSection />
        </main>

      </motion.div>
    </div>
  );
};

export default Register;
