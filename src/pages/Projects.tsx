import { useState, useMemo, useCallback, useRef, forwardRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { ArrowUpRight, ArrowRight, Search } from 'lucide-react';
import { Project } from '@/components/type/projectType';
import { useEvent } from '@/hooks/useEvent';

type ProjectCardProps = {
  project: Project;
  index: number;
};

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(({ project, index }, ref) => {

  const [isHovered, setIsHovered] = useState(false);
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.svg'];
  const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];

  function endsWithExt(url: string, exts: string[]) {
    const lower = url.split('?')[0].toLowerCase();
    return exts.some((ext) => lower.endsWith(ext));
  }
  function isImageUrl(url?: string) {
    if (!url) return false;
    return endsWithExt(url, IMAGE_EXTENSIONS);
  }
  function isVideoUrl(url?: string) {
    if (!url) return false;
    return endsWithExt(url, VIDEO_EXTENSIONS);
  }

  const isImage = useMemo(() => isImageUrl(project.thumbnail), [project.thumbnail]);
  const isVideo = useMemo(() => isVideoUrl(project.thumbnail), [project.thumbnail]);


  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group ${index % 2 === 1 ? 'md:mt-32' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      <Link
        to={`/event/${project.uuid}`}
        className="block"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3] mb-8 rounded-sm">
          {project.thumbnail && isImage ? (
            <motion.img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            />
          ) : project.thumbnail && isVideo ? (
            <video
              src={project.thumbnail}
              poster={project.title}
              muted
              playsInline
              loop
              preload="metadata"
              className="block w-full h-auto object-cover"
            />
          ) : (<motion.img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          />)}

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

          {/* Description */}
          <p className="text-muted-foreground line-clamp-2 max-w-md text-lg leading-relaxed">
            {project.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
);


const Projects = () => {

  // ---- React Query: cukup panggil hook yang sudah dipisah
  const { data: apiMenus = [], isLoading, error } = useEvent();

  // Derived links
  const event = useMemo(() => apiMenus, [apiMenus]);

  const categories = ['All', ...Array.from(new Set(event.map(p => p.category)))];

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const projectsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const projectsInView = useInView(projectsRef, { once: true, margin: '-100px' });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const filteredProjects = useMemo(() => {
    let result = event;

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery)
      );
    }

    return result;
  }, [event, activeCategory, searchQuery]);

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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-12"
          >
            <span className="text-sm font-mono text-accent">01</span>
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-mono text-muted-foreground tracking-wider">ACTIVITY</span>
          </motion.div>

          <div className="max-w-4xl">
            {['Selected', 'Events'].map((text, index) => (
              <div key={text} className="overflow-hidden">
                <motion.h1
                  initial={{ y: '100%' }}
                  animate={heroInView ? { y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  className={`font-syne font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] ${index === 1 ? 'text-accent' : 'text-foreground'
                    }`}
                >
                  {text}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mt-8"
          >
          </motion.p>
        </div>
      </section>

      {/* Search and Category Filter */}
      <section ref={projectsRef} className="pb-20 pt-16">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-mono text-accent">02</span>
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-mono text-muted-foreground tracking-wider">ALL Activity</span>
            </div>

            <div className="border border-border bg-card">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Categories */}
                <div className="flex-1 overflow-x-auto no-scrollbar">
                  <div className="flex items-center h-full min-h-[4rem]">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`group relative h-16 px-8 flex items-center justify-center text-sm font-mono uppercase tracking-wider transition-all hover:bg-accent hover:text-accent-foreground whitespace-nowrap border-r border-border last:border-r-0 ${activeCategory === category
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground bg-transparent'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="w-full md:w-[400px] relative group bg-background/50 hover:bg-background transition-colors">
                  <div className="relative h-16 flex items-center px-6">
                    <Search className="w-5 h-5 text-muted-foreground mr-4" />
                    <input
                      type="text"
                      placeholder="Search ..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50 h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 md:pb-32" ref={projectsRef}>
        <div className="container-wide">
          <motion.div
            layout
            className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.uuid} project={project} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-border"
            >
              <p className="text-muted-foreground text-lg">No projects found matching your criteria.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-foreground/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* <div className="container-wide text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-mono text-accent mb-6 block">START A PROJECT</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-syne font-bold mb-6">
              Have an idea in mind?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              Let's collaborate to bring your vision to life. We're always looking for
              new challenges and innovative projects.
            </p>
            <MagneticButton>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full"
              >
                Get in Touch
                <motion.div
                  className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center"
                  whileHover={{ rotate: 45 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </MagneticButton>
          </motion.div>
        </div> */}
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
