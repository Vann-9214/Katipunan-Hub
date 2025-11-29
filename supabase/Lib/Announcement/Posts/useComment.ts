"use client";

import { supabase } from "../../General/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { CommentWithAuthor } from "@/app/component/General/Announcement/Posts/Comment/commentItem";
import { usePostComment } from "@/app/component/General/Announcement/Posts/Comment/postCommentContext";
import { ReactionCount } from "./usePostReaction";

// --- HELPER: Optimistic Update Logic ---
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
        newTotalCount = Math.max(0, newTotalCount - 1);
      } else if (!oldReactionId && newReactionId) {
        newTotalCount++;
      }
      
      newSummary.totalCount = newTotalCount;
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

  const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
  const { closePostModal } = usePostComment();

  // 1. Fetch User Details
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: accountData } = await supabase
          .from("Accounts")
          .select("id, avatarURL, fullName")
          .eq("id", user.id)
          .single();

        setCurrentUser({
          id: user.id,
          avatarURL: accountData?.avatarURL || "/DefaultAvatar.svg",
          fullName: accountData?.fullName || null,
        });
      }
    };
    fetchUser();
  }, []);

  // 2. Main Data Fetching Function
  const fetchCommentsWithReactions = useCallback(async () => {
    if (!postId) return;
    if (comments.length === 0) setIsLoading(true);

    try {
      let rawData: any[] = [];

      if (isFeed) {
        // --- FEED COMMENTS (Uses 'content') ---
        const { data, error } = await supabase
          .from("FeedComments")
          .select(`
            id,
            content,
            created_at,
            user_id,
            Accounts:user_id ( id, fullName, avatarURL ),
            FeedCommentReactions ( user_id, reaction )
          `)
          .eq("feed_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        rawData = data || [];

      } else {
        // --- POST COMMENTS (Uses 'comment') ---
        // FIX: Changed 'content' to 'comment' to match your table definition
        const { data, error } = await supabase
          .from("PostComments")
          .select(`
            id,
            comment, 
            created_at,
            user_id,
            parent_comment_id,
            Accounts:user_id ( id, fullName, avatarURL ),
            PostCommentReactions ( user_id, reaction )
          `)
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        rawData = data || [];
      }

      // --- PROCESS DATA ---
      const processedComments: CommentWithAuthor[] = rawData.map((c) => {
        const reactions = c.FeedCommentReactions || c.PostCommentReactions || [];
        
        const myReaction = currentUser 
          ? reactions.find((r: any) => r.user_id === currentUser.id)?.reaction 
          : null;

        const reactionCounts: Record<string, number> = {};
        reactions.forEach((r: any) => {
          reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
        });

        const topReactions: ReactionCount[] = Object.entries(reactionCounts)
          .map(([reaction, count]) => ({ reaction, count }))
          .sort((a, b) => b.count - a.count);

        return {
          id: c.id,
          // FIX: Check for both 'comment' (Posts) and 'content' (Feeds)
          comment: c.comment || c.content, 
          created_at: c.created_at,
          parent_comment_id: c.parent_comment_id || null,
          author: {
            id: c.Accounts?.id || c.user_id,
            fullName: c.Accounts?.fullName || "Unknown",
            avatarURL: c.Accounts?.avatarURL || "/DefaultAvatar.svg",
          },
          reactionSummary: {
            totalCount: reactions.length,
            topReactions: topReactions,
          },
          userReactionId: myReaction || null,
        };
      });

      setComments(processedComments);
      setCommentCount(processedComments.length);

    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [postId, isFeed, currentUser]);

  // 3. Initial Load
  useEffect(() => {
    fetchCommentsWithReactions();
  }, [fetchCommentsWithReactions]);

  // 4. Realtime Subscription
  useEffect(() => {
    if (!postId) return;

    const commentTable = isFeed ? "FeedComments" : "PostComments";
    const reactionTable = isFeed ? "FeedCommentReactions" : "PostCommentReactions";
    const idFilter = isFeed ? `feed_id=eq.${postId}` : `post_id=eq.${postId}`;

    const channel = supabase.channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: commentTable, filter: idFilter },
        () => fetchCommentsWithReactions()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: reactionTable },
        () => fetchCommentsWithReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isFeed, fetchCommentsWithReactions]);

  // 5. Handle Reaction
  const handleCommentReaction = useCallback(async (commentId: string, newReactionId: string | null) => {
    if (!currentUser) return;
    
    setReactingCommentId(commentId);

    let oldReactionId: string | null = null;
    setComments((prev) => {
      const target = prev.find(c => c.id === commentId);
      oldReactionId = target?.userReactionId || null;
      return simpleOptimisticUpdate(prev, commentId, newReactionId, oldReactionId);
    });

    try {
      const table = isFeed ? "FeedCommentReactions" : "PostCommentReactions";
      const idColumn = isFeed ? "feed_comment_id" : "comment_id";

      if (newReactionId) {
        const { error } = await supabase
          .from(table)
          .upsert({
            [idColumn]: commentId,
            user_id: currentUser.id,
            reaction: newReactionId
          }, { onConflict: `${idColumn}, user_id` });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .delete()
          .match({ [idColumn]: commentId, user_id: currentUser.id });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Reaction failed:", error);
      setComments((prev) => simpleOptimisticUpdate(prev, commentId, oldReactionId, newReactionId));
    } finally {
      setReactingCommentId(null);
      fetchCommentsWithReactions();
    }
  }, [currentUser, isFeed, fetchCommentsWithReactions]);

  // 6. Post Comment
  const postComment = useCallback(async (commentText: string) => {
    if (!currentUser || !postId || !commentText.trim()) return;

    // Define payload based on type
    let payload: any = {};
    let table = "";

    if (isFeed) {
      table = "FeedComments";
      payload = {
        feed_id: postId,
        user_id: currentUser.id,
        content: commentText.trim(), // Feed uses 'content'
      };
    } else {
      table = "PostComments";
      payload = {
        post_id: postId,
        user_id: currentUser.id,
        comment: commentText.trim(), // Post uses 'comment'
        parent_comment_id: null
      };
    }

    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error posting comment:", error.message);
      return;
    }

    if (data) {
      const newComment: CommentWithAuthor = {
        id: data.id,
        // FIX: Handle response data mapping
        comment: data.comment || data.content, 
        created_at: data.created_at,
        parent_comment_id: data.parent_comment_id || null,
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName || "Me",
          avatarURL: currentUser.avatarURL,
        },
        reactionSummary: { totalCount: 0, topReactions: [] },
        userReactionId: null,
      };

      setComments((prev) => [...prev, newComment]);
      setCommentCount((prev) => prev + 1);
    }
  }, [currentUser, postId, isFeed]);

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