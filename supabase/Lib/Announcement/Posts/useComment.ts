"use client";

import { supabase } from "../../General/supabaseClient";
import { useEffect, useState, useCallback, useRef } from "react";
// Make sure this path is correct for your project
import { CommentWithAuthor } from "@/app/component/General/Announcement/Posts/Comment/commentItem";
import { usePostModal } from "@/app/component/General/Announcement/Posts/Comment/postModalContext";

// --- 1. REMOVED `findComment` HELPER ---

// --- 2. REPLACED `optimisticUpdateComment` HELPER ---
// This is a simplified version that only works on a flat array
const simpleOptimisticUpdate = (
  comments: CommentWithAuthor[],
  commentId: string,
  newReactionId: string | null,
  oldReactionId: string | null
): CommentWithAuthor[] => {
  return comments.map(comment => {
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
// --- END HELPER ---

export function useComments(postId: string) {
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
  const { closePostModal } = usePostModal();

  // --- 3. SIMPLIFIED `fetchCommentsWithReactions` ---
  const fetchCommentsWithReactions = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);

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

    // --- REMOVED ALL NESTING LOGIC ---
    // The RPC returns a flat list, and we no longer nest replies.
    setComments(commentsData);
    // --- END REMOVAL ---

    setIsLoading(false);
  }, [postId, supabase]);

  // Fetch user (unchanged)
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

  // Fetch comments (unchanged)
  useEffect(() => {
    if (postId) {
      fetchCommentsWithReactions();
    }
  }, [postId, fetchCommentsWithReactions]);

  // Realtime subscription (unchanged)
  useEffect(() => {
    if (!postId) return;
    const handleNewComment = (payload: any) => {
      if (payload.new.user_id === currentUser?.id) {
        return;
      }
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
        () => {
          fetchCommentsWithReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCommentsWithReactions, postId, currentUser?.id]);

  // --- 4. UPDATED `handleCommentReaction` ---
  // Uses the new simple helper function
  const handleCommentReaction = useCallback(
    async (commentId: string, newReactionId: string | null) => {
      if (!currentUser) return;
      setReactingCommentId(commentId);

      let oldReactionId: string | null = null;
      setComments(prevComments => {
        // Find the old reaction ID from the flat list
        const comment = prevComments.find(c => c.id === commentId);
        oldReactionId = comment ? comment.userReactionId : null;
        // Use the new simple helper
        return simpleOptimisticUpdate(
          prevComments,
          commentId,
          newReactionId,
          oldReactionId
        );
      });

      try {
        if (newReactionId) {
          const { error } = await supabase
            .from("PostCommentReactions")
            .upsert(
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
            .match({ comment_id: commentId, user_id: currentUser.id });
          if (error) throw error;
        }
      } catch (error: any) {
        console.error("Error handling reaction:", error.message || error);
        // Revert on failure
        setComments(prevComments =>
          simpleOptimisticUpdate( // Use new simple helper
            prevComments,
            commentId,
            oldReactionId, // Swapped
            newReactionId  // Swapped
          )
        );
      } finally {
        setReactingCommentId(null);
        fetchCommentsWithReactions();
      }
    },
    [currentUser, supabase, fetchCommentsWithReactions]
  );

  // --- 5. SIMPLIFIED `postComment` ---
  const postComment = useCallback(
    async (commentText: string /* REMOVED parentCommentId */) => {
      if (!currentUser || !postId || !commentText.trim()) return;

      const newComment = {
        post_id: postId,
        user_id: currentUser.id,
        comment: commentText,
        parent_comment_id: null, // Replies are no longer supported
      };

      const { data: insertedComment, error } = await supabase
        .from("PostComments")
        .insert(newComment)
        .select()
        .single();

      if (error || !insertedComment) {
        console.error(
          "Error posting comment:",
          error?.message || "No data returned"
        );
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
        // `replies: []` is no longer part of the type, so it's removed
        reactionSummary: { totalCount: 0, topReactions: [] },
        userReactionId: null,
      };

      // --- REMOVED REPLY LOGIC ---
      // Just add the new comment to the end of the flat list
      setComments(prevComments => [...prevComments, newCommentForUI]);
      // --- END REMOVAL ---

      setCommentCount(prevCount => prevCount + 1);
    },
    [currentUser, postId, supabase]
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