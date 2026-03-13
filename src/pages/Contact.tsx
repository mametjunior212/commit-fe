import { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, Loader2, MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { getInParameterByName, getParameterByName, useParameter } from '@/hooks/useSetting';
import { toTelHref } from '@/lib/utils';



const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const formRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const formInView = useInView(formRef, { once: true, margin: '-100px' });

  const { data: apiParam } = useParameter();

  const lokasi = useMemo(() => getParameterByName(apiParam, "Lokasi"), [apiParam]);
  const kontak = useMemo(() => getParameterByName(apiParam, "Kontak"), [apiParam]);
  const email = useMemo(() => getParameterByName(apiParam, "email"), [apiParam]);
  const sosmed = useMemo(() => getInParameterByName(apiParam, ["instagram", "Twitter", "Facebook", "Tiktok"]), [apiParam]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX - window.innerWidth / 2) / 30,
      y: (e.clientY - window.innerHeight / 2) / 30,
    });
  };

  return (
    <div className="min-h-screen bg-background" onMouseMove={handleMouseMove}>
      <Navigation />

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-foreground/5"
              style={{ top: `${16.66 * (i + 1)}%` }}
              initial={{ scaleX: 0 }}
              animate={heroInView ? { scaleX: 1 } : {}}
              transition={{ delay: i * 0.05, duration: 1.2 }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-foreground/5"
              style={{ left: `${25 * (i + 1)}%` }}
              initial={{ scaleY: 0 }}
              animate={heroInView ? { scaleY: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.05, duration: 1.2 }}
            />
          ))}
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-32 right-[10%] w-20 h-20 border border-accent/20"
          style={{ transform: 'rotate(45deg)', x: mousePosition.x * 2, y: mousePosition.y * 2 }}
        />
        <motion.div
          className="absolute bottom-20 left-[15%] w-32 h-32 rounded-full border border-accent/10"
          style={{ x: mousePosition.x * -2, y: mousePosition.y * -2 }}
        />

        {/* Accent orb */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          style={{ top: '20%', right: '10%', x: mousePosition.x * 3, y: mousePosition.y * 3 }}
        />

        <div className="container-wide relative z-10">
          {/* Section header */}
          {/* <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-12"
          >
            <span className="text-sm font-mono text-accent">01</span>
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-mono text-muted-foreground tracking-wider">GET IN TOUCH</span>
          </motion.div> */}

          {/* <div className="max-w-4xl">
            {["Let's create", 'something', 'unique'].map((text, index) => (
              <div key={text} className="overflow-hidden">
                <motion.h1
                  initial={{ y: '100%' }}
                  animate={heroInView ? { y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  className={`font-syne font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] ${index === 2 ? 'text-accent' : 'text-foreground'
                    }`}
                >
                  {text}
                </motion.h1>
              </div>
            ))}
          </div> */}

          {/* <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mt-8"
          >
            Have a project in mind? We'd love to hear about it.
            Drop us a line and let's start the conversation.
          </motion.p> */}
        </div>
      </section>

      {/* Main Content */}
      <section ref={formRef} className="pb-24 md:pb-32 pt-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column - Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-12">
                <span className="text-sm font-mono text-accent">02</span>
                <div className="h-px w-12 bg-accent" />
                <span className="text-sm font-mono text-muted-foreground tracking-wider">CONTACT INFO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {/* Email */}
                <motion.a
                  key={email.uuid}
                  href={`mailto:${email.value_param}`}
                  className={`group relative p-8 border border-border bg-background hover:border-accent transition-all duration-500 flex flex-col justify-between min-h-[200px] ${email.value_param === 'Location' ? 'sm:col-span-2' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + 0 * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider group-hover:text-accent transition-colors">
                      {email.nama_param}
                    </span>
                    <Mail className="w-6 h-6 text-muted-foreground/50 group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                  </div>

                  <div>
                    <span className="text-xl md:text-2xl font-syne font-bold leading-tight group-hover:text-accent transition-colors break-words">
                      {email.value_param}
                    </span>
                    {email.value_param && (
                      <div className="mt-4 w-8 h-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>

                  {/* Hover Fill Effect */}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.a>
                {/* Kontak */}
                <motion.a
                  key={kontak.uuid}
                  href={`tel:${toTelHref(kontak.value_param)}`}
                  className={`group relative p-8 border border-border bg-background hover:border-accent transition-all duration-500 flex flex-col justify-between min-h-[200px] ${kontak.value_param === 'Location' ? 'sm:col-span-2' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + 0 * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider group-hover:text-accent transition-colors">
                      {kontak.nama_param}
                    </span>
                    <Phone className="w-6 h-6 text-muted-foreground/50 group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                  </div>

                  <div>
                    <span className="text-xl md:text-2xl font-syne font-bold leading-tight group-hover:text-accent transition-colors break-words">
                      {kontak.value_param}
                    </span>
                    {kontak.value_param && (
                      <div className="mt-4 w-8 h-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>
                </motion.a>
                {/* Lokasi */}
                <motion.a
                  key={lokasi.uuid}
                  href={`/#`}
                  className={`group relative p-8 border border-border bg-background hover:border-accent transition-all duration-500 flex flex-col justify-between min-h-[200px] ${lokasi.value_param === 'Location' ? 'sm:col-span-2' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + 0 * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider group-hover:text-accent transition-colors">
                      {lokasi.nama_param}
                    </span>
                    <MapPin className="w-6 h-6 text-muted-foreground/50 group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                  </div>

                  <div>
                    <span className="text-xl md:text-2xl font-syne font-bold leading-tight group-hover:text-accent transition-colors break-words">
                      {lokasi.value_param}
                    </span>
                    {lokasi.value_param && (
                      <div className="mt-4 w-8 h-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>

                  {/* Hover Fill Effect */}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.a>
              </div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="pt-8 border-t border-border"
              >
                <span className="text-xs font-mono text-muted-foreground block mb-6 uppercase tracking-wider">FOLLOW US</span>
                <div className="flex flex-wrap gap-4">
                  {sosmed.map((social, index) => (social.value_param !== "" &&
                    <motion.a
                      key={social.uuid}
                      href={social.value_param}
                      className="px-8 py-4 border border-border text-sm font-bold font-syne hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 min-w-[120px] text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={formInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      {social.nama_param}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Form */}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
