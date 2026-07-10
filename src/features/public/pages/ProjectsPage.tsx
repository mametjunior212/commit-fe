import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Projects from '@/pages/Projects';

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Projects />
      <Footer />
    </div>
  );
};

export default ProjectsPage;
