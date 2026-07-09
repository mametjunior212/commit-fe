import { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import MagneticButton from '@/components/MagneticButton';

const emailSchema = z.string().trim().email('Please enter a valid email address').max(255);

interface NewsletterFormProps {
  variant?: 'inline' | 'stacked';
  className?: string;
}

const NewsletterForm = ({ variant = 'inline', className = '' }: NewsletterFormProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 20);
      mouseY.set((clientY / innerHeight - 0.5) * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');

    toast({
      title: "Successfully subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });

    // Reset after 5 seconds
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative ${className}`}
      >
        {/* Success card with unique styling */}
        <div className="relative p-8 border border-primary/30 bg-primary/5 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
          
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="p-3 border border-primary/30"
            >
              <CheckCircle className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="text-left">
              <p className="text-foreground font-syne font-bold text-lg">You&apos;re subscribed!</p>
              <p className="text-sm text-muted-foreground font-mono">Welcome to the creative circle</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'stacked') {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        {/* Floating shapes */}
        <motion.div
          className="absolute -top-4 -right-4 w-8 h-8 border border-primary/20 rotate-45"
          style={{ x: smoothX, y: smoothY }}
        />
        
        <div className="space-y-4">
          <div className="relative group">
            {/* Input container with unique border */}
            <div className={`relative transition-all duration-300 ${isFocused ? 'transform -translate-y-1' : ''}`}>
              {/* Animated border */}
              <div className={`absolute inset-0 border transition-colors duration-300 ${
                error ? 'border-destructive' : isFocused ? 'border-primary' : 'border-border'
              }`} />
              
              {/* Corner accents */}
              <div className={`absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 transition-colors duration-300 ${
                isFocused ? 'border-primary' : 'border-transparent'
              }`} />
              <div className={`absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 transition-colors duration-300 ${
                isFocused ? 'border-primary' : 'border-transparent'
              }`} />
              <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 transition-colors duration-300 ${
                isFocused ? 'border-primary' : 'border-transparent'
              }`} />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 transition-colors duration-300 ${
                isFocused ? 'border-primary' : 'border-transparent'
              }`} />
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-transparent focus:outline-none transition-colors font-mono text-sm"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-destructive font-mono flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-destructive" />
                {error}
              </motion.p>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="group w-full relative px-8 py-4 bg-foreground text-background font-syne font-bold overflow-hidden disabled:opacity-70"
          >
            {/* Button hover effect */}
            <div className="absolute inset-0 bg-primary translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500" />
            
            <span className="relative flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-mono text-sm">PROCESSING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>SUBSCRIBE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </motion.button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-6 left-10 w-6 h-6 border border-accent/30 rotate-12"
        style={{ x: smoothX, y: smoothY }}
      />
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group h-[56px]">
          {/* Input with unique border style */}
          <div className={`relative h-full transition-all duration-300 ${isFocused ? 'transform -translate-y-1' : ''}`}>
            <div className={`absolute inset-0 border rounded-full transition-colors duration-300 ${
              error ? 'border-destructive' : isFocused ? 'border-primary' : 'border-border'
            }`} />
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your email"
              className="w-full h-full px-8 bg-transparent focus:outline-none transition-colors font-mono text-sm rounded-full"
            />
          </div>
        </div>
        
        <MagneticButton>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group h-[56px] inline-flex items-center gap-3 px-8 bg-white text-black font-semibold rounded-full transition-all hover:opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-sm">...</span>
              </>
            ) : (
              <>
                <span>SUBSCRIBE</span>
                <motion.div
                  className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center"
                  whileHover={{ rotate: 45 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </>
            )}
          </button>
        </MagneticButton>
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-destructive font-mono flex items-center gap-2"
        >
          <span className="w-1 h-1 bg-destructive" />
          {error}
        </motion.p>
      )}
    </form>
  );
};

export default NewsletterForm;
