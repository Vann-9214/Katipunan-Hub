"use client";

import React from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Mail, Globe } from "lucide-react";

export default function LandingPageFooter() {
  return (
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
              The centralized official platform for the Cebu Institute of
              Technology - University community.
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
  );
}
