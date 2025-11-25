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
// --- IMPORT FEED REACTION HOOK ---
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
  // --- NEW PROPS FOR FEED ---
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

  // UPDATED: Fetch comment count for both Feeds and Announcements using the new table logic
  const { count: commentCount, refreshCount } = useCommentCount(postId, isFeed);

  // --- REACTION LOGIC SPLIT ---
  // We call both hooks but with conditional IDs so only the relevant one is active
  const postReactions = usePostReactions({
    postId: isFeed ? "" : postId,
    userId: userId || "",
  });

  const feedReactions = useFeedReaction({
    feedId: isFeed ? postId : "",
    userId: userId || "",
  });

  // Select the active data based on mode
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
    <div id={`post-${postId}`}>
      <div className="w-[590px] bg-gold rounded-[15px] p-[5px]">
        {/* HEADER COLOR: Dark Maroon for Official, White for Feed */}
        <div
          className={`w-[580px] bg-darkmaroon
           rounded-t-[10px] flex flex-col`}
        >
          {/* Post Header */}
          <div className="flex items-start justify-between mt-[15px] mx-[15px]">
            <div className="flex items-center">
              <div className="select-none">
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
                  />
                )}
              </div>
              <div className="flex flex-col ml-3 select-text justify-center">
                <h1
                  className={`font-montserrat font-medium text-[20px] leading-[30px] ${
                    isFeed ? "text-white font-bold" : "text-white"
                  }`}
                >
                  {isFeed && author
                    ? author.fullName
                    : "Cebu Institute of Technology - University"}
                </h1>
                <div className="flex items-center gap-1">
                  <p
                    className={`text-white
                     font-ptsans text-[15px]`}
                  >
                    {date} {isFeed ? "" : "·"}
                  </p>
                  {/* Dynamic Icon Logic (Only for Announcements) */}
                  {!isFeed &&
                    (IconComponent ? (
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

          <hr className={`mx-4 mt-2 border-white/20`} />

          {/* Post Title (Only show for Announcements) */}
          {!isFeed && (
            <div className="font-montserrat font-semibold text-[20px] my-[10px] mx-[20px] text-white select-text">
              {title}
            </div>
          )}

          {/* Post Description */}
          <div
            ref={descriptionRef}
            className={`font-montserrat text-[16px] mt-[10px] mx-[20px] select-text break-words mb-[5px] text-white
             ${mode === "card" && !isExpanded ? "line-clamp-3" : ""}`}
          >
            {description}
          </div>

          {/* See More Button */}
          {mode === "card" && isSeeMoreVisible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`font-montserrat text-[16px] font-medium ml-[20px] mb-[5px] cursor-pointer self-start ${
                isFeed
                  ? "text-gray-500 hover:text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}

          {/* Post Attachments */}
          <div className="select-none mt-2">
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
              {/* Comments Count */}
              <div
                className="cursor-pointer font-montserrat font-medium text-[20px] text-black hover:underline"
                onClick={handleCommentClick}
              >
                {formatCommentCount(commentCount || 0)}
              </div>
            </div>
            <hr className="border-black/20 mb-2" />
            <div className="flex justify-between items-center">
              {/* 1. Reaction Button - Always enabled */}
              <ReactButton
                width={"full"}
                selectedReactionId={selectedReactionId}
                isLoading={isLoading}
                onReactionSelect={handleReactionSelect}
                onMainButtonClick={handleMainButtonClick}
              />

              {/* 2. Comment Button - Always enabled */}
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
