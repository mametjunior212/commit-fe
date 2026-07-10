import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import VerifyOtpSection from '@/pages/VerifyOtpSection';

const VerifyOtpPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <VerifyOtpSection />
      <Footer />
    </div>
  );
};

export default VerifyOtpPage;
