"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";

interface NavigationButtonProps {
  label: string;
  icon: ElementType;
  href: string;
  isActive?: boolean;
  // New prop to control text/icon color style
  theme?: "light" | "dark";
}

export default function NavigationButton({
  label,
  icon: Icon,
  href,
  isActive = false,
  theme = "light", // Default to light (standard behavior)
}: NavigationButtonProps) {
  // Define color styles based on theme
  const isDarkTheme = theme === "dark";

  // Idle color: Black for light theme, White/80 for dark theme
  const idleColor = isDarkTheme ? "text-white/80" : "text-black";

  // Active color: Maroon for light theme, Gold for dark theme
  const activeColor = isDarkTheme ? "text-[#FFD700]" : "text-[#8B0E0E]";

  // Hover bg: Black fade for light, White fade for dark
  const hoverBg = isDarkTheme ? "bg-white/10" : "bg-black/5";

  // Underline color
  const indicatorColor = isDarkTheme ? "bg-[#FFD700]" : "bg-[#8B0E0E]";

  return (
    <motion.a
      href={href}
      aria-current={isActive ? "page" : undefined}
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
        ${isActive ? activeColor : idleColor}
      `}
      initial="idle"
      whileHover={isActive ? "idle" : "hover"}
      animate={isActive ? "active" : "idle"}
    >
      {/* 1. Background Hover Fill */}
      {!isActive && (
        <motion.div
          className={`absolute inset-0 ${hoverBg}`}
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
          hover: { y: -12 },
          active: { y: 0 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon className="w-[26px] h-[26px]" />
      </motion.div>

      {/* 3. LABEL Animation */}
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

      {/* 4. ACTIVE INDICATOR */}
      {isActive && (
        <motion.span
          layoutId="active-tab-indicator"
          className={`absolute bottom-0 left-4 right-4 h-[4px] rounded-t-full ${indicatorColor} shadow-[0_0_10px_rgba(255,215,0,0.6)]`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.a>
  );
}
