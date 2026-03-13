import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { AnimatedLine } from '@/components/AnimatedText';
import { ArrowLeft, ChevronLeft, ChevronRight, Link, Quote } from 'lucide-react';
import { useListPartner } from '@/hooks/useListPartner';
const testimonials = [
  {
    id: 1,
    quote: "Bergabung sebagai member CommIT Indonesia memberikan saya banyak insight baru di dunia IT. CommIT menjadi wadah komunikasi dan informasi yang sangat bermanfaat untuk berbagi pengalaman, berdiskusi, dan memperluas networking. Di sini saya tidak hanya mendapatkan pengetahuan, tetapi juga relasi dan kolaborasi yang positif.",
    author: 'Ridwan Rahadiansyah',
    role: 'IT Manager, Swiss-Bel Resort Dago Heritage Bandung',
    avatar: 'RR',
  },
  {
    id: 2,
    quote: "CommIT Indonesia bukan sekadar komunitas, tapi tempat bertemunya para profesional IT yang ingin maju bersama. Banyak kesempatan kolaborasi dan bertukar ide yang sangat bermanfaat untuk pengembangan skill maupun bisnis.",
    author: 'Angga T Yanuar',
    role: 'IT Manager, Grand Sunshine Bandung',
    avatar: 'AY',
  },
  // {
  //   id: 3,
  //   quote: "A true partnership from day one. They challenged our thinking, pushed boundaries, and delivered work we're incredibly proud of.",
  //   author: 'Emma Watson',
  //   role: 'CMO, Ethereal Design',
  //   avatar: 'EW',
  // },
];

// const clients = [
//   'Bandung24jam',
//   'Businessinasia',
//   'Elshinta',
//   'Jabar Exspress',
//   'SWA',
//   'TribunJabarID',
//   'Biskom',
//   'IT works',
//   'Itech',
//   'Radarbandung',
//   'Trijaya',
//   'Info komputer',
//   'Ayo bandung',
//   'Bussines news',
//   'Berita kbb',
//   'Mahavira',
//   'CBN',
//   'Fibernet',
//   'Gadingnet',
//   'Iforte',
//   'Indosat',
//   'InfiniTV',
//   'Lintas Arta',
//   'Melvar Prima Solusi',
//   'Mynetfiber',
//   'Solusi Jaringan Integrasi',
//   'Zeus',
// ];

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // Ambil Partner Dari DB
  const { data: listPartner, isLoading: loadingList, error: errorList } = useListPartner();
  const partner = useMemo(() => listPartner, [listPartner]);

  // ⬇️ Setelah SEMUA hooks dipanggil, baru lakukan guard dan return
  if (loadingList) {
    return (
      <div className="min-h-screen bg-background flex flex-col">

        <div className="flex-1 flex items-center justify-center">Loading…</div>
      </div>
    );
  }

  if (errorList) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">Terjadi kesalahan memuat data.</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-full">
          <div className="text-center">
            <h1 className="text-4xl font-syne font-bold mb-4">Project Not Found</h1>
            <Link to="/" className="text-accent hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <section ref={ref} className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute left-0 right-0 h-px bg-foreground/5"
            style={{ top: `${25 * (i + 1)}%` }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: i * 0.1, duration: 1.2 }}
          />
        ))}
      </div>

      {/* Large quote decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.03, scale: 1 } : {}}
        transition={{ duration: 1 }}
        className="absolute top-20 left-10 pointer-events-none"
      >
        <Quote className="w-64 h-64 text-foreground" strokeWidth={1} />
      </motion.div>

      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-8"
            >
              <span className="text-sm font-mono text-accent">05</span>
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-mono text-muted-foreground tracking-wider">TESTIMONIALS</span>
            </motion.div>

            <AnimatedLine delay={0.3}>
              <h2 className="font-syne font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1]">
                Apa kata member kami.
              </h2>
            </AnimatedLine>
          </div>

          {/* Navigation arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            <button
              onClick={prevSlide}
              className="w-12 h-12 border border-foreground/20 flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 group-hover:text-accent transition-colors" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 border border-foreground/20 flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 group-hover:text-accent transition-colors" />
            </button>
          </motion.div>
        </div>

        {/* Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative min-h-[320px] md:min-h-[280px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 50,
                }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className={`absolute inset-0 ${activeIndex === index ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <div className="p-8 md:p-12 border border-border/50 bg-card/30 backdrop-blur-sm">
                  {/* Quote icon */}
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-8">
                    <Quote className="w-5 h-5 text-accent" />
                  </div>

                  {/* Quote text */}
                  <blockquote className="font-syne text-l font-medium leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-syne font-bold text-accent">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <span className="font-syne font-semibold block">{testimonial.author}</span>
                      <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                    </div>
                  </div>

                  {/* Decorative corners */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-accent/30" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent/30" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-[13rem] md:mt-28">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="group relative h-2 transition-all duration-300"
              >
                <div className={`w-12 h-full transition-all duration-300 ${activeIndex === index ? 'bg-accent' : 'bg-border hover:bg-border/80'
                  }`} />
                {activeIndex === index && (
                  <motion.div
                    className="absolute inset-0 bg-accent"
                    layoutId="active-indicator"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Client Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-[12rem] md:mt-28 relative"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-mono text-muted-foreground">Our Partner</span>
            <div className="flex-1 h-px bg-border/50 ml-8" />
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-secondary/30 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-secondary/30 to-transparent z-10" />

            <motion.div
              animate={{ x: ['0%', '-500%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="flex gap-16 whitespace-nowrap py-4"
            >
              {partner.map((client, index) => (
                <span
                  key={index}
                  className="text-xl font-syne font-bold text-muted-foreground/40 hover:text-foreground transition-colors duration-1000 cursor-default"
                >
                  {client.nama}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
