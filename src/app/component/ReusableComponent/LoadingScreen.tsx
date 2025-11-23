"use client";

import { motion } from "framer-motion";

// Component
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        {/* Spinning Rings Container */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer Ring (Large) - Counter-clockwise */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-[#8B0E0E] border-r-transparent border-b-[#8B0E0E]/30 border-l-[#8B0E0E]/30"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
          />

          {/* Inner Ring (Small) - Clockwise */}
          <motion.div
            className="absolute w-16 h-16 rounded-full border-4 border-b-[#FFC9C9] border-t-transparent border-l-[#FFC9C9]/50 border-r-transparent"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          />
        </div>

        {/* Text Loading Indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
          }}
          className="mt-8 text-[#8B0E0E] font-montserrat font-medium text-sm tracking-widest"
        >
          LOADING...
        </motion.p>
      </div>
    </div>
  );
}
