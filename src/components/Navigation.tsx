import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import logo from '@/assets/logo-Web.png';

const navLinks = [
  { name: 'Event', href: '/event', number: '01' },
  { name: 'About', href: '/about', number: '02' },
  // { name: 'Services', href: '/services', number: '03' },
  // { name: 'Blog', href: '/blog', number: '04' },
  { name: 'Contact', href: '/contact', number: '03' },
];

export const Navigation = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const location = useLocation();

  // Smooth cursor follower for nav
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const setOffset = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-offset', `${height}px`);
    };

    setOffset();

    const ro = new ResizeObserver(() => setOffset());
    ro.observe(el);
    window.addEventListener('resize', setOffset);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setOffset);
    };
  }, [isScrolled]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href: string) => location.pathname === href;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  return (
    <>
      {/* Floating nav container */}
      <motion.nav
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          className={`mx-auto transition-all duration-700 ${
            isScrolled 
              ? 'mt-4 max-w-5xl rounded-2xl bg-gray-300/50 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-background/20' 
              : 'mt-0 max-w-full bg-transparent border-none shadow-none backdrop-blur-none'
          }`}
        >
          <div className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled ? 'px-6 py-3' : 'py-6 md:py-8'
          }`}>
            
            {/* Logo - Animated morphing design */}
            <Link to="/" className="group relative">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              > 
                {/* Logo text - only on desktop */}
                <div className="hidden sm:block overflow-hidden">
                  {/* <motion.span 
                    className="font-syne text-lg font-bold tracking-tight block"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    STUDIO
                  </motion.span> */}
                  <motion.img src={logo} alt="CommIT Logo"/>
                </div>
              </motion.div>
              
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute -inset-4 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              />
            </Link>

            {/* Desktop Navigation - Creative layout */}
            <div 
              className="hidden lg:flex items-center relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Cursor follower glow */}
              {hoveredIndex !== null && (
                <motion.div
                  className="absolute w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none -z-10"
                  style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
                />
              )}
              
              <div className="flex items-center">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onMouseEnter={() => setHoveredIndex(index)}
                    className="group relative px-5 py-3"
                  >
                    {/* Number indicator */}
                    <motion.span 
                      className={`absolute -top-1 left-3 text-[10px] font-mono transition-all duration-300 ${
                        hoveredIndex === index || isActiveLink(link.href) 
                          ? 'text-accent opacity-100' 
                          : 'text-muted-foreground/40 opacity-0'
                      }`}
                      initial={{ y: 5 }}
                      animate={{ 
                        y: hoveredIndex === index || isActiveLink(link.href) ? 0 : 5,
                        opacity: hoveredIndex === index || isActiveLink(link.href) ? 1 : 0
                      }}
                    >
                      {link.number}
                    </motion.span>
                    
                    {/* Link text with split animation */}
                    <span className="relative block overflow-hidden">
                      <motion.span 
                        className={`block text-sm font-medium tracking-wide transition-colors duration-300 ${
                          isActiveLink(link.href) 
                            ? 'text-accent' 
                            : 'text-foreground/70 group-hover:text-foreground'
                        }`}
                        animate={{ 
                          y: hoveredIndex === index ? -2 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                      </motion.span>
                    </span>
                    
                    {/* Animated underline */}
                    <motion.div 
                      className="absolute bottom-2 left-5 right-5 h-px bg-accent origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: isActiveLink(link.href) ? 1 : hoveredIndex === index ? 1 : 0 
                      }}
                      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </Link>
                ))}
              </div>
              
              {/* Separator */}
              <div className={`w-px h-6 mx-4 transition-colors duration-500 ${isScrolled ? 'bg-border/50' : 'bg-transparent'}`} />
              
              <div className="flex items-center gap-2">
                {/* Sign In Member */}
                {/* <MagneticButton className="group relative ml-2"> */}
                  {/* <Link 
                    to="/contact" 
                    className="relative flex items-center gap-3 px-5 py-2.5 bg-foreground text-background rounded-full overflow-hidden"
                  > */}
                    {/* Rotating border effect */}
                    {/* <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent, hsl(var(--accent)), transparent)',
                        padding: '2px',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    
                    <span className="relative z-10 text-sm font-semibold">Sign In Member</span> */}
                    
                    {/* Animated arrow */}
                    {/* <motion.div
                      className="relative z-10 w-5 h-5 rounded-full bg-background/20 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                    >
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        <path
                          d="M2 10L10 2M10 2H4M10 2V8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.div> */}
                    
                    {/* Hover background */}
                    {/* <motion.div
                      className="absolute inset-0 bg-accent -z-0"
                      initial={{ y: '100%' }}
                      whileHover={{ y: 0 }}
                      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                    /> */}
                  {/* </Link> */}
                {/* </MagneticButton> */}
              </div>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center gap-4">
              <Link 
                to="/contact"
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-full"
              >
                Contact
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 w-10 h-10 flex items-center justify-center bg-muted/40 rounded-full"
                aria-label="Toggle menu"
              >
                <motion.div className="flex flex-col gap-1.5">
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                    className="w-5 h-0.5 bg-foreground origin-center"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="w-5 h-0.5 bg-foreground"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                    className="w-5 h-0.5 bg-foreground origin-center"
                  />
                </motion.div>
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-3">
              {/* Unique hamburger menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative w-10 h-10 flex flex-col items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <motion.div 
                  className="absolute inset-0 rounded-full border border-foreground/20"
                  animate={{ 
                    scale: isMobileMenuOpen ? 1.1 : 1,
                    borderColor: isMobileMenuOpen ? 'hsl(var(--accent))' : 'hsl(var(--foreground) / 0.2)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="absolute inset-1 rounded-full bg-muted/30"
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Morphing icon */}
                <div className="relative w-5 h-5">
                  <motion.span
                    className="absolute top-1 left-0 right-0 h-0.5 bg-foreground rounded-full origin-center"
                    animate={isMobileMenuOpen 
                      ? { rotate: 45, y: 5, width: '100%' } 
                      : { rotate: 0, y: 0, width: '100%' }
                    }
                  />
                  <motion.span
                    className="absolute top-[9px] left-0 h-0.5 bg-foreground rounded-full"
                    animate={isMobileMenuOpen 
                      ? { opacity: 0, x: 10 } 
                      : { opacity: 1, x: 0, width: '60%' }
                    }
                  />
                  <motion.span
                    className="absolute bottom-1 left-0 right-0 h-0.5 bg-foreground rounded-full origin-center"
                    animate={isMobileMenuOpen 
                      ? { rotate: -45, y: -5, width: '100%' } 
                      : { rotate: 0, y: 0, width: '80%' }
                    }
                  />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Background with gradient */}
            <motion.div 
              className="absolute inset-0 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Animated grid lines */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 h-px bg-border/30"
                  style={{ top: `${20 + i * 15}%` }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                />
              ))}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-border/20"
                  style={{ left: `${25 + i * 25}%` }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                />
              ))}
            </div>
            
            {/* Floating accent orb */}
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl"
              initial={{ x: '100%', y: '100%', opacity: 0 }}
              animate={{ x: '-20%', y: '20%', opacity: 1 }}
              exit={{ x: '100%', y: '100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            />

            {/* Navigation content */}
            <nav className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    className="group"
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-baseline gap-4 py-3 border-b border-border/20"
                    >
                      {/* Number */}
                      <span className={`text-sm font-mono transition-colors duration-300 ${
                        isActiveLink(link.href) ? 'text-accent' : 'text-muted-foreground/50 group-hover:text-accent'
                      }`}>
                        {link.number}
                      </span>
                      
                      {/* Link text */}
                      <span className={`text-4xl sm:text-5xl font-syne font-bold tracking-tight transition-all duration-300 ${
                        isActiveLink(link.href) 
                          ? 'text-accent' 
                          : 'text-foreground/80 group-hover:text-foreground group-hover:translate-x-2'
                      }`}>
                        {link.name}
                      </span>
                      
                      {/* Arrow on hover */}
                      <motion.svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="ml-auto text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <path
                          d="M5 19L19 5M19 5H8M19 5V16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="text-sm text-muted-foreground">
                  <p>Ready to start a project?</p>
                  <a href="mailto:hello@studio.design" className="text-foreground hover:text-accent transition-colors">
                    hello@studio.design
                  </a>
                </div>
                
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-full"
                >
                  Start a Project
                  <motion.div
                    className="w-6 h-6 rounded-full bg-accent-foreground/20 flex items-center justify-center"
                    whileHover={{ rotate: 45 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 11L11 3M11 3H5M11 3V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
