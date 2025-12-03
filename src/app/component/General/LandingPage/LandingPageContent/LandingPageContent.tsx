"use client";

import React from "react";
import Logo from "@/app/component/ReusableComponent/Logo";
import { AuthMode } from "./LandingPageTypesAndUtils";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

// --- Section Imports ---
import HeroSection from "./HeroSection";
import ProjectInfoSection from "./ProjectInfoSection";
import LandingPageTab from "../LandingPageTab/LandingPageTab";
import TeamSection from "./TeamSection"; // IMPORTED

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

        {/* 3. TECH STACK (Uncomment when ready) */}
        {/* <TechStackSection /> */}

        {/* 4. TEAM MEMBERS */}
        <TeamSection />

        {/* 5. PROFESSIONAL FOOTER */}
        <footer className="bg-[#0f0f0f] text-white pt-20 pb-10 border-t border-white/5 relative z-20 font-montserrat">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {/* COLUMN 1: Brand & Desc */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Logo width={45} height={55} unclickable />
                  <span className="font-bold text-xl tracking-wider text-white">
                    KATIPUNAN HUB
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed pr-4">
                  The official centralized platform for the CIT community.
                  Connecting students, streaming resources, and unifying our
                  voices.
                </p>
                <div className="flex gap-4">
                  {/* Social Placeholders */}
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all cursor-pointer">
                    <Globe size={18} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#EFBF04] hover:text-[#8B0E0E] transition-all cursor-pointer">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Quick Links */}
              <div>
                <h3 className="text-[#EFBF04] font-bold text-sm uppercase tracking-widest mb-6">
                  Platform
                </h3>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Home
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Announcements
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Peer Learning Center
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Lost & Found
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Community Feed
                  </li>
                </ul>
              </div>

              {/* COLUMN 3: Resources */}
              <div>
                <h3 className="text-[#EFBF04] font-bold text-sm uppercase tracking-widest mb-6">
                  Resources
                </h3>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Student Handbook
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Academic Calendar
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Help Center
                  </li>
                  <li className="hover:text-white transition-colors cursor-pointer">
                    Report a Bug
                  </li>
                </ul>
              </div>

              {/* COLUMN 4: Contact Info */}
              <div>
                <h3 className="text-[#EFBF04] font-bold text-sm uppercase tracking-widest mb-6">
                  Contact Us
                </h3>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-[#EFBF04] shrink-0 mt-0.5"
                    />
                    <span>
                      N. Bacalso Avenue, <br /> Cebu City, Philippines
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={18} className="text-[#EFBF04] shrink-0" />
                    <span className="hover:text-white cursor-pointer transition-colors">
                      support@cit.edu.ph
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={18} className="text-[#EFBF04] shrink-0" />
                    <span>+63 32 123 4567</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500 font-medium text-center md:text-left">
                © 2025 Katipunan Hub. All rights reserved.
              </p>
              <div className="flex gap-8 text-xs text-gray-500">
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy Policy
                </span>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Terms of Service
                </span>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Cookie Settings
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}