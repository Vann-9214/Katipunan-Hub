"use client";

import Avatar from "@/app/component/ReusableComponent/Avatar";
import { OtherUser } from "../Utils/types";
import { motion, Variants } from "framer-motion"; // 1. Imported Variants
import Link from "next/link";

export default function ConversationHeader({
  otherUser,
}: {
  otherUser: OtherUser | null;
}) {
  // --- Animation Variants (Typed) ---

  const containerVariants: Variants = {
    rest: {},
    hover: {},
  };

  const avatarVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const textVariants: Variants = {
    rest: { x: 0 },
    hover: {
      x: 5,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  // 2. Added Arrow Variants for the little arrow animation
  const arrowVariants: Variants = {
    rest: { opacity: 0, x: -5 },
    hover: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
      // Maroon Gradient Background
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 shadow-md relative z-20 shrink-0"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />

      {/* --- CLICKABLE PROFILE SECTION WITH HOVER ANIMATION --- */}
      {otherUser ? (
        <Link href={`/Profile/${otherUser.id}`} className="relative z-10">
          <motion.div
            className="flex items-center gap-4 cursor-pointer"
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={containerVariants}
          >
            {/* Avatar Wrapper */}
            <motion.div
              variants={avatarVariants}
              className="p-[2px] bg-white/10 rounded-full border border-[#EFBF04]/50"
            >
              <Avatar
                avatarURL={otherUser?.avatarURL}
                altText={otherUser?.fullName || "User"}
                className="w-10 h-10 border-2 border-[#3a0000]"
              />
            </motion.div>

            {/* Text Wrapper */}
            <motion.div variants={textVariants}>
              <h2 className="font-bold text-lg text-white font-montserrat tracking-wide decoration-[#EFBF04] decoration-2 underline-offset-4 group-hover:underline">
                {otherUser?.fullName || "Loading..."}
              </h2>
              <p className="text-xs text-[#EFBF04]/90 font-medium font-ptsans flex items-center gap-1">
                View Profile
                <motion.span
                  variants={arrowVariants}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </p>
            </motion.div>
          </motion.div>
        </Link>
      ) : (
        // Skeleton/Loading state
        <div className="flex items-center gap-4 relative z-10 opacity-70">
          <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
            <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
