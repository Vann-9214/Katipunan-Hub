"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CommentItemData } from "../hooks/useComments";
import ReactionButton from "./ReactionButton";
import ReactionSummary from "./ReactionSummary";
import formatPostDate from "../utils/formatDate";

interface CommentItemProps {
  comment: CommentItemData;
  onReply: (comment: CommentItemData) => void;
  onReact: (commentId: string, reactionId: string | null) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  reactingCommentId?: string | null;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  onReply,
  onReact,
  onDelete,
  currentUserId,
  reactingCommentId,
  isReply = false,
}: CommentItemProps) {
  const isAuthor = currentUserId === comment.author.id;
  const isReacting = reactingCommentId === comment.id;

  return (
    <div className={`flex items-start gap-2.5 group/item ${isReply ? "ml-8 mt-2" : "mt-3"}`}>
      {/* User Avatar */}
      <Link
        href={`/Profile/${comment.author.id}`}
        className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/20 hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Image
          src={comment.author.avatarURL || "/DefaultAvatar.svg"}
          alt={comment.author.fullName}
          fill
          className="object-cover"
        />
      </Link>

      {/* Comment Body */}
      <div className="flex-1 min-w-0">
        <div className="relative inline-block max-w-full bg-white/10 rounded-2xl px-3.5 py-2 text-white border border-white/10">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <Link
              href={`/Profile/${comment.author.id}`}
              className="font-montserrat font-bold text-xs text-[#EFBF04] hover:underline truncate cursor-pointer"
            >
              {comment.author.fullName}
            </Link>
            <span className="font-ptsans text-[10px] text-white/50 shrink-0">
              {formatPostDate(comment.created_at)}
            </span>
          </div>

          <p className="font-ptsans text-xs text-white/90 whitespace-pre-wrap break-words leading-relaxed">
            {comment.comment}
          </p>

          {/* Floating Reaction Count Badge if any */}
          {comment.reactionSummary.totalCount > 0 && (
            <div className="absolute -bottom-2 right-2 bg-[#2a0404] px-1.5 py-0.5 rounded-full border border-[#EFBF04]/30 shadow-md">
              <ReactionSummary
                topReactions={comment.reactionSummary.topReactions}
                totalCount={comment.reactionSummary.totalCount}
                theme="dark"
              />
            </div>
          )}
        </div>

        {/* Comment Actions (Like / Reply / Delete) */}
        <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] font-ptsans text-white/60">
          <div className="w-16">
            <ReactionButton
              size="sm"
              selectedReactionId={comment.userReactionId}
              isLoading={isReacting}
              onReactionSelect={(id) => onReact(comment.id, id)}
              onMainButtonClick={() =>
                onReact(comment.id, comment.userReactionId ? null : "like")
              }
            />
          </div>

          <button
            type="button"
            onClick={() => onReply(comment)}
            className="hover:text-white font-semibold cursor-pointer transition-colors"
          >
            Reply
          </button>

          {isAuthor && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
              title="Delete comment"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
