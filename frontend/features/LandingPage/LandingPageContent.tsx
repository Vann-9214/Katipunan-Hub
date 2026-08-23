"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-components & Hooks ---
import HeroSection from "./components/HeroSection";
import LandingPageTab from "./components/LandingPageTab";
import IntroOverlay from "./components/IntroOverlay";
import LandingPageFooter from "./components/LandingPageFooter";
import { useLandingPageAuth } from "./hooks/useLandingPageAuth";

export default function LandingPageContent() {
  const {
    introFinished,
    setIntroFinished,
    authMode,
    setAuthMode,
    direction,
    setDirection,
    openSignUp,
  } = useLandingPageAuth();

  useEffect(() => {
    if (!introFinished) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [introFinished]);

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden font-sans flex flex-col justify-between">
      <AnimatePresence>
        {!introFinished && (
          <IntroOverlay onComplete={() => setIntroFinished(true)} />
        )}
      </AnimatePresence>

      {/* --- FIXED TAB BAR --- */}
      <motion.div
        initial={{ y: -100 }}
        animate={introFinished ? { y: 0 } : { y: -100 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all"
      >
        <LandingPageTab
          authMode={authMode}
          setAuthMode={setAuthMode}
          direction={direction}
          setDirection={setDirection}
        />
      </motion.div>

      <div className="flex flex-col w-full flex-grow">
        <HeroSection
          startAnimation={introFinished}
          onGetStarted={openSignUp}
        />
        <LandingPageFooter />
      </div>
    </main>
  );
}
