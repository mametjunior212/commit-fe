import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../../public/assets/logo-Web.png';


const footerLinks = {
   navigation: [
      { name: 'Event', href: '/event' },
      { name: 'About', href: '/about' },
      // { name: 'Services', href: '/services' },
      // { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
   ],
   services: [
      { name: 'Web Design', href: '/services#web-design' },
      { name: 'Branding', href: '/services#branding' },
      { name: 'UI/UX Design', href: '/services#ui-ux' },
      { name: 'Development', href: '/services#development' },
   ],
   social: [
      { name: 'Instagram', href: 'https://www.instagram.com/commit_indonesia/' },
      // { name: 'Twitter', href: '#' },
      // { name: 'LinkedIn', href: '#' },
      // { name: 'Dribbble', href: '#' },
   ],
   legal: [
      // { name: 'Privacy Policy', href: '/privacy-policy' },
      // { name: 'Terms of Service', href: '/terms-of-service' },
   ],
};

export const Footer = () => {
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(interval);
   }, []);

   return (
      <footer className="bg-background border-t border-border relative z-50">
         {/* Brutalist Grid Container */}
         <div className="grid grid-cols-1 lg:grid-cols-4 border-l border-border">

            {/* Column 1: Brand & Time */}
            <div className="lg:col-span-1 border-r border-border p-8 lg:p-12 flex flex-col justify-between min-h-[400px] lg:min-h-[200px]">
               <div>
                  <Link to="/" className="inline-block mb-12">
                     {/* <span className="font-syne text-4xl font-bold tracking-tighter">
                   STUDIO<span className="text-accent">.</span>
                 </span> */}
                     <motion.img
                        src={logo}
                        alt="Studio Logo"
                        className="w-32 h-auto"
                     />
                  </Link>
                  {/* <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-[200px]">
                     Crafting digital experiences that defy the ordinary.
                  </p> */}
               </div>

               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                     <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Local Time</span>
                  </div>
                  <p className="font-syne text-3xl font-bold tabular-nums">
                     {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                  </p>
               </div>
            </div>

            {/* Column 2: Navigation - Mega Type */}
            <div className="lg:col-span-1 border-r border-border">
               {footerLinks.navigation.map((link) => (
                  <Link
                     key={link.name}
                     to={link.href}
                     className="block p-8 border-b border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 group last:border-b-0"
                  >
                     <div className="flex items-center justify-between">
                        <span className="font-syne text-2xl font-bold group-hover:translate-x-2 transition-transform duration-300">
                           {link.name}
                        </span>
                        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                     </div>
                  </Link>
               ))}
            </div>

            {/* Column 3: Contact & Social */}
            <div className="lg:col-span-1 border-r border-border flex flex-col">
               <div className="flex-1 p-8 border-b border-border">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 block">Contact</span>
                  <a href="mailto:commitjabar@gmail.com" className="block text-xl font-bold hover:text-accent transition-colors mb-2">commitjabar@gmail.com</a>
                  <a href="tel:+6285182583624" className="block text-xl font-bold hover:text-accent transition-colors">+62 851-8258-3624</a>
               </div>

               <div className="flex-1 p-8 border-b border-border">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 block">Location</span>
                  <address className="not-italic text-lg text-muted-foreground">
                     Bandung, Indonesia
                  </address>
               </div>

               <div className="p-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 block">Social</span>
                  <div className="grid grid-cols-2 gap-4">
                     {footerLinks.social.map((link) => (
                        <a
                           key={link.name}
                           href={link.href}
                           onClick={(e) => e.preventDefault()}
                           className="text-sm hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
                        >
                           {link.name} <ArrowUpRight className="w-3 h-3" />
                        </a>
                     ))}
                  </div>
               </div>
            </div>

            {/* Column 4: Big CTA */}
            <div className="lg:col-span-1 p-8 lg:p-12 flex flex-col justify-center items-center text-center bg-foreground/5 hover:bg-accent transition-colors duration-500 group cursor-pointer relative overflow-hidden">
               <Link to="/contact" className="absolute inset-0 z-20"></Link>

               {/* Animated Background Text */}
               <div className="absolute inset-0 flex flex-col justify-center opacity-10 pointer-events-none select-none overflow-hidden group-hover:opacity-20 transition-opacity">
                  <div className="animate-marquee whitespace-nowrap text-9xl font-black uppercase text-foreground">
                     Let's Talk Let's Talk Let's Talk
                  </div>
               </div>

               <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-transform duration-500">
                     <ArrowUpRight className="w-8 h-8 text-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-4xl lg:text-4xl font-syne font-black uppercase leading-none mb-4 group-hover:text-accent-foreground transition-colors">
                     Contact<br />Us
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">
                     Want Join?
                  </p>
               </div>
            </div>
         </div>

         {/* Bottom Legal Bar */}
         <div className="border-t border-border p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-background">
            <p className="text-xs font-mono text-muted-foreground uppercase">
               © {new Date().getFullYear()} CommIT.
            </p>
            <div className="flex gap-8">
               {footerLinks.legal.map((link) => (
                  <Link
                     key={link.name}
                     to={link.href}
                     className="text-xs font-mono text-muted-foreground uppercase hover:text-accent transition-colors"
                  >
                     {link.name}
                  </Link>
               ))}
            </div>
         </div>
      </footer>
   );
};

export default Footer;
