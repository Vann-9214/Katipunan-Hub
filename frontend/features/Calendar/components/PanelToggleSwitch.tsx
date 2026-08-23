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
  const leftPosition = currentPanel === "Schedule" ? 3 : 60;

  return (
    <div
      className="relative flex rounded-full p-1 bg-white shadow-xl"
      style={{
        width: "120px",
        height: "48px",
        border: "2px solid #800000",
      }}
    >
      {/* Sliding background indicator (Gold) */}
      <div
        className="absolute bg-[#FFD700] rounded-full z-0 shadow-lg"
        style={{
          top: "3px",
          bottom: "3px",
          width: `54px`,
          left: `${leftPosition}px`,
          transition: "left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      />

      <button
        onClick={() => onPanelChange("Schedule")}
        className="flex-1 flex items-center justify-center p-2 rounded-full relative z-10"
        title="Switch to Schedule"
      >
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
            transform: `scale(${currentPanel === "Schedule" ? 1.2 : 1})`,
            transition:
              "filter 0.4s, transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        />
      </button>

      <button
        onClick={() => onPanelChange("Reminder")}
        className="flex-1 flex items-center justify-center p-2 rounded-full relative z-10"
        title="Switch to Reminder"
      >
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
            transform: `scale(${currentPanel === "Reminder" ? 1.2 : 1})`,
            transition:
              "filter 0.4s, transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        />
      </button>
    </div>
  );
}
