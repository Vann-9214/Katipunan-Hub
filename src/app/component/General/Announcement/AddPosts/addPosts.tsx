"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
          <button
            type="button"
            className="w-[490px] h-[45px] rounded-[18px] mx-[10px] bg-gray-200 placeholder:text-black/60 cursor-pointer hover:brightness-105"
            onClick={handleOpen}
          >
            <p className="font-montserrat text-[18px] text-black/70 ml-4 text-left font-medium">
              {currentType === "highlight"
                ? "Create highlight..."
                : "Create announcement..."}
            </p>
          </button>
        </div>
      </div>

      {/* Modal */}
      {mounted && isOpen && (
        <AddPostModal
          {...props}
          initialPost={initialPost ?? null}
          onClose={handleClose}
        />
      )}
    </>
  );
}
