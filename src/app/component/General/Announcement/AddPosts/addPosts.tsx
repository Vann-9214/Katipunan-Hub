"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  currentType?: "announcement" | "highlight" | "feed"; // Added feed
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
      {/* Trigger Bar */}
      <div
        className={`relative w-[590px] h-[80px] rounded-[15px] p-[5px] bg-gold
        `}
      >
        <div
          className={`bg-darkmaroon
           w-[580px] h-[70px] rounded-[10px] flex px-[15px] justify-center items-center`}
        >
          {isFeed && author ? (
            <Avatar
              avatarURL={author.avatarURL}
              altText={author.fullName}
              className="w-[55px] h-[55px]"
            />
          ) : (
            <Image
              src="/Cit Logo.svg"
              alt="Cit Logo"
              width={55}
              height={55}
              draggable={false}
            />
          )}

          {/* Button with Tap Animation */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-[490px] h-[45px] rounded-[18px] mx-[10px] bg-gray-100 placeholder:text-black/60 cursor-pointer hover:brightness-95 flex items-center border border-gray-200"
            onClick={handleOpen}
          >
            <p className="font-montserrat text-[18px] text-black/60 ml-4 text-left font-medium">
              {isFeed
                ? `What's on your mind, ${
                    author?.fullName.split(" ")[0] || "Teknoy"
                  }?`
                : currentType === "highlight"
                ? "Create highlight..."
                : "Create announcement..."}
            </p>
          </motion.button>
        </div>
      </div>

      {/* Modal with AnimatePresence */}
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
