import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ArrowRight, Linkedin, Twitter } from 'lucide-react';
import Footer from '@/components/Footer';
import MagneticButton from '@/components/MagneticButton';
import Navigation from '@/components/Navigation';
import img_struktur from '../../public/assets/Struktur-Organisasi.png';
import img_logo from '../../public/assets/CommIT-image-2.png';
import "../index.css";

const teamMembers = [
  {
    name: 'Alexandra Chen',
    role: 'Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    bio: 'Former design lead at Google with 15+ years shaping digital experiences.',
    linkedin: '#',
    twitter: '#',
    number: '01',
  },
  {
    name: 'Marcus Williams',
    role: 'Head of Strategy',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Brand strategist who has worked with Fortune 500 companies worldwide.',
    linkedin: '#',
    twitter: '#',
    number: '02',
  },
  {
    name: 'Sofia Rodriguez',
    role: 'Lead Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
    bio: 'Award-winning designer specializing in brand identity and digital products.',
    linkedin: '#',
    twitter: '#',
    number: '03',
  },
  {
    name: 'James Park',
    role: 'Technical Director',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    bio: 'Full-stack architect with a passion for performant, accessible web experiences.',
    linkedin: '#',
    twitter: '#',
    number: '04',
  },
  {
    name: 'Emma Thompson',
    role: 'Motion Designer',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Bringing brands to life through animation and interactive storytelling.',
    linkedin: '#',
    twitter: '#',
    number: '05',
  },
  {
    name: 'David Kim',
    role: 'Senior Developer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    bio: 'React specialist focused on building scalable, maintainable applications.',
    linkedin: '#',
    twitter: '#',
    number: '06',
  },
];

const values = [
  {
    title: 'Craft Over Speed',
    description: 'We believe in taking the time to get things right. Quality and attention to detail are never sacrificed for quick deliveries.',
    icon: '◇',
    number: '01',
  },
  {
    title: 'Bold Simplicity',
    description: 'The best solutions are often the simplest. We strip away the unnecessary to reveal what truly matters.',
    icon: '○',
    number: '02',
  },
  {
    title: 'Honest Collaboration',
    description: 'We work as partners, not vendors. Open communication and transparency guide every relationship.',
    icon: '△',
    number: '03',
  },
  {
    title: 'Continuous Growth',
    description: 'The digital landscape evolves constantly. We stay curious, learning and adapting to serve our clients better.',
    icon: '□',
    number: '04',
  },
];

const milestones = [
  { year: '2018', event: 'Studio founded in San Francisco' },
  { year: '2019', event: 'First Awwwards recognition' },
  { year: '2020', event: 'Expanded to 10 team members' },
  { year: '2021', event: 'Opened remote-first operations globally' },
  { year: '2022', event: 'Reached 100+ completed projects' },
  { year: '2023', event: 'Named Top 50 Design Agency' },
  { year: '2024', event: 'Launched strategic partnerships program' },
];

const About = () => {
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroInView = useInView(heroRef, { once: true });
  const storyInView = useInView(storyRef, { once: true, margin: '-100px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });
  const teamInView = useInView(teamRef, { once: true, margin: '-100px' });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX - window.innerWidth / 2) / 30,
      y: (e.clientY - window.innerHeight / 2) / 30,
    });
  };

  return (
    <div className="min-h-screen bg-background" onMouseMove={handleMouseMove}>
      <Navigation />

      {/* Story Section */}
      <section ref={storyRef} className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container-wide relative z-10">
          {/* Narrative Header */}
          <div className="max-w-4xl mx-auto text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className="text-sm font-mono text-accent">01</span>
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-mono text-muted-foreground tracking-wider">Tentang Kami</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-syne font-bold text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight"
            >
              Selamat datang di CommIT Indonesia!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 text-lg text-muted-foreground leading-relaxed text-left"
            >
              <p>
                CommIT Indonesia adalah Komunitas Perkumpulan IT Seluruh Indonesia yang didirikan pada tanggal 25 Agustus 2023. Sebagai wadah bagi para profesional IT dari berbagai segmen industri seperti Hospitality, Pendidikan, Sistem Integrator, Instansi Pemerintahan, Theme Park, dan lainnya, kami bertekad untuk menciptakan platform yang memungkinkan kolaborasi dan pertukaran pengetahuan yang produktif.
                <br></br>
                <br></br>
                Kami percaya bahwa melalui diskusi dan kolaborasi, kami dapat memperkuat industri IT di Indonesia serta meningkatkan kemampuan dan inovasi di bidang teknologi informasi. Dengan menghubungkan para profesional IT dari berbagai latar belakang, kami berharap dapat mendorong pertumbuhan dan kemajuan yang berkelanjutan dalam industri ini.
                <br></br>
                <br></br>
                Bergabunglah dengan kami untuk menjadi bagian dari komunitas yang dinamis dan bersemangat untuk mengembangkan potensi teknologi informasi di Indonesia. Mari kita bersama-sama menciptakan masa depan yang lebih baik melalui kolaborasi, pembelajaran, dan inovasi dalam CommIT Indonesia.
              </p>
            </motion.div>
          </div>

          {/* Struktur Organisasi */}
          <div className="max-w-4xl mx-auto text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className="text-sm font-mono text-accent">02</span>
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-mono text-muted-foreground tracking-wider">Struktur Organisasi Kami</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground leading-relaxed text-left"
            >
              <motion.img
                src={img_struktur}
                alt="Struktur Organisasi CommIT Indonesia"
                className="mx-auto"
              />
            </motion.div>
          </div>
          {/* Logo */}
          <div className="max-w-xl mx-auto text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className="text-sm font-mono text-accent">03</span>
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-mono text-muted-foreground tracking-wider">Logo CommIT Indonesia</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-muted-foreground leading-relaxed text-left"
            >
              <motion.img
                src={img_logo}
                alt="Logo CommIT Indonesia"
                className="mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
