"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Star, Ban, Trash2 } from "lucide-react";
import { ConversationItem } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { motion, Variants, AnimatePresence } from "framer-motion";

interface PopupConversationItemProps {
  conversation: ConversationItem;
  variants: Variants;
}

export default function PopupConversationItem({
  conversation,
}: PopupConversationItemProps) {
  const isActive = conversation.unreadCount > 0;
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isMenuOpen) {
      return;
    }
    const navPath = `/Message/${conversation.id}`;
    setTimeout(() => {
      router.push(navPath);
    }, 50);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <motion.div
      onClick={handleClick}
      // Self-contained animation
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-all duration-200 w-full border
        ${
          isActive
            ? "bg-[#FFF9E5] border-[#EFBF04]/30 shadow-sm" // Gold tint for unread
            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100 hover:shadow-md"
        }`}
    >
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

      <div className="flex-1 overflow-hidden min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3
            className={`font-montserrat font-bold text-[14px] truncate ${
              isActive ? "text-[#8B0E0E]" : "text-gray-800"
            }`}
          >
            {conversation.otherUserName}
          </h3>
          {/* Timestamp moved here for better layout */}
          <span
            className={`text-[10px] font-medium shrink-0 ml-2 ${
              isActive ? "text-[#B48E00]" : "text-gray-400"
            }`}
          >
            {conversation.timestamp}
          </span>
        </div>

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

      {/* Action / Badge Column */}
      <div className="flex flex-col items-end justify-center min-w-[24px]">
        {isActive ? (
          <AnimatePresence>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-[#8B0E0E] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm border border-white"
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </motion.span>
          </AnimatePresence>
        ) : (
          <button
            onClick={handleMenuClick}
            className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#EFBF04]/10 hover:text-[#8B0E0E] text-gray-400 transition-all duration-200"
            aria-label="Conversation options"
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={menuRef}
            className="absolute top-10 right-2 w-40 bg-white border border-gray-100 rounded-[14px] shadow-xl z-50 overflow-hidden"
          >
            <ul className="py-1">
              <li
                onClick={handleFavorite}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#FFF9E5] hover:text-[#B48E00] cursor-pointer transition-colors"
              >
                <Star size={14} />
                <span>Favorite</span>
              </li>
              <li
                onClick={handleBlock}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
              >
                <Ban size={14} />
                <span>Block</span>
              </li>
              <div className="h-px bg-gray-100 mx-2" />
              <li
                onClick={handleDelete}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Chat</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
