"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import TagsFilter from "../LeftSide/TagsFilter";
import { motion } from "framer-motion";

interface TagEditorProps {
  width?: string;
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export default function TagEditor({
  width,
  tags,
  onTagAdd,
  onTagRemove,
}: TagEditorProps) {
  const [tagInput, setTagInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    onTagAdd(t);
    setTagInput("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex mb-1 gap-4 items-end">
        <h2 className="block text-[20px] font-medium text-black font-montserrat mb-1">
          Tags (Optional)
        </h2>

        <div className="flex items-center gap-3">
          {/* Animated Input Container */}
          <motion.div
            animate={{
              scale: isFocused ? 1.02 : 1,
              boxShadow: isFocused
                ? "0px 4px 12px rgba(0,0,0,0.05)"
                : "0px 0px 0px rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <input
              type="text"
              value={tagInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tags..."
              className="w-[300px] h-[45px] rounded-xl border border-gray-300 bg-white px-4 text-[16px] placeholder-gray-400 focus:outline-none focus:border-black/50 transition-colors"
            />
          </motion.div>

          {/* Animated Add Button */}
          <motion.button
            type="button"
            onClick={handleAddTag}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="h-11 w-11 rounded-full border-2 border-black flex items-center justify-center bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>

      {/* Tags Display (Animations are handled inside TagsFilter) */}
      <div className="mt-3">
        <TagsFilter
          width={width}
          mode="edit"
          tags={tags}
          onTagRemove={onTagRemove}
        />
      </div>
    </div>
  );
}
