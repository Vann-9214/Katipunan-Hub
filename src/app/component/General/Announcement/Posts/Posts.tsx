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
import { useFeedReaction } from "../../../../../../supabase/Lib/Feeds/useFeedReaction";
import ReactionSummary from "./reactionSummary";
import { collegeitems } from "../Utils/constants";
import Avatar from "@/app/component/ReusableComponent/Avatar";

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
  type: "announcement" | "highlight" | "feed";
  mode?: "card" | "modal";
  visibility?: string | null;
  isFeed?: boolean;
  author?: {
    fullName: string;
    avatarURL: string | null;
    role?: string;
  };
}

// Helper
const formatCommentCount = (count: number) => {
  if (count === 0) return null;
  if (count === 1) return "1 comment";
  if (count < 1000) return `${count} comments`;
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
    isFeed = false,
    author,
  } = props;

  // Hooks
  const { openPostModal } = usePostComment();
  const { count: commentCount, refreshCount } = useCommentCount(postId, isFeed);

  // --- REACTION LOGIC SPLIT ---
  const postReactions = usePostReactions({
    postId: isFeed ? "" : postId,
    userId: userId || "",
  });

  const feedReactions = useFeedReaction({
    feedId: isFeed ? postId : "",
    userId: userId || "",
  });

  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
    getReactionData,
  } = isFeed ? { ...feedReactions, getReactionData: () => {} } : postReactions;

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
    <div id={`post-${postId}`} className="mb-8 relative">
      {/* Shadow Element - Static (Always visible) */}
      <div className="absolute inset-0 bg-black/10 rounded-[24px] blur-md -z-10 translate-y-4" />

      {/* Main Card Container - GOLD GRADIENT BORDER/BACKGROUND */}
      <div className="w-[590px] p-[3px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
        {/* Inner Content Wrapper */}
        <div className="w-full rounded-[18px] overflow-hidden flex flex-col bg-transparent">
          {/* === HEADER & CONTENT SECTION (Maroon Background) === */}
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] text-white p-5 pb-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="select-none shrink-0">
                  {isFeed && author ? (
                    <Avatar
                      avatarURL={author.avatarURL}
                      altText={author.fullName}
                      className="w-[55px] h-[55px]"
                    />
                  ) : (
                    <Image
                      src="/Cit Logo.svg"
                      alt="Cit Logo"
                      width={55}
                      height={55}
                      draggable={false}
                      className="drop-shadow-md"
                    />
                  )}
                </div>
                <div className="flex flex-col ml-3 select-text justify-center">
                  <h1
                    className={`font-montserrat font-medium text-[18px] leading-tight ${
                      isFeed ? "font-bold" : ""
                    }`}
                  >
                    {isFeed && author
                      ? author.fullName
                      : "Cebu Institute of Technology - University"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-ptsans text-[14px] text-white/80">
                      {date} {isFeed ? "" : "·"}
                    </p>
                    {!isFeed &&
                      (IconComponent ? (
                        <IconComponent className="w-4 h-4 text-white/80" />
                      ) : (
                        <Image
                          src="/Global.svg"
                          alt="Global"
                          width={16}
                          height={16}
                          draggable={false}
                          className="invert brightness-0 opacity-80"
                        />
                      ))}
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

            {/* Divider */}
            <hr className="border-white/10 mb-4" />

            {/* Post Title */}
            {!isFeed && (
              <div className="font-montserrat font-bold text-[22px] mb-3 select-text tracking-tight">
                {title}
              </div>
            )}

            {/* Post Description */}
            <div
              ref={descriptionRef}
              className={`font-montserrat text-[16px] leading-relaxed text-white/90 select-text break-words whitespace-pre-wrap
             ${mode === "card" && !isExpanded ? "line-clamp-3" : ""}`}
            >
              {description}
            </div>

            {/* See More Button */}
            {mode === "card" && isSeeMoreVisible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-montserrat text-[14px] font-semibold mt-1 text-[#EFBF04] hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {isExpanded ? "See less" : "See more"}
              </button>
            )}

            {/* Post Attachments */}
            {images.length > 0 && (
              <div className="select-none mt-4 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                <ImageAttachments images={images} />
              </div>
            )}
          </div>

          {/* === FOOTER SECTION (GOLD Background to match Outer) === */}
          {mode === "card" && (
            <div className="bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] px-5 py-2">
              {/* Reaction Counts & Comment Link */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ReactionSummary
                    topReactions={topReactions}
                    totalCount={reactionCount}
                    isLoading={isInitialLoading}
                    // --- PASSING PROPS FOR HOVER ---
                    referenceId={postId}
                    sourceType={isFeed ? "feed" : "post"}
                  />
                </div>

                <div
                  className="cursor-pointer font-montserrat font-medium text-[15px] text-black hover:text-maroon hover:underline transition-colors"
                  onClick={handleCommentClick}
                >
                  {formatCommentCount(commentCount || 0)}
                </div>
              </div>

              <div className="h-px bg-black/10 w-full mb-2" />

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2">
                {/* 1. Reaction Button */}
                <div className="flex-1">
                  <ReactButton
                    width="full"
                    selectedReactionId={selectedReactionId}
                    isLoading={isLoading}
                    onReactionSelect={handleReactionSelect}
                    onMainButtonClick={handleMainButtonClick}
                  />
                </div>

                {/* 2. Comment Button */}
                <div className="flex-1" onClick={handleCommentClick}>
                  <CommentButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
