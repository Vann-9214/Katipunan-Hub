"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import {
  containerVariants,
  itemVariants,
  floatingVariant,
  logoEntranceVariant,
  GlassCard,
} from "./LandingPageTypesAndUtils";

interface HeroSectionProps {
  startAnimation?: boolean;
  onGetStarted?: () => void; // <--- ADDED THIS PROP
}

const HeroSection = ({
  startAnimation = true,
  onGetStarted,
}: HeroSectionProps) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#EFBF04] overflow-hidden flex flex-col justify-center"
    >
      {/* ... (Keep your existing background elements) ... */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-tr from-[#EFBF04] via-[#fcd34d] to-[#EFBF04] opacity-50"
      />

      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={
          startAnimation ? { x: 0, opacity: 1 } : { x: -200, opacity: 0 }
        }
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ y }}
        className="absolute top-0 left-0 w-[85vw] h-[130vh] bg-[#8B0E0E] rounded-br-[100%] z-0 shadow-2xl origin-top-left"
      />

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          className="flex flex-col items-start text-left"
        >
          {/* ... (Keep title and badge animations) ... */}
          <motion.div variants={itemVariants}>
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 shadow-lg">
              <span className="text-white font-montserrat text-xs md:text-sm font-bold tracking-widest uppercase">
                🚀 The Official CIT Community Platform
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="font-montserrat font-black leading-none text-white mb-8"
          >
            <div className="text-[56px] lg:text-[88px] flex flex-col gap-2">
              <span className="drop-shadow-lg text-[#EFBF04]">STAY</span>
              <div className="h-[1.1em] overflow-hidden relative">
                <div className="animate-[text-flip_6s_cubic-bezier(0.23,1,0.32,1.2)_infinite]">
                  <div className="h-[1.1em] flex items-center">CONNECTED</div>
                  <div className="h-[1.1em] flex items-center text-[#EFBF04]">
                    UPDATED
                  </div>
                  <div className="h-[1.1em] flex items-center">INFORMED</div>
                  <div className="h-[1.1em] flex items-center text-[#EFBF04]">
                    TOGETHER
                  </div>
                  <div className="h-[1.1em] flex items-center">CONNECTED</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-100 font-medium max-w-lg mb-10 leading-relaxed font-montserrat"
          >
            From school events to lost & found,{" "}
            <span className="text-[#EFBF04] font-bold underline decoration-2 underline-offset-4">
              Katipunan Hub
            </span>{" "}
            centralizes everything a Wildcat needs in one secure place.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4">
            {/* --- UPDATED BUTTON --- */}
            <button
              onClick={onGetStarted}
              className="bg-[#EFBF04] text-[#8B0E0E] font-bold py-4 px-8 rounded-xl shadow-xl hover:scale-105 hover:bg-white transition-all duration-300 font-montserrat"
            >
              Get Started
            </button>
            {/* ---------------------- */}
          </motion.div>
        </motion.div>

        {/* ... (Keep existing Visuals/Right Column code same as before) ... */}
        <motion.div
          variants={logoEntranceVariant}
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          className="relative hidden lg:flex h-[600px] items-center justify-center perspective-1000"
        >
          {/* Center Logo Area */}
          <div className="relative z-20 group">
            <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full transform scale-150 group-hover:bg-white/30 transition-all duration-500" />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/Logo.svg"
                alt="Katipunan Hub Logo"
                width={420}
                height={420}
                className="object-contain drop-shadow-2xl relative z-20"
                priority
              />
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            variants={floatingVariant}
            animate={startAnimation ? "float" : "hidden"}
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="absolute top-10 right-10 z-30"
          >
            <GlassCard className="p-5 hover:bg-white/40 transition-colors border-white/40 shadow-xl">
              <Image src="/Chat.svg" alt="Chat" width={55} height={55} />
            </GlassCard>
          </motion.div>

          <motion.div
            variants={floatingVariant}
            animate={startAnimation ? "floatReverse" : "hidden"}
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="absolute bottom-20 left-0 z-30"
          >
            <GlassCard className="p-5 hover:bg-white/40 transition-colors border-white/40 shadow-xl">
              <Image
                src="/Calendar.svg"
                alt="Calendar"
                width={55}
                height={55}
              />
            </GlassCard>
          </motion.div>

          <motion.div
            variants={floatingVariant}
            animate={startAnimation ? "float" : "hidden"}
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="absolute top-20 left-10 z-30"
          >
            <GlassCard className="p-5 hover:bg-white/40 transition-colors border-white/40 shadow-xl">
              <Image src="/found.svg" alt="Found" width={65} height={65} />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      {/* --- Scroll Indicator --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={startAnimation ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes text-flip {
          0%,
          100% {
            margin-top: 0;
          }
          20% {
            margin-top: -1.1em;
          }
          40% {
            margin-top: -2.2em;
          }
          60% {
            margin-top: -3.3em;
          }
          80% {
            margin-top: -4.4em;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
