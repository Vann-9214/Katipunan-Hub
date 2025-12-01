"use client";

import { useState, useEffect, useMemo } from "react";
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

export default function FeedsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "plc">("feed");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    getCurrentUserDetails().then(setUser);
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const data = await getFeeds();
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("realtime-feeds")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Feeds" },
        fetchPosts
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- NEW: SCROLL TO POST LOGIC ---
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

            {isLoading ? (
              <div className="mt-10 text-gray-400 font-montserrat">
                Loading feeds...
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
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
              ))
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
