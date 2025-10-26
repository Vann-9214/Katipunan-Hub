// components/AddPosts/TagEditor.tsx
"use client";

import { useState } from "react";
import TagsFilter from "../General/TagsFilter";

interface TagEditorProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export default function TagEditor({
  tags,
  onTagAdd,
  onTagRemove,
}: TagEditorProps) {
  // This component now manages its own input state
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    onTagAdd(t); // Call parent function
    setTagInput(""); // Clear local state
  };

  return (
    <div className="flex flex-col">
      <div className="flex mb-2 gap-4">
        <h2 className="text-[24px] font-montserrat text-black">Tags</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add tags..."
            className="w-[300px] h-10 rounded-full border border-gray-300 px-4 text-[16px] placeholder-gray-400 focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="h-10 w-10 rounded-full border border-black inline-flex items-center justify-center bg-white text-[20px] font-semibold hover:scale-105 transition"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-3">
        <TagsFilter mode="edit" tags={tags} onTagRemove={onTagRemove} />
      </div>
    </div>
  );
}
