"use client";

// --- 1. Import the modal hook AND your new hook ---
import { usePostModal } from "./Comment/postModalContext";
import { useCommentCount } from "../../../../../../supabase/Lib/Announcement/Posts/useCommentCount";

import CommentButton from "./Comment/commentButton";
import ReactButton from "./reactButton";
import Image from "next/image";
import ImageAttachments from "../ImageAttachment/ImageAttachments";
import EditPostsButton from "../General/EditPostsButton";

import { usePostReactions } from "../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import ReactionSummary from "./reactionSummary";

// --- 3. Make sure 'export' is here ---
export interface PostsProps {
  postId: string;
  userId?: string;
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  type: "announcement" | "highlight"; // <-- Make sure this is here from our previous fix
}

// --- 2. UPDATED helper function ---
const formatCommentCount = (count: number) => {
  if (count === 0) {
    return null; // <-- FIX: Return nothing if 0
  }
  if (count === 1) {
    return "1 comment";
  }
  if (count < 1000) {
    return `${count} comments`;
  }
  // Format to 1k, 1.1k etc.
  return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k comments`;
};

export default function Posts(props: PostsProps) {
  const {
    postId,
    userId,
    title = "Title",
    description = "Description",
    date = "Date",
    images = [],
    onEdit,
    onDelete,
    canEdit = false,
  } = props; // Get all props

  const { openPostModal } = usePostModal();

  // --- 3. GET 'count' AND 'refreshCount' ---
  const { count: commentCount, refreshCount } = useCommentCount(postId);

  // --- 4. GET 'getReactionData' ---
  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
    getReactionData, // <-- This is the reaction refresh function
  } = usePostReactions({
    postId: postId,
    userId: userId || "",
  });

  // --- 5. CREATE A *COMBINED* REFRESH FUNCTION ---
  const handleModalClose = () => {
    getReactionData(); // Refreshes reactions
    refreshCount(); // Refreshes comment count
  };

  const handleCommentClick = () => {
    // --- 6. PASS THE *COMBINED* FUNCTION ---
    openPostModal(props, handleModalClose);
  };

  return (
    <div>
      <div className="w-[590px] bg-gold rounded-[15px] p-[5px]">
        <div className="w-[580px] bg-darkmaroon rounded-t-[10px] flex flex-col">
          {/* ... (Post header, title, description, images - UNCHANGED) ... */}
          <div className="flex items-start justify-between mt-[15px] mx-[15px]">
            <div className="flex">
              <div className="select-none">
                <Image
                  src="/Cit Logo.svg"
                  alt="Cit Logo"
                  width={55}
                  height={55}
                  draggable={false}
                />
              </div>
              <div className="flex flex-col ml-2 select-text">
                <h1 className="font-montserrat font-medium text-[20px] text-white leading-[30px]">
                  Cebu Institute of Technology - University
                </h1>
                <div className="flex items-center gap-1">
                  <p className="text-white font-ptsans text-[15px]">{date} ·</p>
                  <Image
                    src="/Global.svg"
                    alt="Global"
                    width={16}
                    height={16}
                    draggable={false}
                    className="invert brightness-0"
                  />
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="select-none">
                <EditPostsButton
                  onEdit={() => onEdit?.()}
                  onRemove={() => onDelete?.()}
                />
              </div>
            )}
          </div>
          <div className="font-montserrat font-semibold text-[20px] my-[10px] mx-[20px] text-white select-text">
            {title}
          </div>
          <div className="font-montserrat text-[16px] mt-[5px] mx-[20px] text-white select-text line-clamp-3 break-words mb-[5px]">
            {description}
          </div>
          <div className="select-none">
            <ImageAttachments images={images || []} />
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="px-5 py-1 flex items-center">
          <div className="mr-auto">
            <ReactionSummary
              topReactions={topReactions}
              totalCount={reactionCount}
              isLoading={isInitialLoading}
            />
          </div>

          {/* This div now renders the count */}
          <div
            className="cursor-pointer font-montserrat font-medium text-[20px] text-black hover:underline"
            onClick={handleCommentClick}
          >
            {formatCommentCount(commentCount)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          {userId ? (
            <ReactButton
              width={"full"}
              selectedReactionId={selectedReactionId}
              isLoading={isLoading}
              onReactionSelect={handleReactionSelect}
              onMainButtonClick={handleMainButtonClick}
            />
          ) : (
            <div className="cursor-not-allowed rounded-[10px] text-[22px] font-montserrat font-medium h-[35px] w-full flex gap-1 items-center justify-center px-4 text-gray-500">
              <Image src="/Like.svg" alt="Like" height={23} width={23} />
              Like
            </div>
          )}

          <div className="w-full" onClick={handleCommentClick}>
            <CommentButton />
          </div>
        </div>
      </div>
    </div>
  );
}
