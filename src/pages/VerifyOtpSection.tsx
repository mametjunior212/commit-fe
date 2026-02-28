import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import VerifyOtpSection from '@/components/sections/VerifyOtpSection';

const VerifyOtp = () => {
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
                    <VerifyOtpSection />
                </main>

            </motion.div>
        </div>
    );
};

export default VerifyOtp;
