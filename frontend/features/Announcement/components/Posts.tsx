"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import EditPostsButton from "./EditPostsButton";
import ImageLightboxModal from "./ImageLightboxModal";
import ReactionButton from "./ReactionButton";
import ReactionSummary from "./ReactionSummary";
import CommentButton from "./CommentButton";
import { usePostReactions } from "../hooks/usePostReactions";
import { useCommentCount } from "../hooks/useCommentCount";
import { formatCommentCount } from "../utils/reactionsConfig";
import { collegeitems } from "../utils/constants";

// Component Interface
export interface PostsProps {
  postId: string;
  userId?: string;
  currentUser?: {
    id: string;
    fullName?: string | null;
    avatarURL?: string;
  } | null;
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  type: "announcement";
  mode?: "card" | "modal";
  visibility?: string | null;
  tags?: string[];
}

export default function Posts(props: PostsProps) {
  const {
    postId,
    userId,
    currentUser,
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

  // Description Expansion Logic
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeMoreVisible, setIsSeeMoreVisible] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialIndex: number;
    focusCommentInput: boolean;
  }>({
    isOpen: false,
    initialIndex: 0,
    focusCommentInput: false,
  });
  const descriptionRef = useRef<HTMLDivElement>(null);

  const effectiveUser = currentUser || (userId ? { id: userId } : null);

  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading: isReactionsLoading,
    isInitialLoading: isReactionsInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  } = usePostReactions({
    postId,
    userId: effectiveUser?.id,
  });

  const { commentCount } = useCommentCount(postId);

  useEffect(() => {
    const element = descriptionRef.current;
    if (element && mode === "card") {
      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsSeeMoreVisible(hasOverflow);
    }
  }, [description, mode]);

  const handleOpenPhoto = (index: number) => {
    setModalState({
      isOpen: true,
      initialIndex: index,
      focusCommentInput: false,
    });
  };

  const handleOpenComments = () => {
    setModalState({
      isOpen: true,
      initialIndex: 0,
      focusCommentInput: true,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Visibility / College Icon Logic
  const college = visibility
    ? collegeitems.find((c) => c.value === visibility)
    : null;
  const IconComponent = college?.icon;

  return (
    <div id={`post-${postId}`} className="mb-6 relative w-full max-w-[590px]">
      {/* Shadow Element */}
      <div className="absolute inset-0 bg-black/10 rounded-[24px] blur-md -z-10 translate-y-3" />

      {/* Main Card Container - Gold Accent Border */}
      <div className="w-full p-[2px] rounded-[22px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
        {/* Inner Content Wrapper */}
        <div className="w-full rounded-[20px] overflow-hidden flex flex-col bg-white">
          {/* Header & Body Section */}
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] text-white p-6 pb-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="select-none shrink-0">
                  <Image
                    src="/Cit Logo.svg"
                    alt="CIT Logo"
                    width={50}
                    height={50}
                    draggable={false}
                    className="drop-shadow-md"
                  />
                </div>
                <div className="flex flex-col select-text justify-center">
                  <h1 className="font-montserrat font-bold text-[16px] leading-tight text-white">
                    Cebu Institute of Technology - University
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-ptsans text-[13px] text-white/80">
                      {date}
                    </p>
                    <span className="text-white/40">·</span>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-xs text-white/90">
                      {IconComponent ? (
                        <IconComponent className="w-3.5 h-3.5 text-[#EFBF04]" />
                      ) : (
                        <Image
                          src="/Global.svg"
                          alt="Global"
                          width={13}
                          height={13}
                          draggable={false}
                          className="invert brightness-0 opacity-80"
                        />
                      )}
                      <span className="capitalize text-[11px] font-medium font-ptsans">
                        {college ? college.label : "Global"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
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

            {/* Announcement Title */}
            {title && (
              <div className="font-montserrat font-bold text-[20px] mb-3 select-text tracking-tight text-[#EFBF04] leading-snug">
                {title}
              </div>
            )}

            {/* Announcement Description */}
            <div
              ref={descriptionRef}
              className={`font-ptsans text-[15px] leading-relaxed text-white/90 select-text break-words whitespace-pre-wrap ${
                mode === "card" && !isExpanded ? "line-clamp-4" : ""
              }`}
            >
              {description}
            </div>

            {/* See More Button */}
            {mode === "card" && isSeeMoreVisible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-montserrat text-[13px] font-semibold mt-2 text-[#EFBF04] hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {isExpanded ? "See less" : "See more"}
              </button>
            )}

            {/* Announcement Images */}
            {images && images.length > 0 && (
              <div className="mt-4 rounded-xl overflow-hidden">
                {images.length === 1 ? (
                  <div
                    onClick={() => handleOpenPhoto(0)}
                    className="relative w-full h-[280px] md:h-[340px] rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer flex items-center justify-center"
                  >
                    {/* Ambient Blur Background */}
                    <Image
                      src={images[0]}
                      alt=""
                      fill
                      aria-hidden="true"
                      className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none select-none"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden="true" />

                    {/* Contained Sharp Image */}
                    <Image
                      src={images[0]}
                      alt="Announcement attachment 1"
                      fill
                      sizes="(max-width: 768px) 100vw, 590px"
                      className="relative z-10 object-contain drop-shadow-md"
                      unoptimized
                    />
                  </div>
                ) : images.length === 2 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {images.map((imgUrl, index) => (
                      <div
                        key={imgUrl + index}
                        onClick={() => handleOpenPhoto(index)}
                        className="relative h-[160px] md:h-[190px] rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer flex items-center justify-center"
                      >
                        {/* Ambient Blur Background */}
                        <Image
                          src={imgUrl}
                          alt=""
                          fill
                          aria-hidden="true"
                          className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none select-none"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden="true" />

                        {/* Contained Sharp Image */}
                        <Image
                          src={imgUrl}
                          alt={`Announcement attachment ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 290px"
                          className="relative z-10 object-contain drop-shadow-md"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                ) : images.length === 3 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      onClick={() => handleOpenPhoto(0)}
                      className="col-span-2 relative h-[200px] md:h-[230px] rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer flex items-center justify-center"
                    >
                      {/* Ambient Blur Background */}
                      <Image
                        src={images[0]}
                        alt=""
                        fill
                        aria-hidden="true"
                        className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none select-none"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden="true" />

                      {/* Contained Sharp Image */}
                      <Image
                        src={images[0]}
                        alt="Announcement attachment 1"
                        fill
                        sizes="(max-width: 768px) 100vw, 590px"
                        className="relative z-10 object-contain drop-shadow-md"
                        unoptimized
                      />
                    </div>
                    {images.slice(1, 3).map((imgUrl, index) => (
                      <div
                        key={imgUrl + (index + 1)}
                        onClick={() => handleOpenPhoto(index + 1)}
                        className="relative h-[140px] md:h-[160px] rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer flex items-center justify-center"
                      >
                        {/* Ambient Blur Background */}
                        <Image
                          src={imgUrl}
                          alt=""
                          fill
                          aria-hidden="true"
                          className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none select-none"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden="true" />

                        {/* Contained Sharp Image */}
                        <Image
                          src={imgUrl}
                          alt={`Announcement attachment ${index + 2}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 290px"
                          className="relative z-10 object-contain drop-shadow-md"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {images.slice(0, 4).map((imgUrl, index) => {
                      const isFourthAndMore = index === 3 && images.length > 4;
                      const extraCount = images.length - 4;
                      return (
                        <div
                          key={imgUrl + index}
                          onClick={() => handleOpenPhoto(index)}
                          className="relative h-[140px] md:h-[160px] rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer flex items-center justify-center"
                        >
                          {/* Ambient Blur Background */}
                          <Image
                            src={imgUrl}
                            alt=""
                            fill
                            aria-hidden="true"
                            className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none select-none"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden="true" />

                          {/* Contained Sharp Image */}
                          <Image
                            src={imgUrl}
                            alt={`Announcement attachment ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 290px"
                            className="relative z-10 object-contain drop-shadow-md"
                            unoptimized
                          />
                          {isFourthAndMore && (
                            <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white font-montserrat font-bold text-lg md:text-xl backdrop-blur-[2px]">
                              <span>+{extraCount + 1}</span>
                              <span className="text-xs font-normal text-[#EFBF04] font-ptsans">
                                View all
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reactions & Comments Action Footer */}
          {mode === "card" && (
            <div className="bg-[#2a0404] border-t border-white/10 px-5 py-3 flex flex-col gap-2.5">
              {/* Top Reaction & Comment Stats Summary */}
              {((reactionCount !== null && reactionCount > 0) ||
                commentCount > 0) && (
                <div className="flex items-center justify-between text-xs text-white/70">
                  <ReactionSummary
                    topReactions={topReactions}
                    totalCount={reactionCount}
                    isLoading={isReactionsInitialLoading}
                    postId={postId}
                  />

                  {commentCount > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenComments}
                      className="font-ptsans text-xs text-white/70 hover:underline hover:text-[#EFBF04] transition-colors cursor-pointer ml-auto"
                    >
                      {formatCommentCount(commentCount)}
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons: Reaction Button + Comment Button */}
              <div className="flex items-center gap-2.5">
                <ReactionButton
                  selectedReactionId={selectedReactionId}
                  isLoading={isReactionsLoading}
                  onReactionSelect={handleReactionSelect}
                  onMainButtonClick={handleMainButtonClick}
                />

                <div className="flex-1">
                  <CommentButton onClick={handleOpenComments} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Post Discussion & Image Modal */}
      <ImageLightboxModal
        isOpen={modalState.isOpen}
        initialIndex={modalState.initialIndex}
        images={images}
        postId={postId}
        postTitle={title}
        postDescription={description}
        postDate={date}
        postVisibility={visibility}
        currentUser={effectiveUser}
        focusCommentInput={modalState.focusCommentInput}
        onClose={handleCloseModal}
      />
    </div>
  );
}
