import { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    },
    [cursorX, cursorY]
  );

  const onMouseEnter = useCallback(() => setIsHidden(false), []);
  const onMouseLeave = useCallback(() => setIsHidden(true), []);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseMove, onMouseEnter, onMouseLeave]);

  useEffect(() => {
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]'
    );

    const viewElements = document.querySelectorAll('[data-cursor="view"]');

    const handleMouseEnter = () => {
      setIsHovering(true);
      setCursorText('');
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText('');
    };

    const handleViewEnter = () => {
      setIsHovering(true);
      setCursorText('View');
    };

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    viewElements.forEach((el) => {
      el.addEventListener('mouseenter', handleViewEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      viewElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleViewEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Hide on touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-hard-light"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 80 : 12,
            height: isHovering ? 80 : 12,
            opacity: isHidden ? 0 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
            mass: 0.5,
          }}
          // className="relative flex items-center justify-center rounded-full bg-foreground"
          className="relative flex items-center justify-center rounded-full bg-lightblue"
          style={{
            marginLeft: isHovering ? -40 : -6,
            marginTop: isHovering ? -40 : -6,
          }}
        >
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-xs font-medium text-background uppercase tracking-wider"
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Outer ring (trails behind) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 90 : 40,
            height: isHovering ? 90 : 40,
            opacity: isHidden ? 0 : 0.3,
            borderWidth: isHovering ? 1 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
            mass: 0.8,
          }}
          // className="rounded-full border border-foreground/50"
          className="rounded-full border border-darkblue"
          style={{
            marginLeft: isHovering ? -45 : -20,
            marginTop: isHovering ? -45 : -20,
          }}
        />
      </motion.div>

      {/* Global cursor hide styles */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
