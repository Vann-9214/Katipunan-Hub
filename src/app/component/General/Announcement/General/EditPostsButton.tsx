"use client";

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
  size = 50,
}: EditPostsButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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
      />

      {/* Dropdown */}
      {open && (
        <div
          className={clsx(
            "absolute right-0 mt-2 w-[190px] rounded-[10px] bg-[#D9D9D9] shadow-md border border-gray-300 p-2 z-50"
          )}
        >
          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 transition font-montserrat text-[16px] text-[#333]"
            onClick={handleEdit}
          >
            Edit Post
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 transition font-montserrat text-[16px] text-[#333]"
            onClick={handleRemove}
          >
            Remove Post
          </button>
        </div>
      )}
    </div>
  );
}
