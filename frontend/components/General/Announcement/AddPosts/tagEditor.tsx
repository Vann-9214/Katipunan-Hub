"use client";

import { Plus, ChevronDown, History, Tag } from "lucide-react";
import { useState } from "react";
import TagsFilter from "../LeftSide/TagsFilter";
import { motion, AnimatePresence } from "framer-motion";

interface TagEditorProps {
  width?: string;
  tags: string[];
  suggestedTags?: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export default function TagEditor({
  width = "w-full",
  tags,
  suggestedTags = [],
  onTagAdd,
  onTagRemove,
}: TagEditorProps) {
  const [tagInput, setTagInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  // --- 1. Transformation Logic ---
  const processTag = (input: string) => {
    return input
      .trim()
      .toLowerCase() // Lowercase
      .replace(/\s+/g, "_"); // Replace spaces with underscores
  };

  const handleAddTag = () => {
    const t = processTag(tagInput);
    if (!t) return;
    onTagAdd(t);
    setTagInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Filter out tags that are already selected
  const availableSuggestions = suggestedTags.filter((t) => !tags.includes(t));

  return (
    <div className={`flex flex-col gap-3 ${width}`}>
      {/* --- Input & Button Group --- */}
      <div className="relative group">
        <motion.div
          animate={{
            borderColor: isFocused ? "#EFBF04" : "#E5E7EB",
            boxShadow: isFocused ? "0 0 0 3px rgba(239, 191, 4, 0.1)" : "none",
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center w-full bg-white border border-gray-200 rounded-xl overflow-hidden transition-colors"
        >
          {/* Icon */}
          <div className="pl-4 text-gray-400">
            <Tag size={18} />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={tagInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag (e.g. event, news)..."
            className="flex-1 py-3 px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent font-ptsans"
          />

          {/* Add Button (Inside Input) */}
          <div className="pr-2">
            <motion.button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                ${
                  tagInput.trim()
                    ? "bg-gradient-to-br from-[#8B0E0E] to-[#600a0a] text-white shadow-md cursor-pointer"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
            >
              <Plus size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </motion.div>

        {/* Helper text showing transformation */}
        <AnimatePresence>
          {tagInput.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-5 left-2 text-[10px] text-gray-400 italic"
            >
              Adding as:{" "}
              <span className="font-bold text-[#8B0E0E]">
                #{processTag(tagInput)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer if helper text might overlap, though absolute positioning handles it visually, a small margin is good */}
      <div
        className={
          tagInput.trim() ? "mb-2" : "mb-0 transition-all duration-200"
        }
      />

      {/* --- Recently Used Toggle --- */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setShowRecent(!showRecent)}
          className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-[#8B0E0E] transition-colors uppercase tracking-wider w-fit group mb-2 select-none"
        >
          <History size={12} />
          <span>{showRecent ? "Hide Recent Tags" : "Show Recent Tags"}</span>
          <motion.div
            animate={{ rotate: showRecent ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} />
          </motion.div>
        </button>

        {/* Collapsible Suggestions */}
        <AnimatePresence>
          {showRecent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "anticipate" }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                {availableSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSuggestions.map((tag) => (
                      <motion.button
                        key={tag}
                        type="button"
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "#ffffff",
                          borderColor: "#EFBF04",
                          color: "#B48E00",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onTagAdd(tag)}
                        className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-bold transition-all font-montserrat cursor-pointer select-none"
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400 italic py-1">
                    No recently used tags found.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Selected Tags Display --- */}
      {tags.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1"
        >
          <TagsFilter
            width="w-full"
            mode="edit"
            tags={tags}
            onTagRemove={onTagRemove}
          />
        </motion.div>
      )}
    </div>
  );
}
