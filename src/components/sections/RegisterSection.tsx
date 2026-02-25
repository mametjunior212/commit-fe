import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MagneticButton from '@/components/MagneticButton';

export const HeroSection = () => {
    const ref = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState('');

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const opacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0.3, 0.8], [1, 0.95]);

    const y = useTransform(scrollYProgress, [0, 0.5], ['0%', '10%']);
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const springX = useSpring(cursorX, { stiffness: 100, damping: 20 });
    const springY = useSpring(cursorY, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
        setMousePosition({
            x: (e.clientX - rect.left - rect.width / 2) / 50,
            y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
    };

    return (
        <motion.section
            ref={ref}
            style={{ opacity, scale }}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background */}
            <motion.div className="absolute inset-0" style={{ y: bgY }}>
                <img
                    src="/assets/hero-bg.png"
                    alt=""
                    className="w-full h-full object-cover opacity-100 scale-110"
                />
                <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </motion.div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ paddingTop: 'var(--nav-offset)' }}
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-foreground/5"
                        style={{ top: `${12.5 * (i + 1)}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    />
                ))}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-foreground/5"
                        style={{ left: `${16.66 * (i + 1)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    />
                ))}
            </div>

            {/* Floating orb - hidden on mobile for performance */}
            <motion.div
                className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-none bg-accent/10 blur-[80px] md:blur-[120px] hidden sm:block"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Geometric shapes - hidden on mobile */}
            <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 45 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute top-1/4 left-[10%] w-12 h-12 md:w-20 md:h-20 border border-foreground/10 hidden sm:block"
                style={{
                    x: mousePosition.x * 2,
                    y: mousePosition.y * 2,
                }}
            />
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
                className="absolute bottom-1/4 right-[15%] w-20 h-20 md:w-32 md:h-32 rounded-none border border-accent/20 hidden sm:block"
                style={{
                    x: mousePosition.x * -3,
                    y: mousePosition.y * -3,
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                className="absolute top-[60%] left-[20%] w-2 h-2 bg-accent rounded-none hidden md:block"
                style={{
                    x: mousePosition.x * 4,
                    y: mousePosition.y * 4,
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.2 }}
                className="absolute top-[30%] right-[25%] w-3 h-3 bg-foreground/20 rounded-none hidden md:block"
                style={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -2,
                }}
            />

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4"
            >
                <span className="text-xs font-mono text-muted-foreground">{currentTime}</span>
                <div className="w-px h-12 bg-foreground/20" />
                <span className="text-xs font-mono text-muted-foreground">WIB</span>
            </motion.div>

            {/* Main content */}
            <motion.div style={{ y }} className="w-full container-wide relative z-10 pt-24 sm:pt-32 pb-20 sm:pb-32 md:pb-48">
                {/* Inner content wrapper - full width on mobile, constrained on desktop */}
                <div className="md:max-w-5xl md:mx-auto">
                    
                </div>
            </motion.div>

        </motion.section>
    );
};

export default HeroSection;
