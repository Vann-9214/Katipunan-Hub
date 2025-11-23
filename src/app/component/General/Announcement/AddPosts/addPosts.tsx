"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 1. Import AnimatePresence
import {
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
} from "../Utils/types";
import { AddPostModal } from "./addPostModal";

// Props Interface
export interface AddPostsProps {
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostUI | null;
  currentType?: "announcement" | "highlight";
  authorId?: string | null;
}

// Component
export default function AddPosts(props: AddPostsProps) {
  const { externalOpen, onExternalClose, currentType, initialPost } = props;

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
      <div className="relative bg-gold w-[590px] h-[80px] rounded-[15px] p-[5px]">
        <div className="bg-darkmaroon w-[580px] h-[70px] rounded-[10px] flex px-[15px] justify-center items-center">
          <Image
            src="/Cit Logo.svg"
            alt="Cit Logo"
            width={55}
            height={55}
            draggable={false}
          />
          {/* Button with Tap Animation */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-[490px] h-[45px] rounded-[18px] mx-[10px] bg-gray-200 placeholder:text-black/60 cursor-pointer hover:brightness-105 flex items-center"
            onClick={handleOpen}
          >
            <p className="font-montserrat text-[18px] text-black/70 ml-4 text-left font-medium">
              {currentType === "highlight"
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
