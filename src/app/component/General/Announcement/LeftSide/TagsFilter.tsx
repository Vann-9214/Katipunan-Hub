"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden ${width}`}
    >
      {/* Header Button - Updated with LIGHTER Maroon Gradient Theme */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        // CHANGED: Gradient colors to slightly lighter maroons
        className="relative flex items-center justify-between w-full px-6 py-4 cursor-pointer group transition-all bg-gradient-to-b from-[#6E0A0A] to-[#4e0505] border-b border-[#EFBF04]/30 overflow-hidden"
        aria-expanded={isOpen}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />

        <span
          className={`${montserrat.className} font-bold text-[18px] text-white relative z-10 transition-colors`}
        >
          Tags
        </span>
        {/* Animated Icon Rotation */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <ChevronDown
            size={20}
            className="text-white/80 group-hover:text-white transition-colors"
          />
        </motion.div>
      </button>

      {/* Animated Content Container */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden bg-[#F9FAFB]"
      >
        <div className="px-5 pb-5 pt-3">
          {tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <span
                className={`${ptSans.className} text-gray-500 text-[16px] font-medium`}
              >
                No Tags Available
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-start content-start">
              <AnimatePresence mode="popLayout">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  if (mode === "filter") {
                    return (
                      <motion.button
                        layout
                        key={tag}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTagClick(tag)}
                        initial={false}
                        animate={{
                          // Gold background when selected, white text
                          backgroundColor: isSelected ? "#EFBF04" : "#E5E7EB",
                          color: isSelected ? "#ffffff" : "#1f2937",
                          boxShadow: isSelected
                            ? "0 4px 12px rgba(239, 191, 4, 0.4)"
                            : "none",
                        }}
                        transition={{ duration: 0.2 }}
                        className={`${ptSans.className} h-[34px] px-5 rounded-full text-[16px] font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink min-w-[10px]`}
                      >
                        #{tag}
                      </motion.button>
                    );
                  } else {
                    // EDIT MODE
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        key={tag}
                        className={`${ptSans.className} flex items-center bg-gray-200 text-gray-800 rounded-full px-4 py-1 text-[18px] font-medium`}
                      >
                        <span className="mr-2">#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-gray-600 hover:text-black cursor-pointer font-bold text-[20px]"
                        >
                          <X size={14} />
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
    </motion.div>
  );
}
