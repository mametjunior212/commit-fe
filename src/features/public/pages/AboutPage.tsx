import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const AboutPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main ref={ref} className="pt-24 pb-20">
        <section className="container-wide mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-foreground/10 bg-card p-8"
          >
            <h1 className="text-4xl font-syne font-bold tracking-tight">About</h1>
            <p className="mt-4 max-w-3xl text-lg text-foreground/70">
              Halaman About telah dipindah ke struktur fitur publik.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
