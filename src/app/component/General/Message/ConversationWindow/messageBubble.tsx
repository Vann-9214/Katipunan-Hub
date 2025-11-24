"use client";

import { Message } from "../Utils/types";
import { motion } from "framer-motion";

export default function MessageBubble({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex w-full mb-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <motion.div
        // Entry animation for the bubble itself
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        whileHover={{ scale: 1.01 }}
        className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-sm relative transition-shadow ${
          isCurrentUser
            ? "bg-[#8B0E0E] text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="text-[15px] font-montserrat leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <span
          className={`text-[10px] mt-1 block text-right font-medium ${
            isCurrentUser ? "text-white/70" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </motion.div>
    </div>
  );
}
