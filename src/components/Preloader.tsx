import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logo from '../../public/assets/logo-Web.png';

const phrases = [
  "Initializing...",
  "Loading Assets...",
  "Calibrating Design...",
  "Prepare for Launch..."
];

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Smooth counter animation
    const duration = 2000;
    const steps = 100;
    const intervalTime = duration / steps;
    
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    // Text cycler
    const textInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 550);

    // Completion trigger
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearInterval(timer);
      clearInterval(textInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Ultra-smooth bezier curve for refined movement
  const easeInOutExpo = [0.19, 1, 0.22, 1];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ transition: { duration: 1 } }} // Keep container alive during exit
    >
      {/* 
         LAYER 1: The Main Curtain (Black)
         Slides up first, revealing the content underneath.
      */}
      <motion.div
        className="absolute inset-0 bg-[#ffffff] z-30 flex flex-col justify-between p-8 md:p-12"
        initial={{ y: "0%" }}
        exit={{ 
          y: "-100%",
          transition: { duration: 1.2, ease: easeInOutExpo, delay: 0.1 } 
        }}
      >
        {/* Top: Logo / Brand */}
        <div className="flex justify-between items-start">
           <div className="overflow-hidden">
              <motion.div
                 initial={{ y: "100%" }}
                 animate={{ y: "0%" }}
                 transition={{ duration: 0.8, ease: easeInOutExpo, delay: 0.2 }}
                 className="flex items-center gap-3"
              >
                 <div className="w-2 h-2 bg-darkblue rounded-full"></div>
                 {/* <span className="font-syne font-bold text-darkblue tracking-tight text-xl">CommIT.</span> */}
                 <img src={logo} alt="CommIT Logo" />
              </motion.div>
           </div>
        </div>

        {/* Center: Dynamic Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center overflow-hidden">
           <motion.p
              key={phraseIndex}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-mono text-xs md:text-sm text-darkblue uppercase tracking-widest"
           >
              {phrases[phraseIndex]}
           </motion.p>
        </div>

        {/* Bottom: Big Counter */}
        <div className="overflow-hidden">
           <motion.div 
             className="flex items-baseline justify-between"
             initial={{ y: "100%" }}
             animate={{ y: "0%" }}
             transition={{ duration: 0.8, ease: easeInOutExpo, delay: 0.3 }}
           >
              <span className="text-[12vw] leading-none font-syne font-black text-darkblue tracking-tighter">
                 {count}
              </span>
              <span className="text-[12vw] leading-none mr-4 font-syne font-black text-transparent tracking-tighter-wide" style={{ WebkitTextStroke: "2px darkblue" }}>
                 100
              </span>
           </motion.div>
        </div>
      </motion.div>

      {/* 
         LAYER 2: The Secondary Curtain (Accent Color)
         Slides up slightly slower, creating a layered parallax exit.
      */}
      <motion.div
        className="absolute inset-0 bg-accent z-20"
        initial={{ y: "0%" }}
        exit={{ 
          y: "-100%", 
          transition: { duration: 1.2, ease: easeInOutExpo, delay: 0.2 } 
        }}
      />

      {/* 
         LAYER 3: The Final Curtain (White/Light)
         The last layer to leave, cleaning up the transition.
      */}
      <motion.div
        className="absolute inset-0 bg-black z-10"
        initial={{ y: "0%" }}
        exit={{ 
          y: "-100%", 
          transition: { duration: 1.2, ease: easeInOutExpo, delay: 0.3 } 
        }}
      />
    </motion.div>
  );
};

export default Preloader;
