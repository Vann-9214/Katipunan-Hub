// StructuralContent.tsx
"use client";
import React from "react";
import Logo from "@/app/component/ReusableComponent/Logo";
import { AuthMode } from "./LandingPageTypesAndUtils";
export type { AuthMode };

// --- Section Imports ---
import HeroSection from "./HeroSection";
import ProjectInfoSection from "./ProjectInfoSection";
import TechStackSection from "./TechStackContent";
import TeamSection from "./TeamSection";

interface StructuralContentProps {
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
}

/**
 * Main Layout for Landing Page Content
 */
const StructuralContent: React.FC<StructuralContentProps> = ({ setMode }) => {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <HeroSection setMode={setMode} />

      {/* 2. PROJECT OBJECTIVES & ABOUT */}
      <ProjectInfoSection />

      {/* 3. TECH STACK (New) */}
      <TechStackSection />

      {/* 4. TEAM MEMBERS */}
      <TeamSection />

      {/* 5. FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Logo width={50} height={60} unclickable />
              <div className="flex flex-col">
                <span className="font-montserrat font-bold text-xl tracking-wider text-white">
                  KATIPUNAN HUB
                </span>
                <span className="text-xs text-gray-500 font-montserrat uppercase tracking-widest">
                  Connect • Inform • Engage
                </span>
              </div>
            </div>
            <p className="font-montserrat text-sm text-gray-500 font-medium">
              © 2025 Katipunan Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StructuralContent;
