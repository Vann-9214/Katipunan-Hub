"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react"; // We only need one icon now
import { motion, AnimatePresence } from "framer-motion";

interface TagsDisplayProps {
  width?: string;
  tags?: string[];
  mode?: "filter" | "edit";
  onTagClick?: (tags: string[]) => void;
  onTagRemove?: (tag: string) => void;
}

export default function TagsFilter({
  width = "w-[320px]",
  tags = [],
  mode = "filter",
  onTagClick,
  onTagRemove,
}: TagsDisplayProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleTagClick = (tag: string) => {
    if (mode === "filter") {
      const newSelection = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];
      setSelectedTags(newSelection);
      onTagClick?.(newSelection);
    }
  };

  const handleTagRemove = (tag: string) => {
    if (mode === "edit") {
      onTagRemove?.(tag);
    }
  };

  return (
    <div
      className={`bg-white text-black border border-gray-300 rounded-lg shadow-sm overflow-hidden ${width}`}
    >
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 border-b border-gray-200 cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold font-montserrat text-[20px] text-gray-900">
          Tags
        </span>
        {/* Animated Icon Rotation */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} className="text-gray-600" />
        </motion.div>
      </button>

      {/* Animated Content Container */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 250 : 105, // Animate between preview height and full height
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`px-5 overflow-y-auto ${!isOpen && "overflow-hidden"}`} // Hide scrollbar when closed
      >
        <div className="pt-2 pb-3">
          {tags.length === 0 ? (
            <span className="text-gray-500 text-[16px] font-medium font-montserrat">
              No Tags Available
            </span>
          ) : (
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-start content-start">
              <AnimatePresence mode="popLayout">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  if (mode === "filter") {
                    return (
                      <motion.button
                        layout // Smoothly slide into place if siblings move
                        key={tag}
                        whileTap={{ scale: 0.95 }} // Tactile press effect
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleTagClick(tag)}
                        initial={false}
                        animate={{
                          backgroundColor: isSelected ? "#D4AF37" : "#E5E7EB",
                          color: isSelected ? "#ffffff" : "#1f2937",
                        }}
                        transition={{ duration: 0.2 }}
                        className="h-[25px] rounded-[20px] px-5 shadow-none whitespace-nowrap flex-shrink min-w-[10px] text-[16px] font-medium font-montserrat cursor-pointer"
                      >
                        {`#${tag}`}
                      </motion.button>
                    );
                  } else {
                    // EDIT MODE
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }} // Smooth removal animation
                        key={tag}
                        className="flex items-center bg-gray-200 text-gray-800 rounded-full px-4 py-1 text-[18px] font-medium font-montserrat"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-gray-600 hover:text-black cursor-pointer font-bold text-[20px]"
                        >
                          ×
                        </button>
                      </motion.div>
                    );
                  }
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
