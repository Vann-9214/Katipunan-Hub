// src/app/component/ReusableComponent/BackgroundGradient.tsx
"use client";

import React from "react";

export default function BackgroundGradient() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-white">
      {/* Gold Blob (Top Left) */}
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#efbf04] opacity-[0.15] blur-[120px]" />

      {/* Maroon Blob (Bottom Right) */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#8b0e0e] opacity-[0.15] blur-[120px]" />

      {/* Dark Maroon Blob (Center-ish/Floating) */}
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#4e0505] opacity-[0.10] blur-[100px]" />
    </div>
  );
}
