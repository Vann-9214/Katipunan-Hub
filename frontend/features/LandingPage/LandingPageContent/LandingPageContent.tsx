"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { Mail, Globe } from "lucide-react";

// --- Section Imports ---
import HeroSection from "./HeroSection";
import LandingPageTab, { AuthMode } from "../LandingPageTab/LandingPageTab";

// --- INTRO ANIMATION COMPONENT ---
const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B0E0E] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, pointerEvents: "none" }}
      transition={{ delay: 3.5, duration: 0.8 }}
      onAnimationComplete={onComplete}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#EFBF04 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.5, scale: 1.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-[300px] h-[300px] bg-white blur-[80px] rounded-full pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 mb-8"
        >
          <div className="drop-shadow-2xl">
            <Logo width={120} height={140} unclickable showText={false} />
          </div>
        </motion.div>
        <div className="overflow-hidden h-16 md:h-20 flex items-center relative z-20">
          <motion.h1
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "circOut" }}
            className="text-4xl md:text-6xl font-black font-montserrat uppercase tracking-[0.2em] text-white text-center"
          >
            Katipunan <span className="text-[#EFBF04]">Hub</span>
          </motion.h1>
        </div>
        <motion.div
          className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-[#EFBF04] shadow-[0_0_10px_#EFBF04]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function LandingPageContent() {
  const [introFinished, setIntroFinished] = useState(false);

  // --- LIFTED STATE FOR AUTH MODAL ---
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [direction, setDirection] = useState(0);

  // Trigger function for "Get Started" button
  const handleOpenSignUp = () => {
    setDirection(1);
    setAuthMode("signup");
  };

  useEffect(() => {
    if (!introFinished) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [introFinished]);

  return (
    <>
      <AnimatePresence>
        {!introFinished && (
          <IntroOverlay onComplete={() => setIntroFinished(true)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full relative overflow-x-hidden font-sans flex flex-col justify-between">
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
          {/* HERO & AUTHENTICATION SECTION */}
          <HeroSection
            startAnimation={introFinished}
            onGetStarted={handleOpenSignUp}
          />

          {/* PROFESSIONAL FOOTER */}
          <footer className="bg-[#0f0f0f] text-white pt-12 pb-8 border-t border-white/5 relative z-20 font-montserrat overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[#8B0E0E] opacity-[0.03] blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center gap-6 mb-8"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-2xl border border-white/5 hover:border-[#EFBF04]/30 transition-colors duration-500">
                    <Logo width={50} height={60} unclickable showText={false} />
                  </div>
                  <span className="font-bold text-xl tracking-widest text-white uppercase">
                    Katipunan Hub
                  </span>
                  <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                    The centralized official platform for the Cebu Institute of Technology - University community.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                    <Globe
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                    <Mail
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <p>© {new Date().getFullYear()} Katipunan Hub. All rights reserved.</p>
                <div className="flex gap-6">
                  <span className="hover:text-white cursor-pointer transition-colors">
                    Privacy Policy
                  </span>
                  <span className="hover:text-white cursor-pointer transition-colors">
                    Terms of Service
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
