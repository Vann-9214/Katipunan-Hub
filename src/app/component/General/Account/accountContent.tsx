"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// 1. Added Pen import
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

/* --- NEW: Import Lightbox Hook --- */
import { useImageLightbox } from "../Announcement/ImageAttachment/imageLightboxContent";

// 2. Accept an optional prop for specific profile viewing
interface AccountContentProps {
  targetUserId?: string;
}

export default function AccountContent({ targetUserId }: AccountContentProps) {
  // 'viewedUser' is the profile we are looking at
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  // 'currentUser' is the person logged in (YOU)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modal States
  const [showMainEdit, setShowMainEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);

  // Editing Posts State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);

  // Fetch posts for the VIEWED user
  const {
    posts,
    loading: postsLoading,
    refetch,
  } = useUserPosts(viewedUser?.id);
  const router = useRouter();

  /* --- NEW: Lightbox Control --- */
  const { openLightbox } = useImageLightbox();

  // 3. Determine Ownership
  // If targetUserId is missing, we are on /Account, so we are the owner.
  // If targetUserId matches our ID, we are also the owner.
  const isOwner = !targetUserId || currentUser?.id === viewedUser?.id;

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);

      // A. Always get the logged-in user first (for Navbar and Auth check)
      const loggedIn = await getCurrentUserDetails();
      if (!loggedIn) {
        router.push("/signin");
        return;
      }
      setCurrentUser(loggedIn);

      // B. Determine which profile to show
      if (targetUserId) {
        // CASE 1: Viewing someone else (or yourself via ID)
        if (targetUserId === loggedIn.id) {
          setViewedUser(loggedIn);
        } else {
          // Fetch the OTHER user's details
          const { data: account, error } = await supabase
            .from("Accounts")
            .select(
              "id, fullName, avatarURL, coverURL, bio, location, role, course, studentID, year"
            )
            .eq("id", targetUserId)
            .maybeSingle();

          if (account) {
            // Construct User object manually since getUser helper implies auth session
            setViewedUser({
              id: account.id,
              email: "", // Often hidden for others
              fullName: account.fullName,
              avatarURL: account.avatarURL,
              coverURL: account.coverURL,
              bio: account.bio,
              location: account.location,
              role: account.role,
              course: account.course,
              studentID: account.studentID,
              year: account.year,
            });
          } else {
            console.error("User not found:", error);
            // Handle 404 behavior if needed
          }
        }
      } else {
        // CASE 2: Viewing /Account (My Profile)
        setViewedUser(loggedIn);
      }

      setIsInitialLoading(false);
    };

    loadData();
  }, [router, targetUserId]);

  // Realtime subscription for the VIEWED user's feed
  useEffect(() => {
    if (!viewedUser?.id) return;

    const channel = supabase
      .channel(`account-feeds-${viewedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Feeds",
          filter: `author_id=eq.${viewedUser.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewedUser?.id, refetch]);

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
    // If we are editing, we are likely editing the currentUser/viewedUser (since they are the same)
    setViewedUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  if (isInitialLoading) return <LoadingScreen />;
  if (!viewedUser || !currentUser) return null; // Or a "User Not Found" state

  return (
    <main className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* Navbar uses currentUser */}
      <HomepageTab user={currentUser} />

      {/* --- HEADER SECTION --- */}
      <div className="pt-[20px] pb-4">
        <div className="max-w-[1095px] mx-auto px-4">
          <div className="p-[3px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
            <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] rounded-[22px] overflow-hidden">
              {/* Cover Photo */}
              <div className="relative w-full h-[200px] md:h-[350px] bg-gray-800 overflow-hidden group">
                {viewedUser.coverURL ? (
                  /* --- UPDATED: Cover Photo with Click Handler --- */
                  <Image
                    src={viewedUser.coverURL}
                    alt="Cover"
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                    priority
                    onClick={() => openLightbox([viewedUser.coverURL!], 0)}
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
                    {/* --- UPDATED: Avatar Container with Click Handler --- */}
                    <div
                      className="w-[168px] h-[168px] relative rounded-full overflow-hidden border-[5px] border-[#EFBF04] shadow-2xl bg-[#3a0000] cursor-pointer"
                      onClick={() =>
                        openLightbox(
                          [viewedUser.avatarURL || "/DefaultAvatar.svg"],
                          0
                        )
                      }
                    >
                      <Avatar
                        avatarURL={viewedUser.avatarURL}
                        altText={viewedUser.fullName}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 text-center md:text-left mb-8">
                    <h1 className="text-[32px] font-bold text-white font-montserrat leading-tight drop-shadow-md">
                      {viewedUser.fullName}
                    </h1>
                    <p className="text-[#EFBF04] font-medium text-[16px] uppercase tracking-wide mt-1">
                      {viewedUser.role}
                    </p>
                  </div>

                  {/* Edit Profile Button - ONLY IF OWNER */}
                  {isOwner && (
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
                  )}
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
        {/* LEFT: INTRO & DETAILS */}
        <div className="w-full md:w-[400px] flex-shrink-0 space-y-4">
          <div className="p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-lg">
            <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] p-6 rounded-[18px]">
              <h2 className="text-xl font-bold mb-4 text-white font-montserrat">
                Intro
              </h2>

              <div className="text-center mb-6">
                {viewedUser.bio ? (
                  <p className="text-[15px] text-white/90 font-montserrat whitespace-pre-wrap leading-relaxed">
                    {viewedUser.bio}
                  </p>
                ) : (
                  <p className="text-sm text-white/50 italic">No bio yet.</p>
                )}
              </div>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 text-white/80">
                  <BookOpen size={20} className="text-[#EFBF04]" />
                  <span>
                    Studies{" "}
                    <strong className="text-white">{viewedUser.course}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar size={20} className="text-[#EFBF04]" />
                  <span>
                    Year Level:{" "}
                    <strong className="text-white">{viewedUser.year}</strong>
                  </span>
                </div>
                {viewedUser.location && (
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin size={20} className="text-[#EFBF04]" />
                    <span>
                      Lives in{" "}
                      <strong className="text-white">
                        {viewedUser.location}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-white/80">
                  <Mail size={20} className="text-[#EFBF04]" />
                  <span className="truncate">
                    {viewedUser.email || "Hidden"}
                  </span>
                </div>
              </div>

              {/* Edit Bio - ONLY IF OWNER */}
              {isOwner && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBioEdit(true)}
                  className="w-full cursor-pointer mt-6 bg-[#EFBF04] hover:bg-[#FFD700] text-white/90 font-bold py-2.5 rounded-xl transition-colors shadow-md"
                >
                  Edit Bio & Details
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: POSTS FEED */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-center space-y-8">
            {/* Add Posts - ONLY IF OWNER */}
            {isOwner && (
              <AddPosts
                currentType="feed"
                isFeed={true}
                author={{
                  fullName: currentUser.fullName,
                  avatarURL: currentUser.avatarURL,
                }}
                authorId={currentUser.id}
                externalOpen={editorOpen}
                initialPost={editingPost}
                onExternalClose={handleCloseEditor}
                onUpdatePost={handleUpdatePost}
              />
            )}

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
                  userId={currentUser.id} // Pass viewer ID for reactions
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  images={post.images}
                  visibility={post.visibility}
                  isFeed={true}
                  author={{
                    id: viewedUser.id, // <--- ADDED THIS LINE
                    fullName: viewedUser.fullName,
                    avatarURL: viewedUser.avatarURL,
                    role: viewedUser.role,
                  }}
                  canEdit={isOwner} // Control post editability
                  onEdit={() => handleEditPost(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                />
              ))
            ) : (
              <div className="w-full max-w-[590px] p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
                <div className="bg-white w-full h-full rounded-[18px] flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#EFBF04]/30 bg-gradient-to-b from-[#4e0505] to-[#3a0000] flex items-center gap-3">
                    <div className="p-1.5 bg-white/10 rounded-full border border-white/10">
                      <Pen size={18} className="text-[#EFBF04]" />
                    </div>
                    <h3 className="font-montserrat font-bold text-[18px] text-white tracking-wide">
                      Timeline
                    </h3>
                  </div>
                  <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                      <Pen size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1 font-montserrat">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 text-sm font-ptsans">
                      {isOwner
                        ? "Share something with the community to get started!"
                        : "This user hasn't posted anything yet."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS (Only render if owner) --- */}
      {isOwner && showMainEdit && (
        <EditMainProfileModal
          user={currentUser}
          onClose={() => setShowMainEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {isOwner && showBioEdit && (
        <EditBioDetailsModal
          user={currentUser}
          onClose={() => setShowBioEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </main>
  );
}
