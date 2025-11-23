"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Star, Ban, Trash2 } from "lucide-react";
import { ConversationItem } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { motion, Variants } from "framer-motion"; // ADDED motion, Variants

interface PopupConversationItemProps {
  conversation: ConversationItem;
  variants: Variants; // ADDED variants prop
}

export default function PopupConversationItem({
  conversation,
  variants, // DESTRUCTURED variants
}: PopupConversationItemProps) {
  const isActive = conversation.unreadCount > 0;
  const router = useRouter();

  // --- ADDED for dropdown menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for click-outside logic

  // Handle main item click (navigation)
  const handleClick = () => {
    // If menu is open, the click will be handled by the click-outside listener,
    // which will close the menu. We don't want to navigate.
    if (isMenuOpen) {
      return;
    }

    // --- START OF FIX & DEBUGGING ---
    const navPath = `/Message/${conversation.id}`;
    console.log(
      `[DEBUG] PopupConversationItem: Clicked. Queuing navigation to: ${navPath}`
    );

    // FIX: Wrap in setTimeout to prevent race condition.
    // This lets the popup close state update *before* we navigate.
    setTimeout(() => {
      console.log(
        `[DEBUG] PopupConversationItem: Firing router.push() inside timeout.`
      );
      router.push(navPath);
    }, 50); // 50ms is a safe, small delay
    // --- END OF FIX & DEBUGGING ---
  };

  // --- ADDED: Handle menu icon click ---
  // This toggles the menu on/off
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // VERY IMPORTANT: Prevents handleClick from firing
    setIsMenuOpen((prev) => !prev);
  };

  // --- ADDED: Placeholder handlers for menu actions ---
  // These must also stop propagation
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Favorite clicked for:", conversation.id);
    setIsMenuOpen(false);
  };

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Block clicked for:", conversation.id);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Delete clicked for:", conversation.id);
    setIsMenuOpen(false);
  };

  // --- ADDED: Click-outside-to-close logic ---
  // This closes the menu if you click anywhere else
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  // --- END of additions ---

  return (
    <motion.div // CHANGED to motion.div
      onClick={handleClick}
      variants={variants} // ADDED variants prop
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

      {/* --- MODIFIED: Right-side logic for hover menu --- */}
      <div className="flex flex-col items-end justify-start h-full pt-1">
        {isActive ? (
          // --- UNREAD STATE ---
          <>
            <span className="text-xs text-gray-500">
              {conversation.timestamp}
            </span>
            <span className="bg-[#8B0E0E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-1">
              {conversation.unreadCount}
            </span>
          </>
        ) : (
          // --- READ STATE (with hover effect) ---
          <>
            {/* Timestamp: Show by default, hide on hover */}
            <span className={`text-xs text-gray-500 group-hover:hidden`}>
              {conversation.timestamp}
            </span>
            {/* Menu Icon: Show only on hover */}
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
      {/* --- END of modification --- */}

      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r-lg bg-[#8B0E0E]"></span>
      )}

      {/* --- ADDED: Dropdown Menu --- */}
      {isMenuOpen && (
        <div
          ref={menuRef} // Attach ref
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
      {/* --- END of additions --- */}
    </motion.div>
  );
}
