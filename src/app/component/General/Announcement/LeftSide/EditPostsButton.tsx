"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

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
    <div ref={menuRef} className="relative select-none z-20">
      {/* Animated 3-dot Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.15, rotate: 90 }} // Rotate slightly on hover
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
      >
        <Image
          src="/Triple Dot.svg"
          alt="Menu"
          width={size}
          height={size}
          className="invert brightness-0 opacity-80 hover:opacity-100 transition-opacity"
          draggable={false}
        />
      </motion.button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10, originX: 1, originY: 0 }} // Grow from top-right
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={clsx(
              "absolute right-0 mt-2 w-[190px] rounded-[12px] bg-[#D9D9D9] shadow-xl border border-gray-300 p-1.5 z-50 overflow-hidden"
            )}
          >
            {/* Edit Post Item */}
            <motion.button
              onClick={handleEdit}
              whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer flex items-center gap-3 w-full text-left px-3 py-2.5 mb-1 rounded-[8px] transition-colors font-montserrat font-medium text-[15px] text-[#333]"
            >
              <div className="opacity-80 w-5 h-5 relative shrink-0">
                <Image
                  src="/Edit.svg"
                  alt="Edit Icon"
                  fill
                  className="object-contain"
                  draggable={false}
                />
              </div>
              <span>Edit Post</span>
            </motion.button>

            {/* Remove Post Item */}
            <motion.button
              onClick={handleRemove}
              whileHover={{
                scale: 1.02,
                backgroundColor: "#fee2e2", // Light red tint
                color: "#b91c1c", // Red text
              }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[8px] transition-colors font-montserrat font-medium text-[15px] text-[#333]"
            >
              <div className="opacity-80 w-5 h-5 relative shrink-0">
                <Image
                  src="/Trash.svg"
                  alt="Trash Icon"
                  fill
                  className="object-contain"
                  draggable={false}
                />
              </div>
              <span>Remove Post</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
