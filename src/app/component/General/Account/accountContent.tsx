"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pen, MapPin, Calendar, Mail, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// Components
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import LoadingScreen from "../../ReusableComponent/LoadingScreen";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import Posts from "../Announcement/Posts/Posts";
import AddPosts from "../Announcement/AddPosts/addPosts";

// Modals
import EditMainProfileModal from "./editMainProfileModal";
import EditBioDetailsModal from "./editBioDetailsModal";

// Logic
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { useUserPosts } from "../../../../../supabase/Lib/Account/useUserPosts";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { updateFeedPost } from "../../../../../supabase/Lib/Feeds/feeds";
import type { User } from "../../../../../supabase/Lib/General/user";
import type { PostUI, UpdatePostPayload } from "../Announcement/Utils/types";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modal States
  const [showMainEdit, setShowMainEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);

  // Editing Posts State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);

  const { posts, loading: postsLoading, refetch } = useUserPosts(user?.id);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const userDetails = await getCurrentUserDetails();
      if (!userDetails) {
        router.push("/signin");
      } else {
        setUser(userDetails);
        setIsInitialLoading(false);
      }
    };
    loadUserData();
  }, [router]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`account-feeds-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Feeds",
          filter: `author_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // --- Handlers ---
  const handleEditPost = (postId: string) => {
    const postToEdit = posts.find((p) => p.id === postId);
    if (!postToEdit) return;
    setEditingPost(postToEdit);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingPost(null);
  };

  const handleUpdatePost = async (updatedPost: UpdatePostPayload) => {
    if (!updatedPost.description) return;
    try {
      await updateFeedPost(
        updatedPost.id,
        updatedPost.description,
        updatedPost.images || []
      );
      handleCloseEditor();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase.from("Feeds").delete().eq("id", postId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  const handleUpdateSuccess = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  if (isInitialLoading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F0F2F5] pb-20">
      <HomepageTab user={user} />

      {/* --- HEADER SECTION (Themed) --- */}
      <div className="pt-[20px] pb-4">
        <div className="max-w-[1095px] mx-auto px-4">
          {/* Gold Gradient Border Container */}
          <div className="p-[3px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
            {/* Maroon Inner Background */}
            <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] rounded-[22px] overflow-hidden">
              {/* Cover Photo */}
              <div className="relative w-full h-[200px] md:h-[350px] bg-gray-800 overflow-hidden group">
                {user.coverURL ? (
                  <Image
                    src={user.coverURL}
                    alt="Cover"
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#2a0303] to-[#4e0505]">
                    <span className="text-white/20 font-bold text-4xl select-none font-montserrat tracking-widest">
                      KATIPUNAN HUB
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Bar */}
              <div className="px-4 md:px-8 pb-6">
                <div className="flex flex-col md:flex-row items-center md:items-end relative -mt-[80px] md:-mt-[50px] gap-4 md:gap-6">
                  {/* Avatar */}
                  <div className="relative z-10">
                    <div className="w-[168px] h-[168px] relative rounded-full overflow-hidden border-[5px] border-[#EFBF04] shadow-2xl bg-[#3a0000]">
                      <Avatar
                        avatarURL={user.avatarURL}
                        altText={user.fullName}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 text-center md:text-left mb-8">
                    <h1 className="text-[32px] font-bold text-white font-montserrat leading-tight drop-shadow-md">
                      {user.fullName}
                    </h1>
                    <p className="text-[#EFBF04] font-medium text-[16px] uppercase tracking-wide mt-1">
                      {user.role}
                    </p>
                  </div>

                  {/* Edit Profile Button */}
                  <div className="mb-6 md:mb-4 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowMainEdit(true)}
                      className="bg-white/10 cursor-pointer hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg backdrop-blur-sm"
                    >
                      <Pen size={16} className="text-[#EFBF04]" />
                      <span className="font-montserrat">Edit Profile</span>
                    </motion.button>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 w-full mt-6 mb-1" />

                {/* Tabs */}
                <div className="flex gap-6 px-2">
                  <button className="px-2 py-3 text-[#EFBF04] font-bold border-b-[3px] border-[#EFBF04] transition-all">
                    Posts
                  </button>
                  <button className="px-2 py-3 text-white/70 font-semibold hover:text-white transition-colors">
                    Friends
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-[1095px] mx-auto px-4 mt-6 flex flex-col md:flex-row gap-6">
        {/* LEFT: INTRO & DETAILS (Themed) */}
        <div className="w-full md:w-[400px] flex-shrink-0 space-y-4">
          {/* Gold Border Wrapper */}
          <div className="p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-lg">
            {/* Maroon Inner */}
            <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] p-6 rounded-[18px]">
              <h2 className="text-xl font-bold mb-4 text-white font-montserrat">
                Intro
              </h2>

              {/* Bio */}
              <div className="text-center mb-6">
                {user.bio ? (
                  <p className="text-[15px] text-white/90 font-montserrat whitespace-pre-wrap leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-sm text-white/50 italic">No bio yet.</p>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 text-white/80">
                  <BookOpen size={20} className="text-[#EFBF04]" />
                  <span>
                    Studies{" "}
                    <strong className="text-white">{user.course}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar size={20} className="text-[#EFBF04]" />
                  <span>
                    Year Level:{" "}
                    <strong className="text-white">{user.year}</strong>
                  </span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin size={20} className="text-[#EFBF04]" />
                    <span>
                      Lives in{" "}
                      <strong className="text-white">{user.location}</strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-white/80">
                  <Mail size={20} className="text-[#EFBF04]" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Trigger Bio/Details Edit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBioEdit(true)}
                className="w-full cursor-pointer mt-6 bg-[#EFBF04] hover:bg-[#FFD700] text-white/90 font-bold py-2.5 rounded-xl transition-colors shadow-md"
              >
                Edit Bio & Details
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT: POSTS FEED */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-center space-y-8">
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

            {postsLoading ? (
              <div className="py-10 text-gray-400 font-montserrat">
                Loading posts...
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Posts
                  key={post.id}
                  postId={post.id}
                  type={post.type}
                  userId={user.id}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  images={post.images}
                  visibility={post.visibility}
                  isFeed={true}
                  author={{
                    fullName: user.fullName,
                    avatarURL: user.avatarURL,
                    role: user.role,
                  }}
                  canEdit={true}
                  onEdit={() => handleEditPost(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                />
              ))
            ) : (
              <div className="w-full p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] opacity-80">
                <div className="bg-white p-8 rounded-[18px] text-center">
                  <h3 className="text-lg font-bold text-gray-700 mb-1 font-montserrat">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 text-sm font-ptsans">
                    Share something with the community to get started!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showMainEdit && (
        <EditMainProfileModal
          user={user}
          onClose={() => setShowMainEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {showBioEdit && (
        <EditBioDetailsModal
          user={user}
          onClose={() => setShowBioEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </main>
  );
}
