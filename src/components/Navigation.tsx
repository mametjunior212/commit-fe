import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import MagneticButton from './MagneticButton';
import Url from '../Uri/url'; // pastikan Url.MENU_API tersedia
import { useMenus } from '@/hooks/useMenu';
import { mapApiToNav } from '@/lib/utils';

// =====================
// Komponen Navigation
// =====================
export const Navigation: React.FC = () => {


  const navRef = useRef<HTMLElement | null>(null);
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(null);

  // motion values
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    const ro = new ResizeObserver(setOffset);
    ro.observe(el);
    window.addEventListener('resize', setOffset);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setOffset);
    };
  }, [isScrolled]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileOpenIndex(null);
  }, [location.pathname]);

  const isActiveLink = (href?: string | null) => Boolean(href) && location.pathname === href;

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  // ---- React Query: cukup panggil hook yang sudah dipisah
  const { data: apiMenus = [], isLoading, error } = useMenus();

  // Derived links
  const navLinks = useMemo(() => mapApiToNav(apiMenus), [apiMenus]);

  // =====================
  // Render
  // =====================
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
          className={`mx-auto transition-all duration-700 ${isScrolled
            ? 'mt-4 max-w-5xl rounded-2xl bg-gray-300/50 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-background/20'
            : 'mt-0 max-w-full bg-transparent border-none shadow-none backdrop-blur-none'
            }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'px-6 py-3' : 'py-6 md:py-8'
              }`}
          >
            {/* Logo */}
            <Link to="/" className="group relative" onClick={() => setIsMobileMenuOpen(false)}>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <motion.img
                  src={import.meta.env.VITE_FONT_END + "/assets/logo-Web.png"}
                  alt="CommIT Logo"
                  className="relative h-full flex items-center justify-center"
                />
                <div className="hidden overflow-hidden">
                  <motion.img src={import.meta.env.VITE_FONT_END + "/assets/logo-Web.png"} alt="CommIT Logo" />
                </div>
              </motion.div>
              <motion.div
                className="absolute -inset-4 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              />
            </Link>

            {/* Desktop Navigation */}
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
                {/* Loading / error state */}
                {isLoading && (
                  <span className="px-5 py-3 text-sm text-muted-foreground">Loading menu…</span>
                )}
                {error && (
                  <span className="px-5 py-3 text-sm text-red-500">Gagal memuat menu</span>
                )}

                {!isLoading &&
                  !error &&
                  navLinks.map((link, index) => {
                    const hasChildren =
                      Array.isArray(link.children) && link.children.length > 0;
                    const isHovered = hoveredIndex === index;

                    // status aktif untuk parent & anak
                    const isAnyChildActive =
                      hasChildren && link.children.some((child) => isActiveLink(child.href));

                    const hasSubmenu = hasChildren ?
                      (<motion.div
                        key={`${link.uuid}-${link.name}`}
                        onClick={(e) => {
                          if (!link.href) e.preventDefault(); // parent tanpa href
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        className="group relative px-5 py-3"
                      >
                        {/* Number indicator */}
                        <motion.span
                          className={`absolute -top-1 left-3 text-[10px] font-mono transition-all duration-300 ${hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive
                            ? 'text-accent opacity-100'
                            : 'text-muted-foreground/40 opacity-0'
                            }`}
                          initial={{ y: 5 }}
                          animate={{
                            y: hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive ? 0 : 5,
                            opacity:
                              hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive ? 1 : 0,
                          }}
                        >
                          {link.number}
                        </motion.span>

                        {/* Link text */}
                        <span className="relative block overflow-hidden">
                          <motion.span
                            className={`block text-sm font-medium tracking-wide transition-colors duration-300 ${isActiveLink(link.href) || isAnyChildActive
                              ? 'text-accent'
                              : 'text-foreground/70 group-hover:text-foreground'
                              }`}
                            animate={{ y: hoveredIndex === index ? -2 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {link.name}
                          </motion.span>
                        </span>

                        {/* Underline */}
                        <motion.div
                          className="absolute bottom-2 left-5 right-5 h-px bg-accent origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX:
                              isActiveLink(link.href) || isAnyChildActive
                                ? 1
                                : hoveredIndex === index
                                  ? 1
                                  : 0,
                          }}
                          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        />

                        {/* Submenu panel */}
                        <AnimatePresence>
                          {hasChildren && isHovered && (
                            <motion.div
                              key={`${link.name}-submenu`}
                              role="menu"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute left-3 top-full z-40 mt-1 min-w-[200px] rounded-md border
                                         border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70
                                         shadow-lg p-1"
                            >
                              {link.children.map((child) => {
                                const childActive = isActiveLink(child.href);
                                return (
                                  <Link
                                    key={`${child.uuid}-${child.name}`}
                                    to={child.href ?? '#'}
                                    onClick={(e) => {
                                      if (!child.href) e.preventDefault();
                                    }}
                                    role="menuitem"
                                    className={`flex items-center gap-2 rounded-[6px] px-3 py-2 text-sm transition-colors
                                      ${childActive
                                        ? 'bg-accent/10 text-accent'
                                        : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground'
                                      }`}
                                  >
                                    <span>{child.name}</span>
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>) :
                      (<Link
                        key={`${link.uuid}-${link.name}`}
                        to={link.href ?? '#'}
                        onClick={(e) => {
                          if (!link.href) e.preventDefault(); // parent tanpa href
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        className="group relative px-5 py-3"
                      >
                        {/* Number indicator */}
                        <motion.span
                          className={`absolute -top-1 left-3 text-[10px] font-mono transition-all duration-300 ${hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive
                            ? 'text-accent opacity-100'
                            : 'text-muted-foreground/40 opacity-0'
                            }`}
                          initial={{ y: 5 }}
                          animate={{
                            y: hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive ? 0 : 5,
                            opacity:
                              hoveredIndex === index || isActiveLink(link.href) || isAnyChildActive ? 1 : 0,
                          }}
                        >
                          {link.number}
                        </motion.span>

                        {/* Link text */}
                        <span className="relative block overflow-hidden">
                          <motion.span
                            className={`block text-sm font-medium tracking-wide transition-colors duration-300 ${isActiveLink(link.href) || isAnyChildActive
                              ? 'text-accent'
                              : 'text-foreground/70 group-hover:text-foreground'
                              }`}
                            animate={{ y: hoveredIndex === index ? -2 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {link.name}
                          </motion.span>
                        </span>

                        {/* Underline */}
                        <motion.div
                          className="absolute bottom-2 left-5 right-5 h-px bg-accent origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX:
                              isActiveLink(link.href) || isAnyChildActive
                                ? 1
                                : hoveredIndex === index
                                  ? 1
                                  : 0,
                          }}
                          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        />
                      </Link>)

                    return hasSubmenu;
                  })}
              </div>

              {/* Separator */}
              <div
                className={`w-px h-6 mx-4 transition-colors duration-500 ${isScrolled ? 'bg-border/50' : 'bg-transparent'
                  }`}
              />

              {/* CTA */}
              <div className="flex items-center gap-2">
                <MagneticButton className="group relative ml-2">
                  <Link
                    to="/login"
                    className="relative flex items-center gap-3 px-5 py-2.5 bg-foreground text-background rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 0deg, transparent, hsl(var(--accent)), transparent)',
                        padding: '2px',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="relative z-10 text-sm font-semibold">Sign In Member</span>
                    <motion.div
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
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-accent -z-0"
                      initial={{ y: '100%' }}
                      whileHover={{ y: 0 }}
                      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </Link>
                </MagneticButton>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative w-10 h-10 flex flex-col items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border border-foreground/20"
                  animate={{
                    scale: isMobileMenuOpen ? 1.1 : 1,
                    borderColor: isMobileMenuOpen
                      ? 'hsl(var(--accent))'
                      : 'hsl(var(--foreground) / 0.2)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-1 rounded-full bg-muted/30"
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative w-5 h-5">
                  <motion.span
                    className="absolute top-1 left-0 right-0 h-0.5 bg-foreground rounded-full origin-center"
                    animate={
                      isMobileMenuOpen
                        ? { rotate: 45, y: 5, width: '100%' }
                        : { rotate: 0, y: 0, width: '100%' }
                    }
                  />
                  <motion.span
                    className="absolute top-[9px] left-0 h-0.5 bg-foreground rounded-full"
                    animate={
                      isMobileMenuOpen
                        ? { opacity: 0, x: 10 }
                        : { opacity: 1, x: 0, width: '60%' }
                    }
                  />
                  <motion.span
                    className="absolute bottom-1 left-0 right-0 h-0.5 bg-foreground rounded-full origin-center"
                    animate={
                      isMobileMenuOpen
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
            <motion.div
              className="absolute inset-0 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <nav className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12">
              <div className="space-y-2">
                {isLoading && <div className="py-3 text-muted-foreground">Loading menu…</div>}
                {error && <div className="py-3 text-red-500">Gagal memuat menu</div>}

                {!isLoading &&
                  !error &&
                  navLinks.map((link, i) => {
                    const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                    const isOpen = mobileOpenIndex === i;

                    return (
                      <motion.div
                        key={`${link.uuid}-${link.name}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="group"
                      >
                        {/* Jika tidak punya anak: render Link */}
                        {!hasChildren ? (
                          <Link
                            to={link.href ?? '#'}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-baseline gap-4 py-3 border-b border-border/20"
                          >
                            <span
                              className={`text-sm font-mono transition-colors duration-300 ${isActiveLink(link.href)
                                ? 'text-accent'
                                : 'text-muted-foreground/50 group-hover:text-accent'
                                }`}
                            >
                              {link.number}
                            </span>
                            <span
                              className={`text-4xl sm:text-5xl font-syne font-bold tracking-tight transition-all duration-300 ${isActiveLink(link.href)
                                ? 'text-accent'
                                : 'text-foreground/80 group-hover:text-foreground group-hover:translate-x-2'
                                }`}
                            >
                              {link.name}
                            </span>
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
                        ) : (
                          // Jika punya anak: accordion
                          <div className="py-3 border-b border-border/20">
                            <button
                              type="button"
                              onClick={() => setMobileOpenIndex(isOpen ? null : i)}
                              className="flex w-full items-baseline gap-4"
                              aria-expanded={isOpen}
                              aria-controls={`mob-sub-${i}`}
                            >
                              <span className="text-sm font-mono transition-colors duration-300">
                                {link.number}
                              </span>
                              <span className="text-4xl sm:text-5xl font-syne font-bold tracking-tight text-foreground/90">
                                {link.name}
                              </span>
                              <motion.span
                                className="ml-auto text-accent"
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                ▼
                              </motion.span>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  id={`mob-sub-${i}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                                  className="pl-14 pr-6"
                                >
                                  <div className="flex flex-col py-2 gap-1">
                                    {link.children.map((child) => (
                                      <Link
                                        key={`${child.uuid}-${child.name}`}
                                        to={child.href ?? '#'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-2 text-lg text-foreground/80 hover:text-accent"
                                      >
                                        {child.name}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >

                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-full"
                >
                  Sign In Member
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