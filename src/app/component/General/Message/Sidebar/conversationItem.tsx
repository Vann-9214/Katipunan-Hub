"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // Import Portal
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal, Star, Ban, Trash2, RotateCcw } from "lucide-react";
import { Conversation } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { motion } from "framer-motion";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";

export default function ConversationItem({
  conversation,
  onUpdate,
  currentUserId,
}: {
  conversation: Conversation;
  onUpdate: () => void;
  currentUserId: string | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === `/Message/${conversation.id}`;
  const isUnread = conversation.unreadCount > 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleItemClick = () => {
    router.push(`/Message/${conversation.id}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 130; // Approximate height of the menu
      const menuWidth = 144; // Width of w-36 (9rem)

      // Check space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < menuHeight;

      setMenuCoords({
        // Align right edge of menu with right edge of button
        left: rect.right - menuWidth,
        // If showing above, position above button, else below
        top: showAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
      });

      setIsMenuOpen(true);
    }
  };

  // Close menu on scroll or resize
  useEffect(() => {
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) return;

    try {
      const isUserA = currentUserId === conversation.user_a_id;
      const updateField = isUserA ? "user_a_is_favorite" : "user_b_is_favorite";

      const { error } = await supabase
        .from("Conversations")
        .update({ [updateField]: !conversation.is_favorite })
        .eq("id", conversation.id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
    setIsMenuOpen(false);
  };

  const handleBlock = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) return;

    try {
      const isUserA = currentUserId === conversation.user_a_id;
      const updateField = isUserA
        ? "user_b_is_blocked_by_a"
        : "user_a_is_blocked_by_b";

      const { error } = await supabase
        .from("Conversations")
        .update({ [updateField]: !conversation.is_blocked })
        .eq("id", conversation.id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Error toggling block:", err);
    }
    setIsMenuOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) return;

    if (!confirm("Are you sure? This will delete the chat for both users.")) {
      setIsMenuOpen(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("Conversations")
        .delete()
        .eq("id", conversation.id);

      if (error) throw error;
      if (isActive) router.push("/Message");
      onUpdate();
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
    setIsMenuOpen(false);
  };

  // Define the Menu Component
  const MenuContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-start"
      onClick={(e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
      }}
    >
      {/* Invisible backdrop to catch clicks */}

      <div
        className="absolute bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        style={{
          top: menuCoords.top,
          left: menuCoords.left,
          width: "144px", // w-36
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <ul className="py-1">
          <li
            onClick={handleFavorite}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFBF04]/10 hover:text-[#8B0E0E] cursor-pointer transition-colors"
          >
            <Star
              size={14}
              className={
                conversation.is_favorite ? "fill-current text-[#EFBF04]" : ""
              }
            />
            <span>{conversation.is_favorite ? "Unfavorite" : "Favorite"}</span>
          </li>
          <li
            onClick={handleBlock}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFBF04]/10 hover:text-[#8B0E0E] cursor-pointer transition-colors"
          >
            {conversation.is_blocked ? (
              <RotateCcw size={14} />
            ) : (
              <Ban size={14} />
            )}
            <span>{conversation.is_blocked ? "Unblock" : "Block"}</span>
          </li>
          <li
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors border-t border-gray-100"
          >
            <Trash2 size={14} />
            <span>Delete Chat</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        layout
        onClick={handleItemClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 relative group border
          ${
            isActive
              ? "bg-gradient-to-r from-[#8B0E0E]/5 to-[#8B0E0E]/10 border-[#8B0E0E]/20 shadow-sm"
              : "bg-white hover:bg-gray-50 border-transparent hover:border-gray-100"
          }
        `}
      >
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#8B0E0E] rounded-r-full" />
        )}

        <Avatar
          avatarURL={conversation.otherUser.avatarURL}
          altText={conversation.otherUser.fullName}
          className="w-11 h-11 shadow-sm border border-gray-100"
        />

        <div className="flex-1 overflow-hidden ml-1">
          <h3
            className={`font-bold text-[14px] truncate font-montserrat ${
              isActive ? "text-[#8B0E0E]" : "text-gray-800"
            }`}
          >
            {conversation.otherUser.fullName}
          </h3>
          <p
            className={`text-xs truncate font-medium ${
              isUnread ? "font-bold text-black" : "text-gray-500"
            }`}
          >
            {conversation.lastMessageContent || "Start a chat..."}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 ml-2 justify-center min-h-[40px]">
          {isUnread ? (
            <>
              <span className="text-[10px] font-bold text-[#B48E00] mb-1">
                {new Date(conversation.last_message_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="bg-[#8B0E0E] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
                {conversation.unreadCount}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-400 group-hover:hidden">
                {new Date(conversation.last_message_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                ref={buttonRef}
                onClick={handleMenuClick}
                className="hidden group-hover:flex items-center justify-center w-6 h-6 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Conversation options"
              >
                <MoreHorizontal
                  size={16}
                  className="text-gray-400 group-hover:text-gray-700"
                />
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Render the menu in a Portal (teleport to body) */}
      {isMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(MenuContent, document.body)}
    </>
  );
}
