"use client";

import React, { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { CommentItemData } from "../hooks/useComments";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  comments: CommentItemData[];
  isLoading?: boolean;
  onReply: (comment: CommentItemData) => void;
  onReact: (commentId: string, reactionId: string | null) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  reactingCommentId?: string | null;
}

export default function CommentSection({
  comments,
  isLoading = false,
  onReply,
  onReact,
  onDelete,
  currentUserId,
  reactingCommentId,
}: CommentSectionProps) {
  // Organize root comments and nested replies
  const { rootComments, repliesByParent } = useMemo(() => {
    const roots: CommentItemData[] = [];
    const replies: Record<string, CommentItemData[]> = {};

    comments.forEach((c) => {
      if (!c.parent_comment_id) {
        roots.push(c);
      } else {
        if (!replies[c.parent_comment_id]) {
          replies[c.parent_comment_id] = [];
        }
        replies[c.parent_comment_id].push(c);
      }
    });

    return { rootComments: roots, repliesByParent: replies };
  }, [comments]);

  if (isLoading && comments.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/50">
        <div className="w-5 h-5 border-2 border-[#EFBF04] border-t-transparent rounded-full animate-spin" />
        <span className="font-ptsans text-xs">Loading comments...</span>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/50 text-center">
        <MessageSquare size={24} className="opacity-40 text-[#EFBF04]" />
        <p className="font-montserrat font-semibold text-xs text-white/70">
          No comments yet
        </p>
        <p className="font-ptsans text-[11px] text-white/40">
          Be the first to share your thoughts on this announcement!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {rootComments.map((root, rootIdx) => (
        <div key={root.id || `root-${rootIdx}`} className="space-y-1">
          <CommentItem
            comment={root}
            onReply={onReply}
            onReact={onReact}
            onDelete={onDelete}
            currentUserId={currentUserId}
            reactingCommentId={reactingCommentId}
          />

          {/* Nested Replies */}
          {repliesByParent[root.id]?.map((reply, replyIdx) => (
            <CommentItem
              key={reply.id || `reply-${root.id}-${replyIdx}`}
              comment={reply}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
              currentUserId={currentUserId}
              reactingCommentId={reactingCommentId}
              isReply
            />
          ))}
        </div>
      ))}
    </div>
  );
}
