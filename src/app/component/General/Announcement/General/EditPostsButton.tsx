"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ImageButton } from "@/app/component/ReusableComponent/Buttons";
import clsx from "clsx";

interface EditPostsButtonProps {
  onEdit?: () => void;
  onRemove?: () => void;
  size?: number;
}

export default function EditPostsButton({
  onEdit,
  onRemove,
  size = 28,
}: EditPostsButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    onEdit?.();
    setOpen(false);
  };

  const handleRemove = () => {
    onRemove?.();
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative select-none">
      {/* 3-dot button */}
      <ImageButton
        src="/Triple Dot.svg"
        width={size}
        height={size}
        onClick={() => setOpen((prev) => !prev)}
        className="invert brightness-0"
      />

      {/* Dropdown */}
      {open && (
        <div
          className={clsx(
            "absolute right-0 mt-2 w-[190px] rounded-[10px] bg-[#D9D9D9] shadow-md border border-gray-300 p-1 z-50"
          )}
        >
          {/* Edit Post */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 w-full text-left px-2 py-1 mb-1 rounded-md hover:bg-gray-200 transition font-montserrat font-medium text-[16px] text-[#333]"
          >
            <Image
              src="/Edit.svg"
              alt="Edit Icon"
              width={20}
              height={20}
              draggable={false}
            />
            <span>Edit Post</span>
          </button>

          {/* Remove Post */}
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-gray-200 transition font-montserrat font-medium text-[16px] text-[#333]"
          >
            <Image
              src="/Trash.svg"
              alt="Trash Icon"
              width={20}
              height={20}
              draggable={false}
            />
            <span>Remove Post</span>
          </button>
        </div>
      )}
    </div>
  );
}
