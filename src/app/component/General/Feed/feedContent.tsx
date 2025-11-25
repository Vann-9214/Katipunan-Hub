"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { getFeeds } from "../../../../../supabase/Lib/Feeds/feeds";
import type { User } from "../../../../../supabase/Lib/General/user";
import type { FeedPost } from "../../../../../supabase/Lib/Feeds/types";

// UI
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import FeedsLeftBar from "./feedleftbar";
import FeedCard from "./feedcard";
import PLCStream from "./PLCStream";
import AddFeedModal from "./addfeedmodal";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import Image from "next/image";

export default function FeedsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "plc">("feed");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    // Realtime
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

  if (!user) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageTab user={user} />

      {/* Left Sidebar */}
      <FeedsLeftBar activeTab={activeTab} onTabToggle={setActiveTab} />

      {/* Main Content Area */}
      <div className="ml-[350px] pt-[100px] pb-20 flex flex-col items-center min-h-screen">
        {activeTab === "feed" ? (
          <div className="flex flex-col items-center animate-fadeIn">
            {/* Create Post Trigger (Visible Button) */}
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="w-[590px] bg-white p-4 rounded-[15px] shadow-sm border border-gray-200 mb-8 cursor-pointer flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 relative">
                {user.avatarURL && (
                  <Image
                    src={user.avatarURL}
                    alt="Me"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 h-10 rounded-full bg-gray-100 flex items-center px-4 text-gray-500 font-medium">
                What's on your mind, {user.fullName.split(" ")[0]}?
              </div>
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="mt-10 text-gray-400">Loading feeds...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => <FeedCard key={post.id} post={post} />)
            ) : (
              <div className="text-gray-500 mt-10 text-lg">
                No posts yet. Be the first!
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

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        authorId={user.id}
        onSuccess={fetchPosts}
      />
    </div>
  );
}
