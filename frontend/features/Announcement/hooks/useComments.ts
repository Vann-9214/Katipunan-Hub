"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/database/supabase/General/supabaseClient";

export interface CommentAuthor {
  id: string;
  fullName: string;
  avatarURL: string;
}

export interface CommentReactionSummary {
  totalCount: number;
  topReactions: { reaction: string; count: number }[];
}

export interface CommentItemData {
  id: string;
  comment: string;
  created_at: string;
  parent_comment_id: string | null;
  author: CommentAuthor;
  reactionSummary: CommentReactionSummary;
  userReactionId: string | null;
}

interface UseCommentsProps {
  postId: string;
  currentUser: {
    id: string;
    fullName?: string | null;
    avatarURL?: string;
  } | null;
}

export function useComments({ postId, currentUser }: UseCommentsProps) {
  const [comments, setComments] = useState<CommentItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reactingCommentId, setReactingCommentId] = useState<string | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      // 1. Fetch comments from PostComments
      const { data, error } = await supabase
        .from("PostComments")
        .select(`
          id,
          comment,
          created_at,
          user_id,
          parent_comment_id,
          Accounts:user_id ( id, fullName, avatarURL )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error.message);
        return;
      }

      const rawComments = data || [];

      // 2. Fetch reactions for these comments if any
      let reactionsByComment: Record<
        string,
        { reaction: string; user_id: string }[]
      > = {};

      if (rawComments.length > 0) {
        const commentIds = rawComments.map((c: { id: string }) => c.id);
        const { data: reactionRows } = await supabase
          .from("PostCommentReactions")
          .select("comment_id, user_id, reaction")
          .in("comment_id", commentIds);

        if (reactionRows) {
          reactionRows.forEach(
            (r: { comment_id: string; user_id: string; reaction: string }) => {
              if (!reactionsByComment[r.comment_id]) {
                reactionsByComment[r.comment_id] = [];
              }
              reactionsByComment[r.comment_id].push({
                reaction: r.reaction,
                user_id: r.user_id,
              });
            }
          );
        }
      }

      const processed: CommentItemData[] = rawComments.map((c: any) => {
        const reactions = reactionsByComment[c.id] || [];
        const myReaction = currentUser
          ? reactions.find((r) => r.user_id === currentUser.id)?.reaction ||
            null
          : null;

        const reactionCounts: Record<string, number> = {};
        reactions.forEach((r) => {
          reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
        });

        const topReactions = Object.entries(reactionCounts)
          .map(([reaction, count]) => ({ reaction, count }))
          .sort((a, b) => b.count - a.count);

        return {
          id: c.id,
          comment: c.comment || "",
          created_at: c.created_at,
          parent_comment_id: c.parent_comment_id || null,
          author: {
            id: c.Accounts?.id || c.user_id,
            fullName: c.Accounts?.fullName || "User",
            avatarURL: c.Accounts?.avatarURL || "/DefaultAvatar.svg",
          },
          reactionSummary: {
            totalCount: reactions.length,
            topReactions,
          },
          userReactionId: myReaction,
        };
      });

      setComments(processed);
    } catch (err) {
      console.error("Unexpected error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, currentUser]);

  useEffect(() => {
    if (postId) {
      setIsLoading(true);
      fetchComments();
    }
  }, [postId, fetchComments]);

  // Real-time subscriptions
  useEffect(() => {
    if (!postId) return;

    const channelName = `post-comments-thread-${postId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "PostComments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "PostCommentReactions",
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchComments]);

  const postComment = async (
    commentText: string,
    replyTo: CommentItemData | null
  ) => {
    if (!currentUser || !postId || !commentText.trim()) return;

    const parentId = replyTo ? replyTo.parent_comment_id || replyTo.id : null;

    try {
      const { data, error } = await supabase
        .from("PostComments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          comment: commentText.trim(),
          parent_comment_id: parentId,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCommentItem: CommentItemData = {
          id: data.id,
          comment: data.comment || commentText.trim(),
          created_at: data.created_at || new Date().toISOString(),
          parent_comment_id: data.parent_comment_id || null,
          author: {
            id: currentUser.id,
            fullName: currentUser.fullName || "Me",
            avatarURL: currentUser.avatarURL || "/DefaultAvatar.svg",
          },
          reactionSummary: { totalCount: 0, topReactions: [] },
          userReactionId: null,
        };

        setComments((prev) => [...prev, newCommentItem]);
      }
    } catch (err: any) {
      console.error("Error posting comment:", err?.message || err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleCommentReaction = async (
    commentId: string,
    newReactionId: string | null
  ) => {
    if (!currentUser) return;
    setReactingCommentId(commentId);

    try {
      if (newReactionId) {
        const { error } = await supabase.from("PostCommentReactions").upsert(
          {
            comment_id: commentId,
            user_id: currentUser.id,
            reaction: newReactionId,
          },
          { onConflict: "comment_id, user_id" }
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("PostCommentReactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUser.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Error reacting to comment:", err);
    } finally {
      setReactingCommentId(null);
      fetchComments();
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { error } = await supabase
        .from("PostComments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      setComments((prev) =>
        prev.filter((c) => c.id !== commentId && c.parent_comment_id !== commentId)
      );
    } catch (err: any) {
      console.error("Error deleting comment:", err?.message || err);
      alert("Failed to delete comment.");
    }
  };

  return {
    comments,
    isLoading,
    postComment,
    handleCommentReaction,
    deleteComment,
    reactingCommentId,
    refreshComments: fetchComments,
  };
}
