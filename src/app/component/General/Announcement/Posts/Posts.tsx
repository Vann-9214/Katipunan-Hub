// Posts.tsx
"use client";

import CommentButton from "./commentButton";
import ReactButton from "./reactButton";
import Image from "next/image";
import ImageAttachments from "../ImageAttachment/ImageAttachments";
import { TextButton } from "../../../ReusableComponent/Buttons";
import EditPostsButton from "../General/EditPostsButton";

// --- 1. Import the new hook and component ---
import { usePostReactions } from "../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import ReactionSummary from "./reactionSummary";
// (We no longer need formatCompactNumber here)

interface PostsProps {
  postId: string;
  userId?: string;
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export default function Posts({
  postId,
  userId,
  title = "Title",
  description = "Description",
  date = "Date",
  images = [],
  onEdit,
  onDelete,
  canEdit = false,
}: PostsProps) {
  // --- 2. Use the combined hook ---
  const {
    selectedReactionId,
    reactionCount,
    topReactions, // <-- Get the new data
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  } = usePostReactions({
    postId: postId,
    userId: userId || "",
  });

  return (
    <div>
      {/* ... (Omitted for brevity: Outer container, inner container, header...) ... */}
      <div className="w-[590px] bg-gold rounded-[15px] p-[5px]">
        <div className="w-[580px] bg-darkmaroon rounded-t-[10px] flex flex-col">
          {/* ... (Post header, title, description, images - UNCHANGED) ... */}
          {/* ... */}
          <div className="flex items-start justify-between mt-[15px] mx-[20px]">
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
            <ImageAttachments images={images} />
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between px-5 items-center">
          {/* --- 3. Use the new ReactionSummary component --- */}
          <ReactionSummary
            topReactions={topReactions}
            totalCount={reactionCount}
            isLoading={isInitialLoading}
          />

          <TextButton
            text="Comment"
            textSize="text-[22px]"
            fontSize="font-medium"
          />
        </div>
        <div className="flex justify-between items-center">
          {/* --- (This section is unchanged) --- */}
          {userId ? (
            <ReactButton
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
          <CommentButton />
        </div>
      </div>
    </div>
  );
}
