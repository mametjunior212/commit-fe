import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Register from '@/pages/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Register />
      <Footer />
    </div>
  );
};

export default RegisterPage;
