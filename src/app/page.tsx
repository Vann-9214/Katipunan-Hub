"use client";

import React from "react";
import LandingPageContent from "@/app/component/General/LandingPage/LandingPageContent/LandingPageContent";

export default function LandingPage() {
  return (
    <div>
      {/* LandingPageTab is now handled INSIDE LandingPageContent to share state */}
      <LandingPageContent />
    </div>
  );
}
