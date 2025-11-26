"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function CommentButton() {
  return (
    <motion.button
      // Match the animation style of the Reaction button
      whileHover={{ scale: 1.001, backgroundColor: "rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="cursor-pointer rounded-[10px] text-[18px] font-montserrat font-medium h-[35px] w-full flex gap-1 items-center justify-center text-black"
    >
      <Image src="/Comment.svg" alt="Comment" height={18} width={18} />
      Comment
    </motion.button>
  );
}
