"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AddEventFloatingButtonProps {
  onClick: () => void;
}

export default function AddEventFloatingButton({
  onClick,
}: AddEventFloatingButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[50]"
      aria-label="Add Event"
    >
      <div className="relative w-[80px] h-[80px] drop-shadow-2xl">
        <Image
          src="/Plus Sign.svg"
          alt="Add Event"
          fill
          className="object-contain"
        />
      </div>
    </motion.button>
  );
}
