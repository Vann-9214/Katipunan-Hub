"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";

interface NavigationButtonProps {
  label: string;
  icon: ElementType;
  href: string;
  isActive?: boolean;
}

export default function NavigationButton({
  label,
  icon: Icon,
  href,
  isActive = false,
}: NavigationButtonProps) {
  return (
    <motion.a
      href={href}
      aria-current={isActive ? "page" : undefined}
      // Base styles
      className={`
        relative
        flex
        flex-col
        items-center
        justify-center
        min-w-[105px]
        h-[70px]
        px-4
        py-2
        rounded-[10px]
        overflow-hidden
        cursor-pointer
        transition-colors
        ${isActive ? "text-[#8B0E0E]" : "text-black"}
      `}
      // --- Framer Motion Props ---
      initial="idle"
      whileHover={isActive ? "idle" : "hover"} // Only animate hover if NOT active
      animate={isActive ? "active" : "idle"}
    >
      {/* 1. Background Hover Fill (Subtle Fade) */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 bg-black/5"
          variants={{
            idle: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 2. ICON Animation */}
      <motion.div
        className="relative z-10"
        variants={{
          idle: { y: 0 },
          hover: { y: -12 }, // Moves up to make room for text
          active: { y: 0 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon className="w-[26px] h-[26px]" />
      </motion.div>

      {/* 3. LABEL Animation (Slides up and fades in) */}
      <motion.span
        className="absolute bottom-2.5 text-[14px] font-medium font-montserrat whitespace-nowrap z-10"
        variants={{
          idle: { opacity: 0, y: 15 },
          hover: { opacity: 1, y: 0 },
          active: { opacity: 0, y: 15 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {label}
      </motion.span>

      {/* 4. UNDERLINE (Only for Active State) */}
      {isActive && (
        <motion.span
          layoutId="active-tab-indicator" // Creates a sliding effect between tabs if you use AnimateSharedLayout in parent
          className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#8B0E0E] rounded-full"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.a>
  );
}
