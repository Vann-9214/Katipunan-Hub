"use client";

import Avatar from "@/app/component/ReusableComponent/Avatar";
import { OtherUser } from "../Utils/types";
import { motion } from "framer-motion";

export default function ConversationHeader({
  otherUser,
}: {
  otherUser: OtherUser | null;
}) {
  return (
    <motion.div
      // Smooth slide-down without bounce
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.4,
      }}
      className="flex items-center gap-4 p-4 border-b border-gray-200 shadow-sm bg-gray-50 z-20 relative"
    >
      {/* Avatar Pop-in */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Avatar
          avatarURL={otherUser?.avatarURL}
          altText={otherUser?.fullName || "User"}
          className="w-10 h-10"
        />
      </motion.div>

      {/* Name Slide-in */}
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="font-semibold text-lg text-gray-800"
      >
        {otherUser?.fullName || "Other User Name"}
      </motion.h2>
    </motion.div>
  );
}
