"use client";
import { useState } from "react";
import Image from "next/image";

// --- 1. Add '?' to make props optional ---
type CommentInputProps = {
  onSubmit?: (commentText: string) => Promise<void>;
  avatarUrl?: string;
  disabled?: boolean;
};

export default function CommentInput({
  onSubmit,
  // --- 2. Provide default values ---
  avatarUrl = "/DefaultAvatar.svg", // Default avatar if none provided
  disabled = false, // Default to false
}: CommentInputProps) {
  const [commentText, setCommentText] = useState("");

  // This 'realDisabled' check is the key:
  // The input should be disabled if 'disabled' is true OR if no 'onSubmit' function was given.
  const realDisabled = disabled || !onSubmit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSubmit = commentText.trim();
    if (!textToSubmit) return;

    // --- 3. Only call onSubmit if it exists ---
    if (onSubmit) {
      await onSubmit(textToSubmit);
      setCommentText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
      <Image
        src={avatarUrl}
        alt="Your Avatar"
        width={50}
        height={50}
        className="rounded-full"
      />
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={
            realDisabled ? "Log in to comment" : "Write a comment..."
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={realDisabled} // Use our new 'realDisabled' variable
          className="w-full rounded-full font-montserrat bg-gray-200/50 py-2 pl-5 pr-12 text-[16px] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-200"
        />
        <button
          type="submit"
          disabled={realDisabled || !commentText.trim()} // Also use 'realDisabled' here
          className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          {/* Send icon */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
