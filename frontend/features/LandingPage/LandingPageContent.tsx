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

      {/* --- FIXED TAB BAR ---
          Purely a motion wrapper: LandingPageTab positions its own floating bar with
          `fixed`, so this element has no height of its own. It must stay unstyled —
          a background/border here renders as a 1px white hairline across the top of
          the hero rather than as a navbar. */}
      <motion.div
        initial={{ y: -100 }}
        animate={introFinished ? { y: 0 } : { y: -100 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <LandingPageTab authMode={authMode} setAuthMode={setAuthMode} />
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
