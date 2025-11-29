"use client";
import Image from "next/image";
import ReactionButton from "../reactButton";
import ReactionSummary from "../../Posts/reactionSummary";
import { ReactionCount } from "../../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import { motion } from "framer-motion";

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
  onReact,
  isReacting,
  isFeed = false, // Added prop
}: {
  comment: CommentWithAuthor;
  onReact: (commentId: string, reactionId: string | null) => void;
  isReacting: boolean;
  isFeed?: boolean;
}) {
  const onMainClick = () => {
    const newReactionId = comment.userReactionId ? null : "like";
    onReact(comment.id, newReactionId);
  };

  const onPickerSelect = (reactionId: string) => {
    onReact(comment.id, reactionId);
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex w-full gap-3"
    >
      <Image
        src={comment.author.avatarURL || "/DefaultAvatar.svg"}
        alt={comment.author.fullName || "User"}
        width={40}
        height={40}
        className="mt-1 h-10 w-10 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="relative rounded-2xl bg-gray-200/50 px-4 py-2">
          <p className="font-montserrat text-sm font-semibold text-black">
            {comment.author.fullName || "Anonymous User"}
          </p>
          <p className="font-montserrat text-sm text-black break-words whitespace-pre-wrap">
            {comment.comment}
          </p>
        </div>

        <div className="flex items-center justify-between px-3 pt-1">
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
          </div>

          <div className="flex items-center">
            <ReactionSummary
              topReactions={comment.reactionSummary?.topReactions || []}
              totalCount={comment.reactionSummary?.totalCount || 0}
              isLoading={isReacting}
              // --- NEW PROPS FOR HOVER ---
              referenceId={comment.id}
              sourceType={isFeed ? "feed_comment" : "post_comment"}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
