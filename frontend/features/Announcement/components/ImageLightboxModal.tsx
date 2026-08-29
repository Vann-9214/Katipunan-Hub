"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { useComments, CommentItemData } from "../hooks/useComments";
import { usePostReactions } from "../hooks/usePostReactions";
import ReactionButton from "./ReactionButton";
import ReactionSummary from "./ReactionSummary";
import CommentSection from "./CommentSection";
import CommentInput from "./CommentInput";
import { formatCommentCount } from "../utils/reactionsConfig";
import { collegeitems } from "../utils/constants";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export interface ImageLightboxModalProps {
  images?: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  postTitle?: string;
  postDescription?: string;
  postDate?: string;
  postVisibility?: string | null;
  currentUser?: {
    id: string;
    fullName?: string | null;
    avatarURL?: string;
  } | null;
  focusCommentInput?: boolean;
}

export default function ImageLightboxModal({
  images = [],
  initialIndex = 0,
  isOpen,
  onClose,
  postId,
  postTitle,
  postDescription,
  postDate,
  postVisibility,
  currentUser,
  focusCommentInput = false,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentItemData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasImages = Boolean(images && images.length > 0);
  const hasComments = Boolean(postId);

  const {
    comments,
    isLoading: isCommentsLoading,
    postComment,
    handleCommentReaction,
    deleteComment,
    reactingCommentId,
  } = useComments({ postId: postId || "", currentUser: currentUser || null });

  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading: isReactionsLoading,
    isInitialLoading: isReactionsInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  } = usePostReactions({
    postId: postId || "",
    userId: currentUser?.id,
  });

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setReplyTo(null);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handlePrev = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length, hasImages]);

  const handleNext = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length, hasImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasImages && images.length > 1 && !isInputFocused) {
        handlePrev();
      } else if (e.key === "ArrowRight" && hasImages && images.length > 1 && !isInputFocused) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, hasImages, handlePrev, handleNext, onClose]);

  const handlePostComment = async (text: string) => {
    await postComment(text, replyTo);
    setReplyTo(null);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  if (!mounted || !isOpen) return null;

  const currentImage = hasImages ? images[currentIndex] || images[0] : null;

  const college = postVisibility
    ? collegeitems.find((c) => c.value === postVisibility)
    : null;
  const IconComponent = college?.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={`image-lightbox-${postId || "photo"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 md:p-6 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full ${
              hasImages && hasComments
                ? "max-w-7xl h-[92vh] max-h-[920px]"
                : hasImages
                ? "max-w-5xl h-[85vh]"
                : "max-w-[620px] h-[90vh] max-h-[880px]"
            } p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Modal Inner Container */}
            <div className="w-full h-full bg-[#1a0101] rounded-[22px] flex flex-col lg:flex-row overflow-hidden shadow-inner">
              
              {/* ============================================================ */}
              {/* LEFT COLUMN: Photo Stage (rendered when post has images)     */}
              {/* ============================================================ */}
              {hasImages && currentImage && (
                <div className="relative flex-1 bg-black/95 flex flex-col items-center justify-between p-3 sm:p-4 min-h-[280px] lg:min-h-0 overflow-hidden">
                  {/* Top Control Bar on Stage */}
                  <div className="w-full flex items-center justify-between z-20 shrink-0 text-white">
                    <div className="flex items-center gap-2">
                      {images.length > 1 && (
                        <span
                          className={`${ptSans.className} text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFBF04]/20 text-[#EFBF04] border border-[#EFBF04]/40`}
                        >
                          {currentIndex + 1} / {images.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={currentImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
                        title="Open full size image in new tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                      {/* Mobile Close Button (shown only when right column wraps below) */}
                      <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-red-600 text-white transition-all cursor-pointer"
                        title="Close"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Main Photo Viewing Area */}
                  <div className="relative flex-1 w-full flex items-center justify-center min-h-0 my-2">
                    {/* Previous Button */}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrev();
                        }}
                        className="absolute left-2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#EFBF04] border border-white/20 hover:border-[#EFBF04]/70 transition-all cursor-pointer backdrop-blur-sm hover:scale-110 shadow-lg"
                        title="Previous (Left Arrow)"
                      >
                        <ChevronLeft size={22} />
                      </button>
                    )}

                    {/* Active Image with Ambient Blur */}
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentImage}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="relative w-full h-full flex items-center justify-center"
                        >
                          <Image
                            src={currentImage}
                            alt={
                              postTitle
                                ? `${postTitle} attachment ${currentIndex + 1}`
                                : `Attachment ${currentIndex + 1}`
                            }
                            fill
                            sizes="(max-width: 1024px) 100vw, 65vw"
                            className="object-contain drop-shadow-2xl rounded-lg select-none"
                            priority
                            unoptimized
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Next Button */}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                        className="absolute right-2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#EFBF04] border border-white/20 hover:border-[#EFBF04]/70 transition-all cursor-pointer backdrop-blur-sm hover:scale-110 shadow-lg"
                        title="Next (Right Arrow)"
                      >
                        <ChevronRight size={22} />
                      </button>
                    )}
                  </div>

                  {/* Bottom Thumbnails Strip */}
                  {images.length > 1 && (
                    <div className="w-full flex items-center justify-center gap-2 pt-2 overflow-x-auto z-10 shrink-0 custom-scrollbar">
                      {images.map((imgUrl, idx) => (
                        <button
                          key={imgUrl + idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            idx === currentIndex
                              ? "border-[#EFBF04] scale-105 shadow-md shadow-yellow-500/30 opacity-100"
                              : "border-white/20 opacity-50 hover:opacity-90 hover:border-white/50"
                          }`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* RIGHT / MAIN COLUMN: Post Info, Reactions & Comments Thread */}
              {/* ============================================================ */}
              {hasComments && (
                <div
                  className={`w-full ${
                    hasImages
                      ? "lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-[#EFBF04]/30 h-[45vh] lg:h-full"
                      : "flex-1 h-full"
                  } bg-gradient-to-b from-[#4e0505] to-[#240101] flex flex-col shrink-0 overflow-hidden`}
                >
                  {/* Header with Post Author & Desktop Close Button */}
                  <div className="px-5 py-4 border-b border-[#EFBF04]/20 bg-[#3a0202] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Image
                        src="/Cit Logo.svg"
                        alt="CIT Logo"
                        width={42}
                        height={42}
                        draggable={false}
                        className="drop-shadow-md shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`${montserrat.className} font-bold text-sm text-white leading-tight truncate`}
                        >
                          Cebu Institute of Technology - University
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-ptsans text-xs text-white/70 shrink-0">
                            {postDate}
                          </span>
                          <span className="text-white/40">·</span>
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-white/90 shrink-0">
                            {IconComponent ? (
                              <IconComponent className="w-3 h-3 text-[#EFBF04]" />
                            ) : (
                              <Image
                                src="/Global.svg"
                                alt="Global"
                                width={11}
                                height={11}
                                className="invert brightness-0 opacity-80"
                              />
                            )}
                            <span className="capitalize font-ptsans">
                              {college ? college.label : "Global"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-2"
                      title="Close (Esc)"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Middle Scrollable Section: Post Info, Reactions & Comments */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4"
                  >
                    {/* Post Title & Description Box */}
                    {(postTitle || postDescription) && (
                      <div className="bg-black/25 rounded-2xl p-4 border border-white/10">
                        {postTitle && (
                          <h4
                            className={`${montserrat.className} font-bold text-base text-[#EFBF04] mb-2 leading-snug`}
                          >
                            {postTitle}
                          </h4>
                        )}
                        {postDescription && (
                          <p className="font-ptsans text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                            {postDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reaction Stats & Comment Counter Summary */}
                    <div className="flex items-center justify-between px-1">
                      <ReactionSummary
                        topReactions={topReactions}
                        totalCount={reactionCount}
                        isLoading={isReactionsInitialLoading}
                        postId={postId}
                      />

                      <span className="font-ptsans text-xs text-white/70">
                        {formatCommentCount(comments.length)}
                      </span>
                    </div>

                    {/* Reaction Action Bar */}
                    <div className="pt-1 border-t border-white/10 flex items-center gap-2">
                      <ReactionButton
                        selectedReactionId={selectedReactionId}
                        isLoading={isReactionsLoading}
                        onReactionSelect={handleReactionSelect}
                        onMainButtonClick={handleMainButtonClick}
                      />
                    </div>

                    {/* Comments Thread Section */}
                    <div className="pt-2 border-t border-white/10">
                      <h5
                        className={`${montserrat.className} font-bold text-xs text-[#EFBF04] uppercase tracking-wider mb-2`}
                      >
                        Comments ({comments.length})
                      </h5>

                      <CommentSection
                        comments={comments}
                        isLoading={isCommentsLoading}
                        onReply={setReplyTo}
                        onReact={handleCommentReaction}
                        onDelete={deleteComment}
                        currentUserId={currentUser?.id}
                        reactingCommentId={reactingCommentId}
                      />
                    </div>
                  </div>

                  {/* Sticky Comment Input at Bottom */}
                  <div className="p-3.5 bg-[#3a0202] border-t border-[#EFBF04]/20 shrink-0">
                    <CommentInput
                      avatarUrl={currentUser?.avatarURL || "/DefaultAvatar.svg"}
                      replyTo={replyTo}
                      onCancelReply={() => setReplyTo(null)}
                      onSubmit={handlePostComment}
                      disabled={!currentUser}
                      autoFocus={focusCommentInput}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
