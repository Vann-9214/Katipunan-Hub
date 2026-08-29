"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { SendHorizontal, X } from "lucide-react";
import { CommentItemData } from "../hooks/useComments";

interface CommentInputProps {
  avatarUrl?: string;
  replyTo?: CommentItemData | null;
  onCancelReply?: () => void;
  onSubmit: (text: string) => Promise<void> | void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function CommentInput({
  avatarUrl = "/DefaultAvatar.svg",
  replyTo,
  onCancelReply,
  onSubmit,
  disabled = false,
  autoFocus = false,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [autoFocus]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Reply Banner */}
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#EFBF04]/10 border border-[#EFBF04]/30 rounded-lg text-xs">
          <span className="text-white/80 font-ptsans">
            Replying to{" "}
            <span className="font-bold text-[#EFBF04] font-montserrat">
              @{replyTo.author.fullName}
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
            title="Cancel reply"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 w-full"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20">
          <Image
            src={avatarUrl}
            alt="Your Avatar"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder={
              replyTo
                ? `Write a reply to @${replyTo.author.fullName}...`
                : "Write a comment..."
            }
            className="w-full bg-white/10 text-white placeholder-white/50 text-sm font-ptsans px-4 py-2.5 pr-10 rounded-full border border-white/15 focus:outline-none focus:border-[#EFBF04] transition-colors"
          />

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting || disabled}
            className={`absolute right-2 p-1.5 rounded-full transition-all cursor-pointer ${
              text.trim() && !isSubmitting && !disabled
                ? "bg-[#EFBF04] text-[#4e0505] hover:scale-105 shadow-sm"
                : "text-white/30 cursor-not-allowed"
            }`}
            title="Post comment"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
