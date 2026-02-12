import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { getProjectById, projects } from '@/data/projects';
import CustomCursor from '@/components/CustomCursor';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ViewFull } from '@/components/ViewGallery';


const CaseStudy = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = getProjectById(id || '');

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });


  const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];
  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.split('?')[0].toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-syne font-bold mb-4">Project Not Found</h1>
            <Link to="/" className="text-accent hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nextProject = getProjectById(project.nextProject);
  const prevProject = getProjectById(project.prevProject);

  return (
    <div className="min-h-screen bg-background selection:bg-accent/20 flex flex-col">
      <Navigation />
      <Helmet>
        <title>{project.title} | CommIT</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <CustomCursor />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50"
        style={{ scaleX }}
      />

      <main className="flex-1 pt-24 md:pt-32">
        {/* Swiss Grid Layout Wrapper (Similar to Blog, but adapted for Project) */}
        <div className="container-wide max-w-[90rem] mx-auto px-4 sm:px-6 mb-20">

          {/* Grid Container */}
          <div className="border border-foreground/10 bg-background relative z-10">

            {/* 1. Header Grid Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 border-b border-foreground/10">
              {/* Breadcrumbs / Back */}
              <div className="col-span-1 lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-foreground/10 flex items-center">
                <Link to="/event" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Back to Work
                </Link>
                <span className="mx-4 text-foreground/20">/</span>
                <span className="text-sm text-foreground/40 uppercase tracking-wider">{project.category}</span>
              </div>

              {/* Year Cell */}
              <div className="col-span-1 p-6 flex items-center justify-between lg:justify-center text-sm font-medium text-foreground/80">
                <span className="lg:hidden text-foreground/40 uppercase tracking-wider">Year</span>
                <div className="flex items-center gap-2 font-mono">
                  {project.year}
                </div>
              </div>
            </div>

            {/* 2. Title Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-12 p-6 md:p-12 lg:p-16 border-b border-foreground/10">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-syne font-bold leading-[0.9] tracking-tight text-foreground uppercase"
                >
                  {project.title}
                </motion.h1>

                <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-lg md:text-xl text-foreground/60 max-w-4xl leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full border border-foreground/10 text-xs font-bold uppercase tracking-widest bg-foreground/5">
                      Event
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Hero Image - Full Grid Width */}
            {project.template == '1' ?
              (<div className="w-full border-b border-foreground/10 overflow-hidden bg-foreground/5">
                <motion.div
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="aspect-[16/9] w-full relative"
                >
                  <img
                    src={project.heroImage ?? ''}
                    alt={project.title ?? ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </motion.div>
              </div>)
              : project.template == '2' ? (<>

                <motion.div
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="aspect-[16/9] w-full relative md:grid md:grid-cols-12 gap-2"
                >
                  <motion.img
                    src={project.heroImage ?? ''}
                    alt={project.title ?? ''}
                    className="w-full h-full object-cover md:col-span-9 rounded-lg"
                  />

                  <motion.video
                    src={project.herovideo ?? ''}
                    className="w-full h-full object-cover mt-5 md:mt-0 md:col-span-3 rounded-lg"
                    // autoPlay
                    loop
                    // muted
                    controls={true}
                    controlsList='nodownload'
                  ></motion.video>
                </motion.div>
              </>)
                : <></>
            }
            {/* 4. Content Area Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[50vh]">

              {/* Left Sidebar - Project Metadata */}
              <div className="lg:col-span-3 border-r border-foreground/10 bg-background">
                <div className="sticky top-24">
                  <div className="flex flex-col">
                    {/* Client Block */}
                    <div className="p-6 border-b border-foreground/10 relative group hover:bg-foreground/5 transition-colors">
                      <span className="absolute top-6 right-6 text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">01</span>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-3">Client</h4>
                      <p className="text-lg font-syne font-bold leading-tight group-hover:translate-x-1 transition-transform duration-300">
                        {project.client}
                      </p>
                    </div>

                    {/* Services Block - Digital Tags */}
                    <div className="p-6 relative group hover:bg-foreground/5 transition-colors">
                      <span className="absolute top-6 right-6 text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">02</span>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-4">Scope of Work</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-3 py-1 border border-foreground/10 text-[11px] font-mono uppercase tracking-wide rounded-sm text-foreground/70 hover:border-accent hover:text-accent hover:bg-background transition-colors cursor-default"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 p-6 md:p-12 lg:p-16">
                <motion.article
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="prose prose-lg md:prose-xl max-w-none prose-headings:font-syne prose-headings:font-bold prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-none prose-img:border prose-img:border-foreground/10"
                >
                  {/* About Section */}
                  {project.about && project.about !== '' &&
                    <>
                      <h3 className="text-2xl md:text-3xl font-syne font-bold mb-6">Tentang Event</h3>
                      <p className="mb-12 text-foreground/80 leading-relaxed"
                        style={{ whiteSpace: 'pre-line' }}>
                        {project.about}
                      </p>
                    </>
                  }

                  {/* Solution Section */}
                  {project.solution && project.solution !== '' &&
                    <>
                      <h3 className="text-2xl md:text-3xl font-syne font-bold mb-6">The Solution</h3>
                      <p className="mb-12 text-foreground/80 leading-relaxed">
                        {project.solution}
                      </p>
                    </>
                  }

                  {/* Impact / Results Highlight */}
                  {project.results.length !== 0 ? (
                    <div className="my-16 p-8 border border-foreground/10 bg-foreground/5 rounded-none">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-8">Key Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                        {project.results.map((result, i) => (
                          <div key={i}>
                            <span className="block text-4xl md:text-5xl font-syne font-bold mb-2">{result.split(' ')[0]}</span>
                            <span className="text-xs font-mono uppercase tracking-widest text-foreground/60">{result.split(' ').slice(1).join(' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <></>}
                </motion.article>

                {/* Gallery - Visual Archive Layout */}
                {project.gallery.length !== 0 && (
                  <div className="mt-12">
                    <div className="flex items-end justify-between mb-16">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-foreground/40 block mb-2">Visual Archive</span>
                        <h3 className="text-3xl font-syne font-bold">Dokumentasi Acara</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project.gallery.length} Assets Processed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {project.gallery.map((item: any, i: number) => {
                        const isObj = typeof item === 'object' && item !== null;
                        const type = isObj ? item.type : undefined;
                        const src = isObj ? item.src : item;
                        const poster = isObj ? item.poster : undefined;
                        const isVideo = type ? type === 'video' : isVideoUrl(src);
                        const aspectClass = i === 0 ? 'aspect-[21/9]' : 'aspect-square';

                        return (
                          <ViewFull
                            key={src || i}
                            src={src}
                            poster={poster}
                            title={project.title}
                            className={`group ${i === 0 ? 'md:col-span-2' : ''}`}
                            renderTrigger={(open) => (
                              <div className={`relative overflow-hidden bg-foreground/5 ${aspectClass}`}>
                                {isVideo ? (
                                  // Preview video (muted loop) atau cukup poster
                                  poster ? (
                                    <img
                                      src={poster}
                                      alt={`Gallery video ${i + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <video
                                      src={src}
                                      muted
                                      playsInline
                                      loop
                                      preload="metadata"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                  )
                                ) : (
                                  <img
                                    src={src}
                                    alt={`Gallery image ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                )}

                                {/* Overlay button */}
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={open}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
                                  data-cursor="view"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                                >
                                  <div className="px-4 py-2 bg-background text-foreground text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 inline-flex items-center gap-2">
                                    {isVideo ? (
                                      <>
                                        <Play className="w-4 h-4" />
                                        Play Video
                                      </>
                                    ) : (
                                      <>View Full</>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          />
                        );
                      })}
                    </div>

                    {/* Key Takeaways - Compact Accent Card (No Border) */}
                    {project.keyTakeaways.title && project.keyTakeaways.title !== '' && (
                      <div className="mt-24 relative overflow-hidden bg-accent text-accent-foreground p-8 md:p-12 selection:bg-white selection:text-accent rounded-sm">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 md:items-start">
                          <div className="md:w-1/4 pb-6 md:pb-0">
                            <span className="text-5xl md:text-6xl font-syne font-black block leading-none mb-2">The Shift.</span>
                            <span className="text-xs font-mono uppercase tracking-widest font-bold opacity-70">Retrospective</span>
                          </div>
                          <div className="md:w-3/4 md:pl-4">
                            <p className="text-xl md:text-2xl font-syne font-bold leading-snug mb-4">
                              "{project.keyTakeaways.isi}"
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="h-px w-8 bg-accent-foreground"></div>
                              <span className="text-xs font-mono uppercase tracking-widest font-bold">Insights</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Partner */}
                {project.partner && project.partner.length !== 0 && (
                  <motion.div>
                    <div className="flex items-end justify-between mt-16">
                      <div>
                        <h3 className="text-3xl font-syne font-bold">Partner</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project.partner.length} Partner
                      </span>
                    </div>
                    <motion.div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-10">
                      {project.partner.map((e: { img: string; partner: string; link: string; }, index: number) => {
                        return <motion.a href={e.link} className='rounded-xl border-[#f1f0f8] relative min-w-2 p-2 border-[3px]'>
                          <motion.img
                            src={e.img}
                            alt={e.partner}
                            className="block w-full h-auto object-cover"
                          ></motion.img>
                        </motion.a>
                      })}
                    </motion.div>
                  </motion.div>
                )}

                {/* Media Partner */}
                {project.media && project.media.length !== 0 && (
                  <motion.div>
                    <div className="flex items-end justify-between mt-16">
                      <div>
                        <h3 className="text-3xl font-syne font-bold">Media Partner</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project.media.length} Media Partner
                      </span>
                    </div>
                    <motion.div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-10">
                      {project.media.map((e: { img: string; media: string; link: string; }, index: number) => {
                        return <motion.a href={e.link} className='rounded-xl border-[#f1f0f8] relative min-w-2 p-2 border-[3px]'>
                          <motion.img
                            src={e.img}
                            alt={e.media}
                            className="block w-full h-auto object-cover"
                          ></motion.img>
                        </motion.a>
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        {
          project.nextProject && project.nextProject !== '' && (
            <section className="border-t border-foreground/10 bg-foreground/5 py-20">
              <div className="container-wide max-w-[90rem] mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-12">
                  <h2 className="text-3xl md:text-4xl font-syne font-bold uppercase">Next Project</h2>
                  <Link to="/event" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
                    View All Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {nextProject ? (
                  <Link
                    to={`/event/${nextProject.id}`}
                    className="group block border border-foreground/10 bg-background p-8 hover:border-accent transition-colors relative overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-[16/9] overflow-hidden bg-foreground/5">
                        <img
                          src={nextProject.heroImage}
                          alt={nextProject.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">
                          <span className="text-accent">{nextProject.category}</span>
                          <span>{nextProject.year}</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-syne font-bold leading-tight group-hover:text-accent transition-colors mb-6">
                          {nextProject.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                          View Event <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-12 text-foreground/40 italic">
                    End of portfolio.
                  </div>
                )}
              </div>
            </section>
          )
        }
      </main >

      <Footer />
    </div >
  );
};

export default CaseStudy;