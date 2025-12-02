"use client";
import CommentItem from "./commentItem";
import type { CommentWithAuthor } from "./commentItem";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

interface CommentSectionProps {
  comments: CommentWithAuthor[];
  isLoading: boolean;
  onReact: (commentId: string, reactionId: string | null) => void;
  reactingCommentId: string | null;
  isFeed?: boolean;
}

export default function CommentSection({
  comments,
  isLoading,
  onReact,
  reactingCommentId,
  isFeed = false,
}: CommentSectionProps) {
  /* -------------------------------------------------------------------------- */
  /* UPDATED: Group Comments by Parent                   */
  /* -------------------------------------------------------------------------- */
  const { rootComments, repliesByParent } = useMemo(() => {
    const roots: CommentWithAuthor[] = [];
    const byParent: Record<string, CommentWithAuthor[]> = {};

    comments.forEach((c) => {
      if (!c.parent_comment_id) {
        roots.push(c);
      } else {
        if (!byParent[c.parent_comment_id]) {
          byParent[c.parent_comment_id] = [];
        }
        byParent[c.parent_comment_id].push(c);
      }
    });
    return { rootComments: roots, repliesByParent: byParent };
  }, [comments]);

  return (
    <div className="w-full rounded-b-xl bg-gold p-4 font-montserrat">
      <div className="flex flex-col gap-5">
        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-gray-700"
          >
            Loading comments...
          </motion.p>
        )}

        {!isLoading && comments.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center font-montserrat text-sm text-gray-700"
          >
            No comments yet. Be the first!
          </motion.p>
        )}

        <AnimatePresence initial={false} mode="popLayout">
          {/* -------------------------------------------------------------------------- */
          /* UPDATED: Render Root Comments Only                   */
          /* -------------------------------------------------------------------------- */}
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              // Pass the replies associated with this root comment
              replies={repliesByParent[comment.id] || []}
              onReact={onReact}
              isReacting={reactingCommentId === comment.id}
              isFeed={isFeed}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
