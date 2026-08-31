"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface ToggleButtonProps {
  leftLabel?: string;
  rightLabel?: string;
  active?: "left" | "right";
  onToggle?: (side: "left" | "right") => void;
  leftActiveBg?: string; // e.g. "bg-maroon"
  rightActiveBg?: string; // e.g. "bg-gold"
  width?: string;
  height?: string;
  textSize?: string;
}

export default function ToggleButton({
  leftLabel = "Left",
  rightLabel = "Right",
  active = "left",
  onToggle,
  leftActiveBg = "bg-[#800000]", // Default Maroon hex if tailwind class fails
  rightActiveBg = "bg-[#D4AF37]", // Default Gold hex
  width = "w-[540px]",
  height = "h-[50px]",
  textSize = "text-[16px]",
}: ToggleButtonProps) {
  // Helper to determine which color to use for the sliding background
  const activeColor = active === "left" ? leftActiveBg : rightActiveBg;

  // The pill's layoutId must be unique per ToggleButton instance. A hardcoded id would be
  // shared by every toggle mounted at the same time — framer-motion then treats them as one
  // element, so the pill jumps to whichever instance rendered last and disappears from the
  // others. (The sign in / sign up panels are both mounted at once, so this is two toggles.)
  // Sharing it between this instance's left and right buttons is what animates the slide.
  const pillLayoutId = `toggle-pill-${useId()}`;

  return (
    <div
      className={`
        ${width} ${height} 
        bg-white 
        rounded-[30px] 
        border border-black/40 
        flex items-center relative p-1
        isolation-auto
      `}
    >
      {/* LEFT SIDE */}
      <button
        type="button"
        onClick={() => onToggle?.("left")}
        className={`relative w-[50%] h-full flex justify-center items-center rounded-[25px] z-10 transition-colors duration-200 ${
          active === "left" ? "text-white" : "text-[#7C7C7C]"
        }`}
      >
        <span
          className={`font-medium ${textSize} font-montserrat relative z-20`}
        >
          {leftLabel}
        </span>

        {/* THE SLIDING BACKGROUND (Only renders here if active is left) */}
        {active === "left" && (
          <motion.div
            layoutId={pillLayoutId}
            className={`absolute inset-0 rounded-[25px] ${activeColor} shadow-sm`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>

      {/* RIGHT SIDE */}
      <button
        type="button"
        onClick={() => onToggle?.("right")}
        className={`relative w-[50%] h-full flex justify-center items-center rounded-[25px] z-10 transition-colors duration-200 ${
          active === "right" ? "text-white" : "text-[#7C7C7C]"
        }`}
      >
        <span
          className={`font-medium ${textSize} font-montserrat relative z-20`}
        >
          {rightLabel}
        </span>

        {/* THE SLIDING BACKGROUND (Moves here if active is right) */}
        {active === "right" && (
          <motion.div
            layoutId={pillLayoutId}
            className={`absolute inset-0 rounded-[25px] ${activeColor} shadow-sm`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
}
