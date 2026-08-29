"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CommentButtonProps {
  onClick?: () => void;
  size?: "sm" | "md";
}

export default function CommentButton({
  onClick,
  size = "md",
}: CommentButtonProps) {
  const isSmall = size === "sm";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full cursor-pointer rounded-xl font-montserrat font-semibold flex items-center justify-center gap-2 transition-all select-none ${
        isSmall
          ? "py-1 px-2 text-xs text-white/70 hover:text-white"
          : "py-2 px-4 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10"
      }`}
    >
      <Image
        src="/Comment.svg"
        alt="Comment"
        width={isSmall ? 16 : 20}
        height={isSmall ? 16 : 20}
        className="invert brightness-0 opacity-80"
      />
      <span className="text-white/90">Comment</span>
    </motion.button>
  );
}
