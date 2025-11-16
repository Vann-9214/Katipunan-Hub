"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePostComment } from "./Comment/postCommentContext";
import { useCommentCount } from "../../../../../../supabase/Lib/Announcement/Posts/useCommentCount";
import CommentButton from "./Comment/commentButton";
import ReactButton from "./reactButton";
import Image from "next/image";
import ImageAttachments from "../ImageAttachment/ImageAttachments";
import EditPostsButton from "../LeftSide/EditPostsButton";
import { usePostReactions } from "../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import ReactionSummary from "./reactionSummary";
import { collegeitems } from "../Utils/constants";

// Component Interface
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
  type: "announcement" | "highlight";
  mode?: "card" | "modal";
  visibility?: string | null;
}

// Helper
const formatCommentCount = (count: number) => {
  if (count === 0) {
    return null;
  }
  if (count === 1) {
    return "1 comment";
  }
  if (count < 1000) {
    return `${count} comments`;
  }
  return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k comments`;
};

// Component
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
    mode = "card",
    visibility,
  } = props;

  // Hooks
  const { openPostModal } = usePostComment();
  const { count: commentCount, refreshCount } = useCommentCount(postId);
  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
    getReactionData,
  } = usePostReactions({
    postId: postId,
    userId: userId || "",
  });

  // Description Expansion Logic
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeMoreVisible, setIsSeeMoreVisible] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = descriptionRef.current;
    if (element && mode === "card") {
      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsSeeMoreVisible(hasOverflow);
    }
  }, [description, mode]);

  // Handlers
  const handleModalClose = () => {
    getReactionData();
    refreshCount();
  };

  const handleCommentClick = () => {
    openPostModal(props, handleModalClose);
  };

  // Icon Logic
  const college = visibility
    ? collegeitems.find((c) => c.value === visibility)
    : null;
  const IconComponent = college?.icon;

  // Render
  return (
    <div>
      <div className="w-[590px] bg-gold rounded-[15px] p-[5px]">
        <div className="w-[580px] bg-darkmaroon rounded-t-[10px] flex flex-col overflow-hidden">
          {/* Post Header */}
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
                  {/* Dynamic Icon Logic */}
                  {IconComponent ? (
                    <IconComponent className="w-4 h-4 text-white" />
                  ) : (
                    <Image
                      src="/Global.svg"
                      alt="Global"
                      width={16}
                      height={16}
                      draggable={false}
                      className="invert brightness-0"
                    />
                  )}
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

          {/* Post Title */}
          <div className="font-montserrat font-semibold text-[20px] my-[10px] mx-[20px] text-white select-text">
            {title}
          </div>

          {/* Post Description */}
          <div
            ref={descriptionRef}
            className={`font-montserrat text-[16px] mt-[5px] mx-[20px] text-white select-text break-words mb-[5px] ${
              mode === "card" && !isExpanded ? "line-clamp-3" : ""
            }`}
          >
            {description}
          </div>

          {/* See More Button */}
          {mode === "card" && isSeeMoreVisible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-montserrat text-[16px] text-white/70 hover:text-white font-medium ml-[20px] mb-[5px] cursor-pointer self-start"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}

          {/* Post Attachments */}
          <div className="select-none">
            <ImageAttachments images={images || []} />
          </div>
        </div>

        {/* Post Footer (Card Mode Only) */}
        {mode === "card" && (
          <>
            <div className="px-5 py-1 flex items-center">
              <div className="mr-auto">
                <ReactionSummary
                  topReactions={topReactions}
                  totalCount={reactionCount}
                  isLoading={isInitialLoading}
                />
              </div>
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
          </>
        )}
      </div>
    </div>
  );
}
