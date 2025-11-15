// components/AddPosts/TagEditor.tsx
"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import TagsFilter from "../LeftSide/TagsFilter";

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
      <div className="flex mb-2 gap-4 items-end">
        {/* I also added 'mb-2' (margin-bottom) to your H2
          to create space between the title and the input bar.
        */}
        <h2 className="block text-[20px] font-medium text-black font-montserrat">
          Tags (Optional)
        </h2>

        {/* This div for the input/button stays the same */}
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
            className="w-[300px] h-[35px] rounded-full border border-gray-300 px-4 text-[16px] placeholder-gray-400 focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="h-10 w-10 rounded-full border border-black inline-flex items-center justify-center bg-white text-[20px] font-semibold cursor-pointer"
          >
            <Plus size={20} className="text-black" />
          </button>
        </div>
      </div>

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
