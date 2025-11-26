"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
} from "../Utils/types";
import { AddPostModal } from "./addPostModal";
import Avatar from "@/app/component/ReusableComponent/Avatar";

// Props Interface
export interface AddPostsProps {
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostUI | null;
  currentType?: "announcement" | "highlight" | "feed";
  authorId?: string | null;

  // --- Feed Support ---
  isFeed?: boolean;
  author?: {
    fullName: string;
    avatarURL: string | null;
  } | null;
}

// Component
export default function AddPosts(props: AddPostsProps) {
  const {
    externalOpen,
    onExternalClose,
    currentType,
    initialPost,
    isFeed,
    author,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof externalOpen === "boolean") {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handlers
  const handleClose = () => {
    setIsOpen(false);
    onExternalClose?.();
  };

  const handleOpen = () => {
    onExternalClose?.();
    setIsOpen(true);
  };

  // Render
  return (
    <>
      {/* Trigger Bar Container - Gold Gradient Border */}
      <div className="w-[590px] p-[3px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl mb-8">
        {/* Inner Content Wrapper */}
        <div className="w-full rounded-[18px] overflow-hidden bg-transparent">
          {/* Maroon Background Section */}
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] h-[80px] flex items-center px-5 gap-4">
            {/* Avatar / Logo */}
            <div className="shrink-0">
              {isFeed && author ? (
                <Avatar
                  avatarURL={author.avatarURL}
                  altText={author.fullName}
                  className="w-[50px] h-[50px]"
                />
              ) : (
                <Image
                  src="/Cit Logo.svg"
                  alt="Cit Logo"
                  width={50}
                  height={50}
                  draggable={false}
                  className="drop-shadow-md"
                />
              )}
            </div>

            {/* Mock Input Button */}
            <button
              type="button"
              onClick={handleOpen}
              className="flex-1 h-[45px] bg-white rounded-[12px] px-4 flex items-center text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100 focus:outline-none group"
            >
              <span className="font-montserrat text-[16px] text-gray-500 font-medium group-hover:text-gray-600 truncate">
                {isFeed
                  ? `What's on your mind, ${
                      author?.fullName.split(" ")[0] || "Teknoy"
                    }?`
                  : currentType === "highlight"
                  ? "Create highlight..."
                  : "Create announcement..."}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {mounted && isOpen && (
          <AddPostModal
            {...props}
            initialPost={initialPost ?? null}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
