"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal, Star, Ban, Trash2 } from "lucide-react";
import { Conversation } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar"; // Use user's path

export default function ConversationItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === `/Message/${conversation.id}`;
  const isUnread = conversation.unreadCount > 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isMenuOpen) {
      return;
    }
    const navPath = `/Message/${conversation.id}`;
    console.log(`[DEBUG] ConversationItem: Clicked. Navigating to: ${navPath}`);
    router.push(navPath);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

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
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors relative group ${
        isActive
          ? "bg-black/5 shadow-inner border border-black/60"
          : "hover:bg-gray-100"
      }`}
    >
      <Avatar
        avatarURL={conversation.otherUser.avatarURL}
        altText={conversation.otherUser.fullName}
        className="w-12 h-12 border-2 border-black"
      />

      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-gray-800 truncate">
          {conversation.otherUser.fullName}
        </h3>
        <p
          className={`text-sm truncate ${
            isUnread ? "font-bold text-[#8B0E0E]" : "text-gray-600"
          }`}
        >
          {conversation.lastMessageContent || "Start a chat..."}
        </p>
      </div>

      <div className="flex flex-col items-end flex-shrink-0 ml-2">
        {isUnread ? (
          <>
            <span className="text-xs text-gray-500 mb-1">
              {new Date(conversation.last_message_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="bg-[#8B0E0E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-500 group-hover:hidden">
              {new Date(conversation.last_message_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-12 right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
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
    </div>
  );
}
