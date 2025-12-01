"use client";
import Image from "next/image";
import ReactionButton from "../reactButton";
import ReactionSummary from "../../Posts/reactionSummary";
import { ReactionCount } from "../../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePostComment } from "./postCommentContext";

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
  reactionSummary: {
    topReactions: ReactionCount[];
    totalCount: number;
  };
  userReactionId: string | null;
};

export default function CommentItem({
  comment,
  replies = [],
  onReact,
  isReacting,
  isFeed = false,
}: {
  comment: CommentWithAuthor;
  replies?: CommentWithAuthor[];
  onReact: (commentId: string, reactionId: string | null) => void;
  isReacting: boolean;
  isFeed?: boolean;
}) {
  const { closePostModal, setReplyingTo } = usePostComment();

  const onMainClick = () => {
    const newReactionId = comment.userReactionId ? null : "like";
    onReact(comment.id, newReactionId);
  };

  const onPickerSelect = (reactionId: string) => {
    onReact(comment.id, reactionId);
  };

  const handleReplyClick = () => {
    setReplyingTo(comment);
  };

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

  // --- UPDATED: Fix to only bold the @Name ---
  const renderCommentContent = (text: string) => {
    // Split by @ followed by word characters (alphanumeric + underscore)
    // This stops at the first space, punctuation, etc.
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      // Check if this specific part is the mention
      if (part.startsWith("@")) {
        return (
          <span key={index} className="font-bold text-black">
            {part}
          </span>
        );
      }
      // Return the rest of the text normally
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col w-full">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex w-full gap-3"
      >
        <Link
          href={`/Profile/${comment.author.id}`}
          className="shrink-0"
          onClick={closePostModal}
        >
          <Image
            src={comment.author.avatarURL || "/DefaultAvatar.svg"}
            alt={comment.author.fullName || "User"}
            width={40}
            height={40}
            className="mt-1 h-10 w-10 rounded-full object-cover hover:brightness-90 transition-all"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="relative rounded-2xl bg-gray-200/50 px-4 py-2">
            <Link
              href={`/Profile/${comment.author.id}`}
              className="font-montserrat text-sm font-semibold text-black hover:text-[#8B0E0E] hover:underline transition-colors w-fit block"
              onClick={closePostModal}
            >
              {comment.author.fullName || "Anonymous User"}
            </Link>

            {/* Render the content with mixed bold/normal text */}
            <p className="font-montserrat text-sm text-black break-words whitespace-pre-wrap">
              {renderCommentContent(comment.comment)}
            </p>
          </div>

          <div className="flex items-center justify-between px-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700">
                {formatTimeAgo(comment.created_at)}
              </span>

              <button
                onClick={handleReplyClick}
                className="text-xs font-bold text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                Reply
              </button>

              <ReactionButton
                selectedReactionId={comment.userReactionId}
                isLoading={isReacting}
                onReactionSelect={onPickerSelect}
                onMainButtonClick={onMainClick}
                height={24}
                textSize={12}
                width="auto"
              />
            </div>

            <div className="flex items-center">
              <ReactionSummary
                topReactions={comment.reactionSummary?.topReactions || []}
                totalCount={comment.reactionSummary?.totalCount || 0}
                isLoading={isReacting}
                referenceId={comment.id}
                sourceType={isFeed ? "feed_comment" : "post_comment"}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* UPDATED: Nested Replies with Curved Thread Lines */}
      {replies.length > 0 && (
        <div className="ml-12 mt-2 flex flex-col">
          {replies.map((reply, index) => {
            // Determine if this is the last reply to handle the vertical line length
            const isLast = index === replies.length - 1;

            return (
              <div key={reply.id} className="relative pl-0 pb-2">
                {/* Visual Thread Lines */}
                <div className="absolute left-[-35px] top-0 h-full w-4">
                  {/* The Curve (L shape): Connects from top to the avatar */}
                  <div className="absolute left-0 top-0 h-6 w-4 rounded-bl-xl border-b-2 border-l-2 border-gray-300/50" />

                  {/* Vertical Extension: Continues line to next sibling if this isn't the last one */}
                  {!isLast && (
                    <div className="absolute left-0 top-6 bottom-0 w-[2px] bg-gray-300/50" />
                  )}
                </div>

                <CommentItem
                  comment={reply}
                  onReact={onReact}
                  isReacting={isReacting}
                  isFeed={isFeed}
                  replies={[]}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
