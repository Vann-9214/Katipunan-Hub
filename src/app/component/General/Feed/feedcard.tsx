"use client";

import { FeedPost } from "../../../../../supabase/Lib/Feeds/types";
import ImageAttachments from "../Announcement/ImageAttachment/ImageAttachments";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { useState, useEffect } from "react";

// --- IMPORTS FROM YOUR ANNOUNCEMENT FOLDER ---
import ReactionButton from "../Announcement/Posts/reactButton";
import CommentButton from "../Announcement/Posts/Comment/commentButton";
import ReactionSummary from "../Announcement/Posts/reactionSummary";

// --- IMPORT THE NEW FEED HOOK ---
import { useFeedReaction } from "../../../../../supabase/Lib/Feeds/useFeedReaction";

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export default function FeedCard({ post }: { post: FeedPost }) {
  // We need the current user ID to handle reactions
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    getCurrentUserDetails().then((user) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Use the hook for logic
  const {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  } = useFeedReaction({
    feedId: post.id,
    userId: currentUserId,
  });

  return (
    <div className="w-[590px] bg-maroon rounded-[15px] border border-gray-200 shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <Avatar
          avatarURL={post.author.avatarURL}
          altText={post.author.fullName}
          className="w-10 h-10 mr-3"
        />
        <div>
          <h3 className="font-bold text-black font-montserrat text-[16px]">
            {post.author.fullName}
          </h3>
          <p className="text-gray-500 text-xs font-medium">
            {post.author.role} • {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-black font-montserrat text-[15px] whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mt-2">
          <ImageAttachments images={post.images} />
        </div>
      )}

      {/* Reaction Summary Row */}
      <div className="px-4 py-1 flex items-center h-8">
        <ReactionSummary
          topReactions={topReactions}
          totalCount={reactionCount}
          isLoading={isInitialLoading}
          // --- PASSING PROPS FOR HOVER ---
          referenceId={post.id}
          sourceType="feed"
        />
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-4 bg-gray-50/50">
        {/* 1. YOUR REACTION BUTTON */}
        <div className="flex-1">
          <ReactionButton
            selectedReactionId={selectedReactionId}
            isLoading={isLoading}
            onReactionSelect={handleReactionSelect}
            onMainButtonClick={handleMainButtonClick}
            width="full"
            height={35}
            textSize={16}
          />
        </div>

        {/* 2. YOUR COMMENT BUTTON */}
        <div className="flex-1">
          <CommentButton />
        </div>
      </div>
    </div>
  );
}
