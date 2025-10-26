"use client";

import React, { useState, useRef } from "react";
import Button from "@/app/component/ReusableComponent/Buttons";

interface TagsDisplayProps {
  tags?: string[];
  mode?: "filter" | "edit"; // 🔥 two modes
  onTagClick?: (tags: string[]) => void;
  onTagRemove?: (tag: string) => void; // only used in edit mode
}

export default function TagsFilter({
  tags = [],
  mode = "filter",
  onTagClick,
  onTagRemove,
}: TagsDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    <div className="bg-maroon text-white rounded-2xl px-5 py-4 w-full flex flex-col items-start">
      <span className="font-semibold mb-2 font-montserrat text-[20px] text-white">
        Tags :
      </span>

      {tags.length === 0 ? (
        <span className="text-white/90 text-[20px] font-medium font-montserrat">
          No Tags Available
        </span>
      ) : (
        <div className="relative flex items-center w-full">
          <div
            ref={scrollRef}
            className="w-full max-h-[100px] overflow-y-auto overflow-x-hidden"
          >
            <div className="flex flex-wrap gap-x-3 gap-y-2 py-1 items-start content-start flex-shrink-0">
              {tags.map((tag, index) => {
                const isSelected = selectedTags.includes(tag);

                if (mode === "filter") {
                  // 🟡 FILTER MODE (click = toggle gold)
                  return (
                    <Button
                      key={index}
                      text={`#${tag}`}
                      onClick={() => handleTagClick(tag)}
                      bg={isSelected ? "bg-[#D4AF37]" : "bg-[#D9D9D9]"}
                      textcolor={isSelected ? "text-white" : "text-black"}
                      height="h-[40px]"
                      rounded="rounded-full"
                      className="px-5 py-1 shadow-none hover:scale-100 whitespace-nowrap flex-shrink min-w-[10px]"
                      textSize="text-[18px]"
                      font="font-medium"
                    />
                  );
                } else {
                  // 🗑️ EDIT MODE (x = remove tag)
                  return (
                    <div
                      key={index}
                      className="flex items-center bg-[#D9D9D9] text-black rounded-full px-4 py-1 text-[18px] font-medium font-montserrat"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-black hover:text-red-600 font-bold text-[20px]"
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
