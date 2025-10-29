"use client";

import React, { useState, useRef } from "react";
// import Button from "@/app/component/ReusableComponent/Buttons"; // 1. Removed broken import
import { ChevronDown, ChevronUp } from "lucide-react";

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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 border-b border-gray-200 cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="font-semibold font-montserrat text-[20px] text-gray-900">
          Tags
        </span>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      <div
        className={`px-5 pt-2 pb-3 transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[250px] overflow-y-auto"
            : "max-h-[105px] overflow-hidden"
        }`}
      >
        {tags.length === 0 ? (
          <span className="text-gray-500 text-[16px] font-medium font-montserrat">
            No Tags Available
          </span>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-2 items-start content-start">
            {tags.map((tag, index) => {
              const isSelected = selectedTags.includes(tag);

              if (mode === "filter") {
                // 2. Replaced custom <Button> with a standard <button> to fix import error
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`
                      ${
                        isSelected
                          ? "bg-[#D4AF37] text-white"
                          : "bg-gray-200 text-gray-800"
                      }
                      h-[25px]
                      rounded-[20px]
                      px-5                   
                      shadow-none
                      hover:scale-100
                      whitespace-nowrap
                      flex-shrink
                      min-w-[10px]
                      text-[16px]
                      font-medium
                      font-montserrat
                      transition-colors
                      cursor-pointer
                    `}
                  >
                    {`#${tag}`}
                  </button>
                );
              } else {
                // 🗑️ EDIT MODE (x = remove tag)
                return (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 text-gray-800 rounded-full px-4 py-1 text-[18px] font-medium font-montserrat"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-gray-600 hover:text-red-600 font-bold text-[20px]"
                    >
                      ×
                    </button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
