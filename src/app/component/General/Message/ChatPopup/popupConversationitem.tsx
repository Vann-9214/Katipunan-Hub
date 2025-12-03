"use client";

import { useRouter } from "next/navigation";
import { ConversationItem } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { motion, Variants, AnimatePresence } from "framer-motion";

interface PopupConversationItemProps {
  conversation: ConversationItem;
  variants: Variants; // Kept for type compatibility, even if unused inside
  currentUserId: string | undefined;
  onUpdate: () => void;
}

export default function PopupConversationItem({
  conversation,
}: PopupConversationItemProps) {
  const isActive = conversation.unreadCount > 0;
  const router = useRouter();

  const handleClick = () => {
    const navPath = `/Message/${conversation.id}`;
    setTimeout(() => {
      router.push(navPath);
    }, 50);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-all duration-200 w-full border
        ${
          isActive
            ? "bg-[#FFF9E5] border-[#EFBF04]/30 shadow-sm"
            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100 hover:shadow-md"
        }`}
    >
      {/* 1. Avatar Section (Left) */}
      <div
        className={`relative rounded-full p-[2px] ${
          isActive
            ? "bg-gradient-to-br from-[#EFBF04] to-[#F59E0B]"
            : "bg-transparent"
        }`}
      >
        <Avatar
          avatarURL={conversation.avatarURL}
          altText={conversation.otherUserName}
          className="w-[42px] h-[42px]"
        />
      </div>

      {/* 2. Message Info Section (Middle) */}
      <div className="flex-1 overflow-hidden min-w-0 flex flex-col justify-center">
        {/* Name (Timestamp removed from here) */}
        <h3
          className={`font-montserrat font-bold text-[14px] truncate mb-0.5 ${
            isActive ? "text-[#8B0E0E]" : "text-gray-800"
          }`}
        >
          {conversation.otherUserName}
        </h3>

        {/* Preview */}
        <p
          className={`text-[12px] truncate font-montserrat leading-tight ${
            isActive
              ? "font-bold text-gray-900"
              : "text-gray-500 group-hover:text-gray-600"
          }`}
        >
          {isActive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0E0E] inline-block" />
              {conversation.lastMessagePreview}
            </span>
          ) : (
            conversation.lastMessagePreview
          )}
        </p>
      </div>

      {/* 3. Meta Section (Right Most) */}
      {/* Contains Timestamp (Top) and Badge (Bottom) */}
      <div className="flex flex-col items-end justify-center min-w-[60px] gap-1">
        {/* Timestamp - Moved Here */}
        <span
          className={`text-[10px] font-medium whitespace-nowrap ${
            isActive ? "text-[#B48E00]" : "text-gray-400"
          }`}
        >
          {conversation.timestamp}
        </span>

        {/* Unread Badge */}
        <div className="h-5 flex items-center">
          <AnimatePresence>
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-[#8B0E0E] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm border border-white"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
