"use client";

import React from "react";
import LandingPageTab from "@/app/component/General/LandingPage/LandingPageTab/LandingPageTab";
import LandingPageContent from "@/app/component/General/LandingPage/LandingPageContent/LandingPageContent";

export default function LandingPage() {
  return (
    <div>
      {/* Handles the Header and Login/Signup Modals internally */}
      <LandingPageTab />

      {/* Main Content (Hero, Story, Team, etc.) */}
      <LandingPageContent />
    </div>
  );
}