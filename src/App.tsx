import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import BackToTop from "./components/BackToTop";
import SmoothScroll from "./components/SmoothScroll";
import CookieConsent from "./components/CookieConsent";
import Preloader from "./components/Preloader";
import RoutePage from "./Route";
import { useParameter } from "./hooks/useSetting";
import { useEvent } from "./hooks/useEvent";
import { useListPartner } from "./hooks/useListPartner";
import { useMenus } from "./hooks/useMenu";



const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // const { data: apiParameter = [], isLoading: isParameter } = useParameter();
  // const { data: apiEvent = [], isLoading: isEvent } = useEvent();
  // const { data: apiListPartner = [], isLoading: isListPartner } = useListPartner();
  // const { data: apiMenu = [], isLoading: isMenu } = useMenus();

  // // (opsional) kalau ingin tetap memo
  // const Parameter = useMemo(() => apiParameter, [apiParameter]);
  // const Event = useMemo(() => apiEvent, [apiEvent]);
  // const ListPartner = useMemo(() => apiListPartner, [apiListPartner]);
  // const Menus = useMemo(() => apiMenu, [apiMenu]);

  // // Anggap “siap” kalau SEMUA request selesai (tidak loading lagi)
  // const allFetched = !isParameter && !isEvent && !isListPartner && !isMenu;

  // Kalau kamu butuh data minimal ada (bukan kosong), pakai ini:
  // const hasRequiredData = Parameter.length > 0 && Menus.length > 0; // contoh: hanya wajib Parameter & Menus
  // const isReady = allFetched && hasRequiredData;

  // const isReady = allFetched; // kalau boleh kosong ya cukup begini

  useEffect(() => {
  //   if (isReady) {
      setIsLoading(false);
  //   }
  }, []);
  // }, [isReady]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader onComplete={() => {/* tidak perlu setIsLoading di sini */ }} />
        )}
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
  );
};

export default App;
