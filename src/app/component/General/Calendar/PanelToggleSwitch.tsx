// PanelToggleSwitch.tsx
"use client";

import React from "react";
import Image from "next/image";

type PanelType = "Schedule" | "Reminder";

interface PanelToggleSwitchProps {
  currentPanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export default function PanelToggleSwitch({
  currentPanel,
  onPanelChange,
}: PanelToggleSwitchProps) {
  // 0 for Schedule, 1 for Reminder

  // Calculate the target 'left' position:
  // Outer width: 120px, Slider width: 54px (approx half the inner area)
  // Left side position (0): 3px (offset for border/padding)
  // Right side position (50% mark): 60px - 54px/2 = 33px. Wait, no.
  // Target Left Position: 3px (start) or 50% + 1px (end, approx 61px)

  // Let's use specific pixel values for precise alignment without transform:
  const leftPosition = currentPanel === "Schedule" ? 3 : 60; // 3px start, 60px end (to hit the right half)

  return (
    // Outer container: White background, Maroon border, P-1 padding (approx 4px)
    <div
      className={`relative flex rounded-full p-1 bg-white shadow-xl`}
      style={{
        width: "120px",
        height: "48px",
        border: "2px solid #800000", // Maroon outer border
      }}
    >
      {/* Sliding background indicator (Gold) */}
      <div
        className="absolute bg-[#FFD700] rounded-full z-0 shadow-lg"
        style={{
          top: "3px",
          bottom: "3px",
          width: `54px`, // Width of the slider (approx half of the inner area)

          // CRITICAL FIX: Animate 'left' instead of 'transform: translateX'
          left: `${leftPosition}px`,

          // Use transition on 'left' property
          transition: "left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      />

      <button
        onClick={() => onPanelChange("Schedule")}
        // Removed transition on button/icon that relied on transform
        className={`flex-1 flex items-center justify-center p-2 rounded-full relative z-10`}
        title="Switch to Schedule"
      >
        {/* Schedule Icon (from /Schedule.svg) */}
        <Image
          src="/Schedule.svg"
          alt="Schedule Icon"
          width={24}
          height={24}
          style={{
            filter:
              currentPanel === "Schedule"
                ? "invert(0)"
                : "sepia(100%) hue-rotate(330deg) saturate(300%) brightness(0.7)",
            // Animate scale separately
            transform: `scale(${currentPanel === "Schedule" ? 1.2 : 1})`,
            transition:
              "filter 0.4s, transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        />
      </button>

      <button
        onClick={() => onPanelChange("Reminder")}
        // Removed transition on button/icon that relied on transform
        className={`flex-1 flex items-center justify-center p-2 rounded-full relative z-10`}
        title="Switch to Reminder"
      >
        {/* Reminder Icon (from /Bellplus.svg) */}
        <Image
          src="/Bellplus.svg"
          alt="Reminder Icon"
          width={24}
          height={24}
          style={{
            filter:
              currentPanel === "Reminder"
                ? "invert(0)"
                : "sepia(100%) hue-rotate(330deg) saturate(300%) brightness(0.7)",
            // Animate scale separately
            transform: `scale(${currentPanel === "Reminder" ? 1.2 : 1})`,
            transition:
              "filter 0.4s, transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        />
      </button>
    </div>
  );
}
