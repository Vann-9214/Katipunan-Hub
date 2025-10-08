"use client";

import Button from "../../ReusableComponent/Buttons";
import { Combobox } from "../../ReusableComponent/Combobox";
import TagsFilter from "./TagsFilter";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageButton } from "../../ReusableComponent/Buttons";

export default function AddPosts() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleTo, setVisibleTo] = useState<"global" | "course">("global");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // tags state + input controlled state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => setMounted(true), []);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  // add tag helper (prevents empty / duplicate)
  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput(""); // clear anyway
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  // remove tag (optional: used if you want to support removal from parent)
  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // example: include tags in submission payload
    // send { title, body, visibleTo, selectedCourse, tags, ... }
    alert(`Post submitted!\nTags: ${tags.join(", ")}`);
    setIsOpen(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[30px] w-[90%] max-w-[850px] h-[90%] max-h-[930px] p-8 overflow-y-auto">
        <h1 className="font-montserrat text-[40px] mb-4">New Announcement</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 font-montserrat"
        >
          {/* Title input */}
          <input
            type="text"
            placeholder="Enter highlight title…"
            className="border border-black placeholder-white/80 px-5 bg-maroon text-white rounded-[20px] h-[55px] w-full p-2 focus:outline-none focus:ring-1"
            required
          />

          {/* Auto-resizing textarea */}
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            placeholder="Enter detailed information to be shared with the community..."
            className="border border-black placeholder-white/80 px-5 bg-maroon text-white rounded-[20px] min-h-[100px] max-h-[210px] w-full p-2 focus:outline-none focus:ring-1 resize-none overflow-hidden"
            required
          />

          {/* Visible To */}
          <h2 className="text-[24px] font-montserrat">Visible To</h2>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Button
              text="Global"
              bg={visibleTo === "global" ? "bg-maroon" : "bg-gray-200"}
              textcolor={visibleTo === "global" ? "text-white" : "text-black"}
              height="h-[45px]"
              rounded="rounded-[30px]"
              onClick={() => setVisibleTo("global")}
              width="w-full"
              className="border border-black"
            />

            <Button
              text="Course"
              bg={visibleTo === "course" ? "bg-maroon" : "bg-gray-200"}
              textcolor={visibleTo === "course" ? "text-white" : "text-black"}
              height="h-[45px]"
              rounded="rounded-[30px]"
              onClick={() => setVisibleTo("course")}
              width="w-full"
              className="border border-black"
            />

            <Combobox
              items={[
                { value: "c1", label: "BSIT 1A" },
                { value: "c2", label: "BSIT 2B" },
              ]}
              placeholder="Select course"
              buttonHeight="h-[45px]"
              disabled={visibleTo !== "course"}
              width="w-full"
            />
          </div>

          {/* Tags input row */}
          <div className="flex flex-col">
            <h2 className="text-[24px] mb-2 font-montserrat text-black">
              Tags
            </h2>

            <div className="flex items-center gap-3">
              {/* tag input - enter adds tag */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // prevent form submit
                    addTag(tagInput);
                  }
                }}
                placeholder="Add tags..."
                aria-label="Add tag"
                className="flex-1 h-10 rounded-full border border-gray-300 px-4 text-[16px] placeholder-gray-400 focus:outline-none focus:ring-1"
              />

              {/* plus button */}
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                aria-label="Add tag"
                className="h-10 w-10 rounded-full border border-black inline-flex items-center justify-center bg-white text-[20px] font-semibold hover:scale-105 transition"
              >
                +
              </button>
            </div>

            {/* pass tags to TagsFilter (it will render them) */}
            <div className="mt-3">
              <TagsFilter
                mode="edit"
                tags={tags}
                onTagRemove={(tag) => removeTag(tag)}
              />

              {/* onTagClick will toggle selection inside TagsFilter; here we use it to remove tag when clicked — adjust as desired */}
            </div>
          </div>

          {/* Attachment */}
          <div>
            <span className="text-[18px] font-medium text-black">
              Attachment
            </span>
            <div className="bg-maroon text-white rounded-[20px] h-[100px] flex items-center justify-center text-[18px] font-light cursor-pointer">
              Drag & drop or click to upload an image.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              text="Cancel"
              textSize="text-[18px]"
              type="button"
              rounded="rounded-[20px]"
              width="w-[170px]"
              height="h-[45px]"
              onClick={() => setIsOpen(false)}
              className="border border-black"
            />

            <Button
              text="Publish"
              textSize="text-[18px]"
              type="submit"
              width="w-[170px]"
              rounded="rounded-[20px]"
              height="h-[45px]"
              className="border border-black"
            />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-5 ml-110">
        <ImageButton
          src="Plus Sign.svg"
          height={90}
          width={90}
          className="hover:scale-105 active:scale-95 transition-transform"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
