"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { getFeeds } from "../../../../../supabase/Lib/Feeds/feeds";
import type { User } from "../../../../../supabase/Lib/General/user";
import type { FeedPost } from "../../../../../supabase/Lib/Feeds/types";
import { FilterState } from "../Announcement/Utils/types";
import { getDateRange } from "../../../../../supabase/Lib/Announcement/Filter/supabase-helper";

// UI
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import FeedsLeftBar from "./feedleftbar";
import PLCStream from "./PLCStream";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import AddPosts from "../Announcement/AddPosts/addPosts";
import Posts from "../Announcement/Posts/Posts";
// --- IMPORT FORMAT DATE ---
import formatPostDate from "../Announcement/Utils/formatDate";

// Default Filters
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

  // Filter States
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Load User
  useEffect(() => {
    getCurrentUserDetails().then(setUser);
  }, []);

  // 2. Fetch Posts
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

  // 3. Client-Side Filtering Logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search Filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(lower) ||
          p.author.fullName.toLowerCase().includes(lower)
      );
    }

    // Date Filter
    const dateRange = getDateRange(filters.date);
    if (dateRange) {
      result = result.filter((p) => {
        const pDate = new Date(p.created_at).getTime();
        const start = new Date(dateRange.startDate).getTime();
        const end = new Date(dateRange.endDate).getTime();
        return pDate >= start && pDate <= end;
      });
    }

    // Sort
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

      {/* Left Sidebar with Filters */}
      <FeedsLeftBar
        activeTab={activeTab}
        onTabToggle={setActiveTab}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filters={filters}
      />

      {/* Main Content Area */}
      <div className="ml-[350px] pt-[100px] pb-20 flex flex-col items-center min-h-screen">
        {activeTab === "feed" ? (
          <div className="flex flex-col items-center animate-fadeIn space-y-8">
            {/* Reuse AddPosts Component */}
            <AddPosts
              currentType="feed"
              isFeed={true}
              author={{ fullName: user.fullName, avatarURL: user.avatarURL }}
              authorId={user.id}
            />

            {/* Posts Feed */}
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
                  // --- USE FORMAT HELPER ---
                  date={formatPostDate(post.created_at)}
                  author={{
                    fullName: post.author.fullName,
                    avatarURL: post.author.avatarURL,
                    role: post.author.role,
                  }}
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
              <div className="text-gray-500 mt-10 text-lg font-montserrat">
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : "No posts yet. Be the first!"}
              </div>
            )}
          </div>
        ) : (
          // PLC STREAM
          <div className="animate-fadeIn w-full flex justify-center">
            <PLCStream />
          </div>
        )}
      </div>
    </div>
  );
}
