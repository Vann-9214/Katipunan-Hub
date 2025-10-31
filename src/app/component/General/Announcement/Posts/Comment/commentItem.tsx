"use client"; // This MUST be a client component
import Image from "next/image";
// --- 1. REMOVED `useState` since it's no longer needed ---
// import { useState } from "react";
// --- 2. REMOVED `CommentInput` import ---
// import CommentInput from "./commentInput";
import ReactionButton from "../reactButton";
import ReactionSummary from "../../Posts/reactionSummary";
import { ReactionCount } from "../../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";

type Author = {
  id: string;
  fullName: string | null;
  avatarURL: string | null;
};

export type CommentWithAuthor = {
  id: string;
  created_at: string;
  comment: string;
  parent_comment_id: string | null;
  author: Author;
  // --- 3. REMOVED `replies` from the type ---
  // replies: CommentWithAuthor[];
  reactionSummary: {
    topReactions: ReactionCount[];
    totalCount: number;
  };
  userReactionId: string | null;
};

export default function CommentItem({
  comment,
  onReact,
  isReacting,
}: {
  comment: CommentWithAuthor;
  onReact: (commentId: string, reactionId: string | null) => void;
  isReacting: boolean;
}) {
  // --- 4. REMOVED `useState` hooks for replies ---
  // const [showReplies, setShowReplies] = useState(false);
  // const [showReplyInput, setShowReplyInput] = useState(false);

  // --- Handlers for reactions (Unchanged) ---
  const onMainClick = () => {
    const newReactionId = comment.userReactionId ? null : "like";
    onReact(comment.id, newReactionId);
  };

  const onPickerSelect = (reactionId: string) => {
    onReact(comment.id, reactionId);
  };

  // --- formatTimeAgo function (Unchanged) ---
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${weeks}w`;
  };

  return (
    <div className="flex w-full gap-3">
      {/* Avatar (Unchanged) */}
      <Image
        src={comment.author.avatarURL || "/DefaultAvatar.svg"}
        alt={comment.author.fullName || "User"}
        width={40}
        height={40}
        className="mt-1 h-10 w-10 rounded-full"
      />
      {/* Comment Body (Unchanged) */}
      <div className="flex-1">
        <div className="relative rounded-2xl bg-gray-200/50 px-4 py-2">
          <p className="font-montserrat text-sm font-semibold text-black">
            {comment.author.fullName || "Anonymous User"}
          </p>
          <p className="font-montserrat text-sm text-black">
            {comment.comment}
          </p>
        </div>
        {/* --- 5. MODIFIED JSX (REPLY BUTTON REMOVED) --- */}
        <div className="flex items-center justify-between px-3 pt-1">
          {/* Left-aligned group */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-700">
              {formatTimeAgo(comment.created_at)}
            </span>

            <ReactionButton
              selectedReactionId={comment.userReactionId}
              isLoading={isReacting}
              onReactionSelect={onPickerSelect}
              onMainButtonClick={onMainClick}
              height={24}
              textSize={12}
              width="auto"
            />
            {/* --- "Reply" button REMOVED --- */}
          </div>

          {/* Right-aligned group (Unchanged) */}
          <div className="flex items-center">
            <ReactionSummary
              topReactions={comment.reactionSummary?.topReactions || []}
              totalCount={comment.reactionSummary?.totalCount || 0}
              isLoading={isReacting}
            />
          </div>
        </div>
        {/* --- 6. ALL REPLY-RELATED JSX REMOVED --- */}
        {/* Reply Input Box (REMOVED) */}
        {/* View Replies Button (REMOVED) */}
        {/* Nested Replies (REMOVED) */}
      </div>
    </div>
  );
}
