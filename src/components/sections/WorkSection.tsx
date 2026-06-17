import { motion, useInView } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedLine } from '@/components/AnimatedText';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/components/type/projectType'
import { useEvent } from '@/hooks/useEvent';
import { Event } from '@/mock/event';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group ${index % 2 === 1 ? 'md:mt-32' : ''}`}
    >
      <Link to={`/event/${project.uuid}`} className="block h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3] mb-8 rounded-none">
          <motion.img
            src={import.meta.env.VITE_FONT_END + project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          />

          {/* Hover Overlay - Subtle Tint */}
          <motion.div
            className="absolute inset-0 bg-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* View Project Button - Centered */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-24 h-24 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center">
              <span className="text-sm font-mono uppercase tracking-widest text-foreground">View</span>
            </div>
          </div>
        </div>

        {/* Content Below Image */}
        <div className="space-y-4">
          {/* Meta Data */}
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="h-px w-8 bg-border" />
            <span className="text-muted-foreground uppercase tracking-wider">
              {project.category}
            </span>
          </div>

          {/* Title & Arrow */}
          <div className="flex items-end justify-between gap-4 border-b border-border pb-6 group-hover:border-accent/50 transition-colors duration-500">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-syne font-bold leading-tight group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            <ArrowUpRight className="w-8 h-8 text-muted-foreground group-hover:text-accent group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-300 mb-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const WorkSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  // ---- React Query: cukup panggil hook yang sudah dipisah
  // const { data: apiMenus = [], isLoading, error } = useEvent();

  // Derived links
  // const event = useMemo(() => apiMenus, [apiMenus]);
  const event = useMemo(() => Event, []);
  return (
    <section id="work" ref={ref} className="section-padding bg-secondary/30 relative overflow-hidden">

      {/* Decorative large text background */}
      <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
        <h2 className="text-[20vw] font-syne font-black leading-none whitespace-nowrap animate-marquee">
          SELECTED EVENTS — SELECTED EVENTS —
        </h2>
      </div>

      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-3 h-3 bg-accent rounded-full animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Featured Event</span>
            </div>
            <AnimatedLine>
              <h2 className="font-syne font-bold text-3xl md:text-5xl tracking-tighter leading-[0.9]">
                Kegiatan<br />
                <span className="text-accent">Yang sudah kami lakukan.</span>
              </h2>
            </AnimatedLine>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link
              to="/event"
              className="group inline-flex flex-col items-end gap-2"
            >
              <span className="text-sm font-bold uppercase tracking-widest border-b border-foreground/20 pb-1 group-hover:border-accent transition-colors">View All Event</span>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          {event.slice(0, 4).map((events, index) => (
            <ProjectCard key={events.uuid} project={events} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
