"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Component
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-xl transition-all duration-300">
      <div className="relative flex flex-col items-center justify-center p-8">
        {/* Central Logo Container */}
        <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
          {/* Outer Gold Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#EFBF04] border-r-[#EFBF04]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner Maroon Ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-[#8B0E0E] border-l-[#8B0E0E]/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo Image with Pulse */}
          <motion.div
            className="relative w-14 h-14"
            animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/Logo.svg"
              alt="Loading..."
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* Branding Text */}
        <div className="flex flex-col items-center space-y-2">
          <h2 className="font-montserrat font-bold text-xl text-[#8B0E0E] tracking-wider drop-shadow-sm">
            KATIPUNAN HUB
          </h2>

          {/* Bouncing Dots */}
          <div className="flex items-center gap-1.5 h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#EFBF04] rounded-full shadow-sm"
                animate={{
                  y: ["0%", "-60%", "0%"],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
