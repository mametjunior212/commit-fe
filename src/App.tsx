import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import BackToTop from "./components/BackToTop";
import SmoothScroll from "./components/SmoothScroll";
import CookieConsent from "./components/CookieConsent";
import Preloader from "./components/Preloader";
import Index from "./pages/Index";
import CaseStudy from "./pages/CaseStudy";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <AnimatePresence mode="wait">
            {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
            {/* <Preloader onComplete={() => { }} /> */}
          </AnimatePresence>

          {!isLoading && (
            <BrowserRouter>
              {/* <SmoothScroll> */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/work" element={<Projects />} />
                <Route path="/work/:id" element={<CaseStudy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BackToTop />
              <CookieConsent />
              {/* </SmoothScroll> */}
            </BrowserRouter>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
