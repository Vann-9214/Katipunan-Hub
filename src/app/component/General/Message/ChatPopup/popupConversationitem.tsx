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
  variants,
}: PopupConversationItemProps) {
  const isActive = conversation.unreadCount > 0;
  const router = useRouter();

  // --- ADDED for dropdown menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle main item click (navigation)
  const handleClick = () => {
    if (isMenuOpen) {
      return;
    }

    const navPath = `/Message/${conversation.id}`;
    // Using the safer timeout navigation to prevent race conditions with the popup closing
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
      variants={variants}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors w-full relative group
        ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
    >
      <Avatar
        avatarURL={conversation.avatarURL}
        altText={conversation.otherUserName}
        className="w-10 h-10 "
      />

      <div className="flex-1 overflow-hidden">
        <h3
          className={`font-semibold text-sm truncate ${
            isActive ? "text-gray-900" : "text-gray-700"
          }`}
        >
          {conversation.otherUserName}
        </h3>
        <p
          className={`text-xs truncate ${
            isActive ? "font-bold text-gray-800" : "text-gray-500"
          }`}
        >
          {conversation.lastMessagePreview}
        </p>
      </div>

      {/* Right-side logic */}
      <div className="flex flex-col items-end justify-start h-full pt-1 min-w-[40px]">
        {isActive ? (
          <>
            <span className="text-xs text-gray-500 mb-1">
              {conversation.timestamp}
            </span>
            {/* SHOWS EXACT UNREAD COUNT FOR THIS PERSON (e.g., 4) */}
            <AnimatePresence>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-[#8B0E0E] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </motion.span>
            </AnimatePresence>
          </>
        ) : (
          <>
            <span className={`text-xs text-gray-500 group-hover:hidden`}>
              {conversation.timestamp}
            </span>
            <button
              onClick={handleMenuClick}
              className="hidden group-hover:flex items-center justify-center w-5 h-5 cursor-pointer"
              aria-label="Conversation options"
            >
              <MoreHorizontal
                size={16}
                className="text-gray-400 group-hover:text-gray-700 transition-colors"
              />
            </button>
          </>
        )}
      </div>

      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r-lg bg-[#8B0E0E]"></span>
      )}

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-10 right-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
        >
          <ul className="py-1">
            <li
              onClick={handleFavorite}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Star size={16} />
              <span>Favorite</span>
            </li>
            <li
              onClick={handleBlock}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Ban size={16} />
              <span>Block</span>
            </li>
            <li
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 size={16} />
              <span>Delete Chat</span>
            </li>
          </ul>
        </div>
      )}
    </motion.div>
  );
}
