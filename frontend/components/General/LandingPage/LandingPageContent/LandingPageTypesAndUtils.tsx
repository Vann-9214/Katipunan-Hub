// LandingPageTypesAndUtil.ts

import React from "react";
import { Variants } from "framer-motion";

/**
 * Type Definition for Auth Mode
 */
export type AuthMode =
  | "none"
  | "signup"
  | "signin"
  | "forgotpassword"
  | "verify";

/**
 * Custom GlassCard Component (Copied from original)
 */
export const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`
      relative overflow-hidden
      bg-white/20 
      backdrop-blur-xl 
      border border-white/30 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
      rounded-[24px]
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-50 before:pointer-events-none
      ${className}
    `}
  >
    {children}
  </div>
);

/**
 * ANIMATION VARIANTS (Copied from original)
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

export const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};

export const floatingVariant: Variants = {
  float: {
    y: [0, -20, 0],
    x: [0, 5, 0],
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  floatReverse: {
    y: [0, 20, 0],
    x: [0, -5, 0],
    rotate: [0, -3, 3, 0],
    transition: {
      duration: 9,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1,
    },
  },
};

export const logoEntranceVariant: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
