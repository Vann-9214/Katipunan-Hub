"use client";

import { supabase } from "../../General/supabaseClient";
import { useEffect, useState, useCallback, useRef } from "react";
import { CommentWithAuthor } from "@/app/component/General/Announcement/Posts/Comment/commentItem";
import { usePostComment } from "@/app/component/General/Announcement/Posts/Comment/postCommentContext";
import { ReactionCount } from "./usePostReaction";

// --- HELPER: Simple Optimistic Update ---
const simpleOptimisticUpdate = (
  comments: CommentWithAuthor[],
  commentId: string,
  newReactionId: string | null,
  oldReactionId: string | null
): CommentWithAuthor[] => {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      const newComment = { ...comment };
      newComment.userReactionId = newReactionId;
      const newSummary = { ...newComment.reactionSummary };
      let newTotalCount = newSummary.totalCount || 0;

      if (oldReactionId && !newReactionId) {
        newTotalCount--;
      } else if (!oldReactionId && newReactionId) {
        newTotalCount++;
      }

      newSummary.totalCount = newTotalCount < 0 ? 0 : newTotalCount;
      newComment.reactionSummary = newSummary;
      return newComment;
    }
    return comment;
  });
};

export function useComments(postId: string, isFeed: boolean = false) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    avatarURL: string;
    fullName: string | null;
  } | null>(null);

  const [reactingCommentId, setReactingCommentId] = useState<string | null>(
    null
  );
  const { closePostModal } = usePostComment();

  // --- FETCH COMMENTS LOGIC ---
  const fetchCommentsWithReactions = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);

    if (isFeed) {
      // --- FEED LOGIC (Updated to fetch reactions) ---
      const { data, error } = await supabase
        .from("FeedComments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          Accounts:user_id (
            id,
            fullName,
            avatarURL
          ),
          FeedCommentReactions (
            user_id,
            reaction
          )
        `)
        .eq("feed_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching feed comments:", error.message);
        setIsLoading(false);
        return;
      }

      // Map Feed comments and calculate reactions manually
      // (Since we don't have an RPC for feed comment aggregation yet)
      const feedComments: CommentWithAuthor[] = (data || []).map((c: any) => {
        const reactions = c.FeedCommentReactions || [];

        // 1. Check if current user reacted
        const userReaction =
          reactions.find((r: any) => r.user_id === currentUser?.id)?.reaction ||
          null;

        // 2. Aggregate counts locally
        const counts: Record<string, number> = {};
        reactions.forEach((r: any) => {
          counts[r.reaction] = (counts[r.reaction] || 0) + 1;
        });

        const topReactions: ReactionCount[] = Object.entries(counts)
          .map(([reaction, count]) => ({ reaction, count }))
          .sort((a, b) => b.count - a.count);

        return {
          id: c.id,
          comment: c.content,
          created_at: c.created_at,
          parent_comment_id: null,
          author: {
            id: c.Accounts?.id || c.user_id,
            fullName: c.Accounts?.fullName || "Unknown",
            avatarURL: c.Accounts?.avatarURL || "/DefaultAvatar.svg",
          },
          reactionSummary: {
            totalCount: reactions.length,
            topReactions,
          },
          userReactionId: userReaction,
        };
      });

      setComments(feedComments);
      setCommentCount(feedComments.length);
      setIsLoading(false);
    } else {
      // --- ANNOUNCEMENT LOGIC (Unchanged) ---
      const { data: rpcData, error } = await supabase.rpc(
        "get_comments_for_post",
        {
          p_post_id: postId,
        }
      );

      if (error) {
        console.error(
          "Error fetching comments:",
          error.message || error
        );
        setIsLoading(false);
        return;
      }

      const commentsData: CommentWithAuthor[] = (rpcData as any) || [];
      setCommentCount(commentsData.length);
      setComments(commentsData);
      setIsLoading(false);
    }
  }, [postId, supabase, isFeed, currentUser?.id]);

  // Fetch User (Unchanged)
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: accountData, error: accountError } = await supabase
          .from("Accounts")
          .select("id, avatarURL, fullName")
          .eq("id", user.id)
          .single();

        if (accountError) {
          console.error("Error fetching user account:", accountError);
        }

        setCurrentUser({
          id: user.id,
          avatarURL: accountData?.avatarURL || "/DefaultAvatar.svg",
          fullName: accountData?.fullName || null,
        });
      }
    };
    fetchUser();
  }, [supabase]);

  // Initial Fetch (Unchanged)
  useEffect(() => {
    if (postId) {
      fetchCommentsWithReactions();
    }
  }, [postId, fetchCommentsWithReactions]);

  // Realtime Subscriptions (Unchanged logic, added reaction listener for feeds)
  useEffect(() => {
    if (!postId) return;

    if (isFeed) {
      const channel = supabase
        .channel(`feed-comments-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "FeedComments",
            filter: `feed_id=eq.${postId}`,
          },
          () => fetchCommentsWithReactions()
        )
        // Listen for reaction changes on feeds too
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "FeedCommentReactions",
          },
          () => fetchCommentsWithReactions()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      const handleNewComment = (payload: any) => {
        if (payload.new.user_id === currentUser?.id) return;
        fetchCommentsWithReactions();
      };

      const channel = supabase
        .channel(`post-comments-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "PostComments",
            filter: `post_id=eq.${postId}`,
          },
          handleNewComment
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "PostComments",
            filter: `post_id=eq.${postId}`,
          },
          () => fetchCommentsWithReactions()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "PostCommentReactions",
            filter: `post_id=eq.${postId}`,
          },
          () => fetchCommentsWithReactions()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, fetchCommentsWithReactions, postId, currentUser?.id, isFeed]);

  // --- 4. UPDATED `handleCommentReaction` ---
  const handleCommentReaction = useCallback(
    async (commentId: string, newReactionId: string | null) => {
      if (!currentUser) return;
      setReactingCommentId(commentId);

      let oldReactionId: string | null = null;
      setComments((prevComments) => {
        const comment = prevComments.find((c) => c.id === commentId);
        oldReactionId = comment ? comment.userReactionId : null;
        return simpleOptimisticUpdate(
          prevComments,
          commentId,
          newReactionId,
          oldReactionId
        );
      });

      try {
        // Dynamic Table & ID Selection
        const table = isFeed ? "FeedCommentReactions" : "PostCommentReactions";
        const idField = isFeed ? "feed_comment_id" : "comment_id";

        if (newReactionId) {
          const { error } = await supabase
            .from(table)
            .upsert(
              {
                [idField]: commentId,
                user_id: currentUser.id,
                reaction: newReactionId,
              },
              { onConflict: `${idField}, user_id` }
            );
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(table)
            .delete()
            .match({ [idField]: commentId, user_id: currentUser.id });
          if (error) throw error;
        }
      } catch (error: any) {
        console.error("Error handling reaction:", error.message || error);
        // Revert on failure
        setComments((prevComments) =>
          simpleOptimisticUpdate(
            prevComments,
            commentId,
            oldReactionId, // Swapped to revert
            newReactionId // Swapped to revert
          )
        );
      } finally {
        setReactingCommentId(null);
        fetchCommentsWithReactions();
      }
    },
    [currentUser, supabase, fetchCommentsWithReactions, isFeed]
  );

  // --- 5. POST COMMENT (Unchanged) ---
  const postComment = useCallback(
    async (commentText: string) => {
      if (!currentUser || !postId || !commentText.trim()) return;

      if (isFeed) {
        const newFeedComment = {
          feed_id: postId,
          user_id: currentUser.id,
          content: commentText,
        };

        const { data: insertedComment, error } = await supabase
          .from("FeedComments")
          .insert(newFeedComment)
          .select()
          .single();

        if (error || !insertedComment) {
          console.error("Error posting feed comment:", error?.message);
          return;
        }

        const newCommentForUI: CommentWithAuthor = {
          id: insertedComment.id,
          comment: insertedComment.content,
          created_at: insertedComment.created_at,
          parent_comment_id: null,
          author: {
            id: currentUser.id,
            fullName: currentUser.fullName || "User",
            avatarURL: currentUser.avatarURL,
          },
          reactionSummary: { totalCount: 0, topReactions: [] },
          userReactionId: null,
        };

        setComments((prevComments) => [...prevComments, newCommentForUI]);
        setCommentCount((prevCount) => prevCount + 1);
      } else {
        const newComment = {
          post_id: postId,
          user_id: currentUser.id,
          comment: commentText,
          parent_comment_id: null,
        };

        const { data: insertedComment, error } = await supabase
          .from("PostComments")
          .insert(newComment)
          .select()
          .single();

        if (error || !insertedComment) {
          console.error("Error posting comment:", error?.message);
          return;
        }

        const newCommentForUI: CommentWithAuthor = {
          ...insertedComment,
          parent_comment_id: insertedComment.parent_comment_id || null,
          author: {
            id: currentUser.id,
            fullName: currentUser.fullName || "User",
            avatarURL: currentUser.avatarURL,
          },
          reactionSummary: { totalCount: 0, topReactions: [] },
          userReactionId: null,
        };

        setComments((prevComments) => [...prevComments, newCommentForUI]);
        setCommentCount((prevCount) => prevCount + 1);
      }
    },
    [currentUser, postId, supabase, isFeed]
  );

  return {
    comments,
    isLoading,
    currentUser,
    postComment,
    handleCommentReaction,
    reactingCommentId,
    commentCount,
  };
}