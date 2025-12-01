"use client";
import { useState, RefObject, useEffect } from "react";
import Image from "next/image";
/* -------------------------------------------------------------------------- */
/* UPDATED: Import Context                                                    */
/* -------------------------------------------------------------------------- */
import { usePostComment } from "./postCommentContext";
// 1. Import the correct type
import { CommentWithAuthor } from "./commentItem";

type CommentInputProps = {
  /* -------------------------------------------------------------------------- */
  /* UPDATED: Type Definition for Submit                                        */
  /* -------------------------------------------------------------------------- */
  // 2. Replace 'any' with 'CommentWithAuthor'
  onSubmit?: (
    commentText: string,
    replyTo: CommentWithAuthor | null
  ) => Promise<void>;
  avatarUrl?: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export default function CommentInput({
  onSubmit,
  avatarUrl = "/DefaultAvatar.svg",
  disabled = false,
  inputRef,
}: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  /* -------------------------------------------------------------------------- */
  /* UPDATED: Use Reply State                                                   */
  /* -------------------------------------------------------------------------- */
  const { replyingTo, setReplyingTo } = usePostComment();

  const realDisabled = disabled || !onSubmit;

  /* -------------------------------------------------------------------------- */
  /* UPDATED: Effect for Auto-tagging                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (replyingTo) {
      setCommentText(`@${replyingTo.author.fullName?.split(" ")[0]} `);
      inputRef?.current?.focus();
    }
  }, [replyingTo, inputRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSubmit = commentText.trim();
    if (!textToSubmit) return;

    if (onSubmit) {
      /* -------------------------------------------------------------------------- */
      /* UPDATED: Pass Reply Object                                                 */
      /* -------------------------------------------------------------------------- */
      await onSubmit(textToSubmit, replyingTo);
      setCommentText("");
      setReplyingTo(null); // Reset reply state after successful send
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* -------------------------------------------------------------------------- */
      /* UPDATED: Replying Indicator UI                                             */
      /* -------------------------------------------------------------------------- */}
      {replyingTo && (
        <div className="flex items-center justify-between ml-14 text-xs text-gray-500">
          <span>
            Replying to{" "}
            <span className="font-bold">{replyingTo.author.fullName}</span>
          </span>
          <button
            onClick={() => {
              setReplyingTo(null);
              setCommentText("");
            }}
            className="text-red-500 hover:underline"
            type="button"
          >
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
        <Image
          src={avatarUrl}
          alt="Your Avatar"
          width={50}
          height={50}
          className="rounded-full h-[50px] w-[50px] object-cover"
        />
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              realDisabled ? "Log in to comment" : "Write a comment..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={realDisabled}
            className="w-full rounded-full font-montserrat bg-gray-200/50 py-2 pl-5 pr-12 text-[16px] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-200"
          />
          <button
            type="submit"
            disabled={realDisabled || !commentText.trim()}
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
    </div>
  );
}
