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
import RoutePage from "./Route";

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
              <SmoothScroll>
                <RoutePage />
                <BackToTop />
                <CookieConsent />
              </SmoothScroll>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
