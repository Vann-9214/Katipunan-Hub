"use client";

import { useEffect, useState, useCallback } from "react";
import { CommentWithAuthor } from "@/app/component/General/Announcement/Posts/Comment/commentItem";
import { usePostComment } from "@/app/component/General/Announcement/Posts/Comment/postCommentContext";
import { getCurrentUserDetails } from "../../General/getUser";

const INITIAL_MOCK_COMMENTS: CommentWithAuthor[] = [
  {
    id: "cm-1",
    comment: "This is really helpful, thanks for the update!",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    parent_comment_id: null,
    author: {
      id: "usr_alex_02",
      fullName: "Alex Rivera",
      avatarURL: "/Cit Logo.svg",
    },
    reactionSummary: {
      totalCount: 3,
      topReactions: [
        { reaction: "❤️", count: 2 },
        { reaction: "👍", count: 1 },
      ],
    },
    userReactionId: null,
  },
  {
    id: "cm-2",
    comment: "Looking forward to this!",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    parent_comment_id: null,
    author: {
      id: "usr_maria_03",
      fullName: "Maria Santos",
      avatarURL: "/Cit Logo.svg",
    },
    reactionSummary: {
      totalCount: 1,
      topReactions: [{ reaction: "🔥", count: 1 }],
    },
    userReactionId: null,
  },
];

export function useComments(postId: string, _isFeed: boolean = false) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    avatarURL: string;
    fullName: string | null;
  } | null>(null);

  const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
  const { closePostModal } = usePostComment();

  useEffect(() => {
    getCurrentUserDetails().then((user) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          avatarURL: user.avatarURL || "/DefaultAvatar.svg",
          fullName: user.fullName || "Teknoy Student",
        });
      }
    });
    setComments(INITIAL_MOCK_COMMENTS);
    setCommentCount(INITIAL_MOCK_COMMENTS.length);
  }, [postId]);

  const handleCommentReaction = useCallback(
    async (commentId: string, newReactionId: string | null) => {
      setReactingCommentId(commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const oldReaction = c.userReactionId;
            let total = c.reactionSummary?.totalCount || 0;
            if (oldReaction && !newReactionId) total = Math.max(0, total - 1);
            else if (!oldReaction && newReactionId) total += 1;

            return {
              ...c,
              userReactionId: newReactionId,
              reactionSummary: {
                totalCount: total,
                topReactions: newReactionId
                  ? [{ reaction: newReactionId, count: 1 }]
                  : [],
              },
            };
          }
          return c;
        })
      );
      setReactingCommentId(null);
    },
    []
  );

  const postComment = useCallback(
    async (commentText: string, replyTo: CommentWithAuthor | null) => {
      if (!commentText.trim()) return;

      const newComment: CommentWithAuthor = {
        id: `cm-${Date.now()}`,
        comment: commentText.trim(),
        created_at: new Date().toISOString(),
        parent_comment_id: replyTo ? replyTo.id : null,
        author: {
          id: currentUser?.id || "usr_mock_wildcat_01",
          fullName: currentUser?.fullName || "Teknoy Student",
          avatarURL: currentUser?.avatarURL || "/Cit Logo.svg",
        },
        reactionSummary: {
          totalCount: 0,
          topReactions: [],
        },
        userReactionId: null,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentCount((prev) => prev + 1);
    },
    [currentUser]
  );

  const deleteComment = useCallback(async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    comments,
    commentCount,
    isLoading,
    currentUser,
    reactingCommentId,
    handleCommentReaction,
    postComment,
    deleteComment,
    closePostModal,
  };
}