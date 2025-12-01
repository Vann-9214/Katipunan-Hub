"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import {
  getFeeds,
  updateFeedPost,
} from "../../../../../supabase/Lib/Feeds/feeds";
import type { User } from "../../../../../supabase/Lib/General/user";
import type { FeedPost } from "../../../../../supabase/Lib/Feeds/types";
import {
  FilterState,
  PostUI,
  UpdatePostPayload,
} from "../Announcement/Utils/types";
import { getDateRange } from "../../../../../supabase/Lib/Announcement/Filter/supabase-helper";
import { Newspaper } from "lucide-react";
import { useSearchParams } from "next/navigation";

// UI
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import FeedsLeftBar from "./feedleftbar";
import PLCStream from "./PLCStream";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import AddPosts from "../Announcement/AddPosts/addPosts";
import Posts from "../Announcement/Posts/Posts";
import formatPostDate from "../Announcement/Utils/formatDate";

const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "All Time",
  visibility: "Global",
};

// --- OPTIMIZATION CONSTANTS: Define posts per page for pagination ---
const POSTS_PER_PAGE = 10;

export default function FeedsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "plc">("feed");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");

  // --- NEW: PAGINATION STATE ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    getCurrentUserDetails().then(setUser);
  }, []);

  // --- OPTIMIZED: fetchPosts now handles initial load and loading more, and returns if more data exists ---
  const fetchPosts = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 0 : page;

      // Do not set global loading state on subsequent fetches
      if (reset) {
        setIsLoading(true);
      } else if (currentPage > 0) {
        setIsFetchingMore(true);
      }

      try {
        // Fetch data using the new paginated function
        const { posts: newPosts, count } = await getFeeds(
          currentPage,
          POSTS_PER_PAGE
        );

        const newHasMore =
          count !== null
            ? (currentPage + 1) * POSTS_PER_PAGE < count
            : newPosts.length === POSTS_PER_PAGE;

        if (reset) {
          setPosts(newPosts);
          setPage(0); // Ensure page resets for filtering/sorting
        } else {
          // Append new posts to existing list
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(newHasMore);
      } catch (e) {
        console.error("Failed to fetch posts:", e);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [page]
  );

  // --- NEW: Load More Handler ---
  const handleLoadMore = () => {
    if (!hasMore || isLoading || isFetchingMore) return;
    setPage((prev) => prev + 1);
  };

  // --- EXISTING: Initial fetch on component mount and when page changes for loading more ---
  useEffect(() => {
    // Only reset (full fetch) if page is 0, otherwise it's a "load more" fetch
    fetchPosts(page === 0);
  }, [page, fetchPosts]);

  // --- OPTIMIZED: Realtime listener no longer calls fetchPosts (Fixes Refetch Storm) ---
  useEffect(() => {
    const channel = supabase
      .channel("realtime-feeds")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Feeds" },
        // --- PERFORMANCE FIX: Prepend the new post to state instead of re-fetching everything ---
        async (payload) => {
          const newFeed: any = payload.new;

          // Fetch author details for the new post only (minimal database impact)
          const { data: authorData } = await supabase
            .from("Accounts")
            .select("id, fullName, avatarURL, role")
            .eq("id", newFeed.author_id)
            .maybeSingle();

          if (authorData) {
            const newPostWithAuthor: FeedPost = {
              id: newFeed.id,
              content: newFeed.content,
              images: newFeed.images || [],
              created_at: newFeed.created_at,
              author: authorData,
            };
            // Prepend the new post to the posts array
            setPosts((prevPosts) => [newPostWithAuthor, ...prevPosts]);
            // Reset page counter so next scroll starts from the top.
            setPage(0);
          }
        }
      )
      .on(
        // Handle UPDATES via Realtime to keep the existing list fresh
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Feeds" },
        (payload) => {
          const updatedFeed: any = payload.new;
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === updatedFeed.id
                ? {
                    ...post,
                    content: updatedFeed.content,
                    images: updatedFeed.images,
                  }
                : post
            )
          );
        }
      )
      .on(
        // Handle DELETES via Realtime
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Feeds" },
        (payload) => {
          const deletedFeed: any = payload.old;
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post.id !== deletedFeed.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- EXISTING: SCROLL TO POST LOGIC (Unchanged) ---
  useEffect(() => {
    const targetId = searchParams.get("id");
    if (targetId && posts.length > 0 && activeTab === "feed") {
      // Slight delay to allow rendering
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight effect
          element.style.transition =
            "transform 0.5s ease, box-shadow 0.5s ease";
          element.style.transform = "scale(1.02)";
          element.style.boxShadow = "0 0 25px rgba(239, 191, 4, 0.6)"; // Gold glow

          setTimeout(() => {
            element.style.transform = "scale(1)";
            element.style.boxShadow = "none";
          }, 2000);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [posts, searchParams, activeTab]);

  const handleEdit = (feedId: string) => {
    const postToEdit = posts.find((p) => p.id === feedId);
    if (!postToEdit) return;
    const uiPost: PostUI = {
      id: postToEdit.id,
      title: "",
      description: postToEdit.content,
      images: postToEdit.images,
      tags: [],
      type: "feed",
      visibility: "global",
      author_id: postToEdit.author.id,
      created_at: postToEdit.created_at,
      date: formatPostDate(postToEdit.created_at),
    };
    setEditingPost(uiPost);
    setEditorOpen(true);
  };

  const handleUpdatePost = async (updatedPost: UpdatePostPayload) => {
    if (!updatedPost.description) return;
    try {
      await updateFeedPost(
        updatedPost.id,
        updatedPost.description,
        updatedPost.images || []
      );
      setEditorOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating feed:", error);
      alert("Failed to update post.");
    }
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingPost(null);
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(lower) ||
          p.author.fullName.toLowerCase().includes(lower)
      );
    }
    const dateRange = getDateRange(filters.date);
    if (dateRange) {
      result = result.filter((p) => {
        const pDate = new Date(p.created_at).getTime();
        const start = new Date(dateRange.startDate).getTime();
        const end = new Date(dateRange.endDate).getTime();
        return pDate >= start && pDate <= end;
      });
    }
    if (filters.sort === "Oldest First") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return result;
  }, [posts, searchTerm, filters]);

  if (!user) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageTab user={user} />
      <FeedsLeftBar
        activeTab={activeTab}
        onTabToggle={setActiveTab}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filters={filters}
        user={user}
      />

      <div className="ml-[350px] pt-[100px] pb-20 flex flex-col items-center min-h-screen">
        {activeTab === "feed" ? (
          <div className="flex flex-col items-center animate-fadeIn space-y-8">
            <AddPosts
              currentType="feed"
              isFeed={true}
              author={{ fullName: user.fullName, avatarURL: user.avatarURL }}
              authorId={user.id}
              externalOpen={editorOpen}
              initialPost={editingPost}
              onExternalClose={handleCloseEditor}
              onUpdatePost={handleUpdatePost}
            />

            {isLoading && page === 0 ? ( // Only show full loading on initial fetch
              <div className="mt-10 text-gray-400 font-montserrat">
                Loading feeds...
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post) => (
                  <Posts
                    key={post.id}
                    postId={post.id}
                    userId={user.id}
                    type="feed"
                    isFeed={true}
                    title=""
                    description={post.content}
                    images={post.images}
                    date={formatPostDate(post.created_at)}
                    author={{
                      id: post.author.id,
                      fullName: post.author.fullName,
                      avatarURL: post.author.avatarURL,
                      role: post.author.role,
                    }}
                    onEdit={() => handleEdit(post.id)}
                    onDelete={
                      post.author.id === user.id
                        ? async () => {
                            if (confirm("Delete this post?")) {
                              await supabase
                                .from("Feeds")
                                .delete()
                                .eq("id", post.id);
                            }
                          }
                        : undefined
                    }
                    canEdit={post.author.id === user.id}
                  />
                ))}

                {/* --- NEW: Load More Button for Pagination --- */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    className="mt-4 px-6 py-2 rounded-full font-bold text-sm text-white bg-[#8B0E0E] hover:bg-[#A81212] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isFetchingMore ? "Loading more..." : "Load More Feeds"}
                  </button>
                )}
              </>
            ) : (
              <div className="w-[590px] p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
                <div className="bg-white w-full h-full rounded-[18px] flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#EFBF04]/30 bg-gradient-to-b from-[#4e0505] to-[#3a0000] flex items-center gap-3">
                    <div className="p-1.5 bg-white/10 rounded-full border border-white/10">
                      <Newspaper size={18} className="text-[#EFBF04]" />
                    </div>
                    <h3 className="font-montserrat font-bold text-[18px] text-white tracking-wide">
                      News Feed
                    </h3>
                  </div>
                  <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                      <Newspaper size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1 font-montserrat">
                      {searchTerm ? "No results found" : "No posts yet"}
                    </h3>
                    <p className="text-gray-500 text-sm font-ptsans">
                      {searchTerm
                        ? `We couldn't find anything matching "${searchTerm}"`
                        : "Be the first to share something with the community!"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fadeIn w-full flex justify-center">
            <PLCStream />
          </div>
        )}
      </div>
    </div>
  );
}
