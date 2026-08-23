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

export const modalSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};
