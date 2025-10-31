"use client";

// --- Make sure all these import paths are correct! ---
import { usePostModal } from "./postModalContext"; // The modal context hook
import CommentSection from "./commentSection";
import CommentInput from "./commentInput";
import Image from "next/image";
import ReactionButton from "../reactButton";
import CommentButton from "./commentButton";
import ReactionSummary from "../reactionSummary";
import ImageAttachments from "../../ImageAttachment/ImageAttachments";
import { usePostReactions } from "../../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import { useComments } from "../../../../../../../supabase/Lib/Announcement/Posts/useComment";

// --- 1. ADD THE HELPER FUNCTION ---
const formatCommentCount = (count: number) => {
  if (count === 1) {
    return "1 comment";
  }
  if (count < 1000) {
    return `${count} comments`;
  }
  return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k comments`;
};

export default function PostModal() {
  const { spotlightPost, closePostModal } = usePostModal();

  // --- 2. DESTRUCTURE THE NEW 'commentCount' PROP ---
  const {
    comments,
    isLoading: isCommentsLoading,
    currentUser,
    postComment,
    handleCommentReaction,
    reactingCommentId,
    commentCount, // <-- GET THE COUNT
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

  if (!spotlightPost) {
    return null; // Render nothing if no post is selected
  }

  // Destructure for easier use (assuming you've passed 'type' from Posts.tsx)
  const { title, description, date, images, type } = spotlightPost;

  // --- THIS IS THE FIX ---
  // We explicitly define the title based on the 'type' prop
  const modalTitle = type === "highlight" ? "Highlight" : "Announcement";
  // --- END FIX ---

  return (
    <>
      {/* --- Backdrop --- */}
      <div
        onClick={closePostModal}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* --- Modal Container --- */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* --- Modal Content --- */}
        <div className="relative flex flex-col w-full max-w-[590px] h-full max-h-[960px] overflow-hidden rounded-[15px] bg-gold p-[5px]">
          {/* 1. The Custom Title Bar (UPDATED) */}
          <div className="flex-shrink-0 flex items-center mb-[5px] justify-center relative bg-darkmaroon p-2 rounded-[10px]">
            <span className="text-white font-montserrat text-[22px] font-semibold text-center w-full">
              {/* Use the new 'modalTitle' variable here */}
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

          {/* 2. The SCROLLABLE Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* --- Post Content --- */}
            <div className="w-full bg-darkmaroon flex flex-col">
              {/* (Post header, title, description, images... all unchanged) */}
              <div className="flex items-start justify-between mt-[15px] mx-[15px]">
                <div className="flex">
                  <Image
                    src="/Cit Logo.svg"
                    alt="Cit Logo"
                    width={55}
                    height={55}
                  />
                  <div className="flex flex-col ml-2 select-text">
                    <h1 className="font-montserrat font-medium text-[20px] text-white">
                      Cebu Institute of Technology - University
                    </h1>
                    <div className="flex items-center gap-1">
                      <p className="text-white font-ptsans text-[15px]">
                        {date} ·
                      </p>
                      <Image
                        src="/Global.svg"
                        alt="Global"
                        width={16}
                        height={16}
                        className="invert brightness-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="font-montserrat font-semibold text-[20px] my-[10px] mx-[20px] text-white">
                {title}
              </div>
              <div className="font-montserrat text-[16px] mt-[5px] mx-[20px] text-white break-words mb-[5px]">
                {description}
              </div>
              <div className="select-none">
                <ImageAttachments images={images || []} />
              </div>
            </div>

            {/* --- Buttons and Comment List (all scrollable) --- */}
            <div className="bg-gold">
              {/* --- 3. ADD THE COMMENT COUNT HERE (THIS IS THE FIX) --- */}
              <div className="px-5 py-1 flex items-center justify-between">
                {/* Left Slot: This div always exists */}
                <div>
                  <ReactionSummary
                    topReactions={topReactions}
                    totalCount={reactionCount}
                    isLoading={isReactionsInitialLoading}
                  />
                </div>

                {/* Right Slot: This div always exists */}
                <div>
                  {/* Show count if it's not loading and greater than 0 */}
                  {!isCommentsLoading && commentCount > 0 && (
                    <span className="font-montserrat font-medium text-[20px] text-black">
                      {formatCommentCount(commentCount)}
                    </span>
                  )}
                </div>
              </div>
              {/* --- END FIX --- */}

              <div className="flex justify-between items-center">
                <ReactionButton
                  selectedReactionId={selectedReactionId}
                  isLoading={isReactionsLoading}
                  onReactionSelect={handleReactionSelect}
                  onMainButtonClick={handleMainButtonClick}
                />

                {/* --- 4. WRAP BUTTON AND ADD ONCLICK --- */}
                <div className="w-full" onClick={closePostModal}>
                  <CommentButton />
                </div>
              </div>

              {/* --- The "Dumb" Comment List --- */}
              <CommentSection
                comments={comments}
                isLoading={isCommentsLoading}
                onReact={handleCommentReaction}
                reactingCommentId={reactingCommentId}
              />
            </div>
          </div>

          {/* 4. The STICKY Comment Input */}
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
