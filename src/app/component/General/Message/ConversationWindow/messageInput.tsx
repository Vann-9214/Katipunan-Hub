"use client";

import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  onSubmit,
}: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.form
      // 1. Smoother slide-up entry
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      }}
      onSubmit={onSubmit}
      className="p-4 border-t border-gray-200 bg-gray-50 z-10"
    >
      <div className="relative flex items-center gap-2">
        {/* 2. Animated Input Field */}
        <motion.input
          layout
          type="text"
          placeholder="Write a comment..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // Animate border, scale, and shadow on focus
          animate={{
            scale: isFocused ? 1.01 : 1,
            boxShadow: isFocused
              ? "0px 4px 12px rgba(255, 201, 201, 0.4)"
              : "0px 0px 0px rgba(0,0,0,0)",
            borderColor: isFocused ? "#FFC9C9" : "#E5E7EB",
          }}
          transition={{ duration: 0.2 }}
          className="w-full pl-4 pr-12 py-3 rounded-full bg-gray-100 border focus:outline-none"
        />

        {/* 3. Animated Send Button */}
        <motion.button
          type="submit"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          // Hover and Tap effects
          whileHover={{ scale: 1.1, backgroundColor: "#a01010" }}
          whileTap={{ scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#8B0E0E] text-white shadow-md flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={20} />
        </motion.button>
      </div>
    </motion.form>
  );
}
