import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring, useIsomorphicLayoutEffect } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [cursorText, setCursorText] = useState('');

  // Motion values
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // ===== Responsiveness tweaks =====
  // Dot: cepat dan tajam
  const dotSpring = { damping: 24, stiffness: 600, mass: 0.45, restDelta: 0.01, restSpeed: 0.01 };
  // Ring: sedikit lebih lambat untuk memberi efek trailing
  const ringSpring = { damping: 20, stiffness: 260, mass: 0.7, restDelta: 0.02, restSpeed: 0.02 };

  const xDot = useSpring(x, dotSpring);
  const yDot = useSpring(y, dotSpring);
  const xRing = useSpring(x, ringSpring);
  const yRing = useSpring(y, ringSpring);

  // Reduce motion preference
  const prefersReducedMotion = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }
  }, []);

  // Switch to instantaneous if reduced motion
  useEffect(() => {
    if (prefersReducedMotion.current) {
      xDot.set(x.get());
      yDot.set(y.get());
      xRing.set(x.get());
      yRing.set(y.get());
    }
  }, [x, y, xDot, yDot, xRing, yRing]);

  // Pointer move (lebih responsif dari mousemove)
  const onPointerMove = useCallback((e: PointerEvent) => {
    // translate3d hint via Framer is automatic, we just push coords fast
    x.set(e.clientX);
    y.set(e.clientY);
  }, [x, y]);

  const onMouseEnter = useCallback(() => setIsHidden(false), []);
  const onMouseLeave = useCallback(() => setIsHidden(true), []);

  // Keep position in sync when tab visibility changes
  const onVisibility = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // “snap” to current pointer if available
      // Note: not all browsers expose last pointer position; fallback: show cursor at center
      // Here we just unhide; next move will snap
      setIsHidden(false);
    }
  }, []);

  useEffect(() => {
    // Passive listeners to reduce main-thread blocking
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility, { passive: true } as any);

    return () => {
      document.removeEventListener('pointermove', onPointerMove as any);
      document.removeEventListener('mouseenter', onMouseEnter as any);
      document.removeEventListener('mouseleave', onMouseLeave as any);
      document.removeEventListener('visibilitychange', onVisibility as any);
    };
  }, [onPointerMove, onMouseEnter, onMouseLeave, onVisibility]);

  // Hover detection (minim re-render)
  useEffect(() => {
    const interactiveSel = 'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]';
    const viewSel = '[data-cursor="view"]';
    const interactiveElements = document.querySelectorAll<HTMLElement>(interactiveSel);
    const viewElements = document.querySelectorAll<HTMLElement>(viewSel);

    const handleEnter = () => { setIsHovering(true); setCursorText(''); };
    const handleLeave = () => { setIsHovering(false); setCursorText(''); };
    const handleViewEnter = () => { setIsHovering(true); setCursorText('View'); };

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleEnter, { passive: true });
      el.addEventListener('mouseleave', handleLeave, { passive: true });
    });
    viewElements.forEach((el) => {
      el.addEventListener('mouseenter', handleViewEnter, { passive: true });
      el.addEventListener('mouseleave', handleLeave, { passive: true });
    });

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleEnter as any);
        el.removeEventListener('mouseleave', handleLeave as any);
      });
      viewElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleViewEnter as any);
        el.removeEventListener('mouseleave', handleLeave as any);
      });
    };
  }, []);

  // Hide on touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice(('ontouchstart' in window) || (navigator.maxTouchPoints ?? 0) > 0);
  }, []);
  if (isTouchDevice) return null;

  // Sizes/margins precomputed (mengurangi reflow)
  const dotSize = isHovering ? 80 : 12;
  const ringSize = isHovering ? 90 : 40;
  const dotHalf = dotSize / 2;
  const ringHalf = ringSize / 2;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-hard-light will-change-transform"
        style={{ x: xDot, y: yDot }}
      >
        <motion.div
          animate={{
            width: dotSize,
            height: dotSize,
            opacity: isHidden ? 0 : 1,
          }}
          transition={prefersReducedMotion.current ? { duration: 0 } : { type: 'spring', ...dotSpring }}
          className="relative flex items-center justify-center rounded-full bg-lightblue"
          style={{
            marginLeft: -dotHalf,
            marginTop: -dotHalf,
            // Hint GPU
            transform: 'translate3d(0,0,0)',
          }}
        >
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={prefersReducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 24 }}
              className="text-xs font-medium text-background uppercase tracking-wider select-none"
              style={{ willChange: 'transform, opacity' }}
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Outer ring (trails) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] will-change-transform"
        style={{ x: xRing, y: yRing }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: isHidden ? 0 : 0.35,
            borderWidth: 1,
          }}
          transition={prefersReducedMotion.current ? { duration: 0 } : { type: 'spring', ...ringSpring }}
          className="rounded-full border border-darkblue"
          style={{
            marginLeft: -ringHalf,
            marginTop: -ringHalf,
            transform: 'translate3d(0,0,0)',
          }}
        />
      </motion.div>

      {/* Global cursor override
          TIP: Jangan nonaktifkan cursor di input & textarea agar UX tetap baik saat mengetik */}
      <style>{`
        html, body, *:not(input):not(textarea) {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;