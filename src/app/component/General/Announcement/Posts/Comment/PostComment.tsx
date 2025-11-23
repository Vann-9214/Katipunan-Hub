"use client";

import { usePostComment } from "./postCommentContext";
import CommentSection from "./commentSection";
import CommentInput from "./commentInput";
import ReactionButton from "../reactButton";
import CommentButton from "./commentButton";
import ReactionSummary from "../reactionSummary";
import { usePostReactions } from "../../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import { useComments } from "../../../../../../../supabase/Lib/Announcement/Posts/useComment";
import { useRef, useEffect } from "react"; // ADDED useRef and useEffect

import Posts from "../Posts";

const formatCommentCount = (count: number) => {
  if (count === 1) {
    return "1 comment";
  }
  if (count < 1000) {
    return `${count} comments`;
  }
  return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k comments`;
};

export default function PostComment() {
  const { spotlightPost, closePostModal } = usePostComment();

  const {
    comments,
    isLoading: isCommentsLoading,
    currentUser,
    postComment,
    handleCommentReaction,
    reactingCommentId,
    commentCount,
  } = useComments(spotlightPost?.postId || "");

  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading: isReactionsLoading,
    isInitialLoading: isReactionsInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  } = usePostReactions({
    postId: spotlightPost?.postId || "",
    userId: spotlightPost?.userId || "",
  });

  // 1. Create a ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Scroll to the bottom whenever a new comment is added (with animation)
  useEffect(() => {
    if (scrollRef.current) {
      // Use scrollTo with smooth behavior
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [comments.length]); // Trigger when the number of comments changes

  if (!spotlightPost) {
    return null;
  }

  const { type } = spotlightPost;
  const modalTitle = type === "highlight" ? "Highlight" : "Announcement";

  return (
    <>
      {/* --- Backdrop --- */}
      <div
        onClick={closePostModal}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex flex-col w-full max-w-[615px] h-full max-h-[960px] overflow-hidden rounded-[15px] bg-gold p-[5px]">
          <div className="flex-shrink-0 flex items-center mb-[5px] justify-center relative bg-darkmaroon p-2 rounded-[10px]">
            <span className="text-white font-montserrat text-[22px] font-semibold text-center w-full">
              {modalTitle}
            </span>
            <button
              onClick={closePostModal}
              className="cursor-pointer p-1 rounded-full text-white hover:bg-white/20 absolute right-2"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* 3. Attach the ref to the scrollable content area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <Posts {...spotlightPost} mode="modal" />

            <div className="bg-gold">
              <div className="px-5 py-1 flex items-center justify-between">
                <div>
                  <ReactionSummary
                    topReactions={topReactions}
                    totalCount={reactionCount}
                    isLoading={isReactionsInitialLoading}
                  />
                </div>
                <div>
                  {!isCommentsLoading && commentCount > 0 && (
                    <span className="font-montserrat font-medium text-[20px] text-black">
                      {formatCommentCount(commentCount)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <ReactionButton
                  selectedReactionId={selectedReactionId}
                  isLoading={isReactionsLoading}
                  onReactionSelect={handleReactionSelect}
                  onMainButtonClick={handleMainButtonClick}
                />
                <div className="w-full" onClick={closePostModal}>
                  <CommentButton />
                </div>
              </div>

              <CommentSection
                comments={comments}
                isLoading={isCommentsLoading}
                onReact={handleCommentReaction}
                reactingCommentId={reactingCommentId}
              />
            </div>
          </div>

          <div className="flex-shrink-0 bg-gold p-4 border-t border-gray-400/50">
            <CommentInput
              onSubmit={postComment}
              avatarUrl={currentUser?.avatarURL || "/DefaultAvatar.svg"}
              disabled={!currentUser}
            />
          </div>
        </div>
      </div>
    </>
  );
}
