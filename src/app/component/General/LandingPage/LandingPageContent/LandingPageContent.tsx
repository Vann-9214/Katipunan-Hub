"use client";

import React from "react";
import Logo from "@/app/component/ReusableComponent/Logo";
import { AuthMode } from "./LandingPageTypesAndUtils";
import { Mail, Globe } from "lucide-react";

// --- Section Imports ---
import HeroSection from "./HeroSection";
import ProjectInfoSection from "./ProjectInfoSection";
import TechStackSection from "./TechStackContent";
import LandingPageTab from "../LandingPageTab/LandingPageTab";
import TeamSection from "./TeamSection";

export type { AuthMode };

export default function LandingPageContent() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans flex flex-col">
      {/* --- FIXED TAB BAR --- */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
        <LandingPageTab />
      </div>

      <div className="flex flex-col w-full flex-grow">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. PROJECT OBJECTIVES & ABOUT */}
        <ProjectInfoSection />

        {/* 3. TECH STACK */}
        <TechStackSection />

        {/* 4. TEAM MEMBERS */}
        <TeamSection />

        {/* 5. PROFESSIONAL FOOTER */}
        <footer className="bg-[#0f0f0f] text-white pt-16 pb-8 border-t border-white/5 relative z-20 font-montserrat">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            {/* Top Section: Brand & Nav */}
            <div className="flex flex-col items-center gap-8 mb-12">
              {/* Logo & Title */}
              <div className="flex flex-col items-center gap-4">
                {/* Fixed: showText={false} prevents duplication */}
                <div className="p-2 bg-white/5 rounded-2xl">
                  <Logo width={60} height={70} unclickable showText={false} />
                </div>
                <span className="font-bold text-2xl tracking-widest text-white uppercase">
                  Katipunan Hub
                </span>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  The official centralized platform for the CIT community.
                  Connecting students, streaming resources, and unifying our
                  voices.
                </p>
              </div>

              {/* Minimal Navigation */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-400">
                <span className="hover:text-[#EFBF04] transition-colors cursor-pointer">
                  Home
                </span>
                <span className="hover:text-[#EFBF04] transition-colors cursor-pointer">
                  Announcements
                </span>
                <span className="hover:text-[#EFBF04] transition-colors cursor-pointer">
                  Peer Learning Center
                </span>
                <span className="hover:text-[#EFBF04] transition-colors cursor-pointer">
                  Lost & Found
                </span>
                <span className="hover:text-[#EFBF04] transition-colors cursor-pointer">
                  Community Feed
                </span>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all duration-300 cursor-pointer group">
                  <Globe
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all duration-300 cursor-pointer group">
                  <Mail
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
              <p>© 2025 Katipunan Hub. All rights reserved.</p>
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
  );
}
