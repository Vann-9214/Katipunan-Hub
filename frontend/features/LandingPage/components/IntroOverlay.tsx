"use client";

import React from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
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
}
