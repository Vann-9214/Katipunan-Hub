import { Variants } from "framer-motion";

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

// The auth panels behave as a two-slide carousel: sign in always parks on the left,
// sign up always parks on the right, and whichever is active sits at 0. That makes the
// travel direction implicit, so no separate `direction` state is needed to keep them
// in sync.
export const AUTH_PANEL_RESTING_OFFSET = {
  signin: "-100%",
  signup: "100%",
} as const;

// Both panels travel together, so the swap is symmetric.
// "expo out" — decisive start, long settle. Anything slower reads as sluggish.
export const modalSlideTransition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.45,
} as const;
