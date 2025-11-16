"use client";
import CommentItem from "./commentItem";
import type { CommentWithAuthor } from "./commentItem";

interface CommentSectionProps {
  comments: CommentWithAuthor[];
  isLoading: boolean;
  onReact: (commentId: string, reactionId: string | null) => void; // <-- ADD THIS
  reactingCommentId: string | null;
}

export default function CommentSection({
  comments,
  isLoading,
  onReact,
  reactingCommentId,
}: CommentSectionProps) {
  return (
    <div className="w-full rounded-b-xl bg-gold p-4 font-montserrat">
      {/* Comments List */}
      <div className="flex flex-col gap-5">
        {isLoading && <p className="text-center">Loading comments...</p>}
        {!isLoading && comments.length === 0 && (
          <p className="text-center font-montserrat text-sm text-gray-700">
            No comments yet. Be the first!
          </p>
        )}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReact={onReact}
            isReacting={reactingCommentId === comment.id}
          />
        ))}
      </div>
    </div>
  );
}
