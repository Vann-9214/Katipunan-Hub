"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pen, MapPin, Calendar, Mail, BookOpen } from "lucide-react";

// Components
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import LoadingScreen from "../../ReusableComponent/LoadingScreen";
import Avatar from "@/app/component/ReusableComponent/Avatar"; // Reverted to standard Avatar
import Posts from "../Announcement/Posts/Posts";

// Modals
import EditMainProfileModal from "./editMainProfileModal";
import EditBioDetailsModal from "./editBioDetailsModal";

// Logic
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { useUserPosts } from "../../../../../supabase/Lib/Account/useUserPosts";
import type { User } from "../../../../../supabase/Lib/General/user";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modal States
  const [showMainEdit, setShowMainEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);

  const { posts, loading: postsLoading } = useUserPosts(user?.id);
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

  const handleUpdateSuccess = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  if (isInitialLoading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F0F2F5] pb-20">
      <HomepageTab user={user} />

      {/* HEADER SECTION */}
      <div className="bg-white shadow-sm pb-4">
        <div className="max-w-[1095px] mx-auto relative">
          {/* Cover Photo */}
          <div className="relative w-full h-[200px] md:h-[350px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl overflow-hidden group">
            {user.coverURL ? (
              <Image
                src={user.coverURL}
                alt="Cover"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#8B0E0E] to-[#4e0505]">
                <span className="text-white/30 font-bold text-4xl select-none">
                  KATIPUNAN HUB
                </span>
              </div>
            )}

            {/* Only visual feedback, clicking logic moved to modal */}
          </div>

          {/* Profile Bar */}
          <div className="px-4 md:px-8 pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-end relative -mt-[80px] md:-mt-[40px] gap-4 md:gap-6">
              {/* Avatar - NON CLICKABLE HERE */}
              <div className="relative z-10 p-1 bg-white rounded-full">
                <div className="w-[168px] h-[168px] relative rounded-full overflow-hidden border-[4px] border-white shadow-md bg-white">
                  <Avatar
                    avatarURL={user.avatarURL}
                    altText={user.fullName}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Name & Role */}
              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-[32px] font-bold text-black font-montserrat leading-tight">
                  {user.fullName}
                </h1>
                <p className="text-gray-600 font-medium text-[16px]">
                  {user.role}
                </p>
              </div>

              {/* Edit Profile Button (Triggers Main Edit Modal) */}
              <div className="mb-4 md:mb-2 flex-shrink-0">
                <button
                  onClick={() => setShowMainEdit(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Pen size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-gray-300 w-full mt-6 mb-1" />

            {/* Tabs */}
            <div className="flex gap-1">
              <button className="px-4 py-3 text-[#8B0E0E] font-semibold border-b-[3px] border-[#8B0E0E]">
                Posts
              </button>
              <button className="px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">
                Friends
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-[1095px] mx-auto px-4 md:px-0 mt-6 flex flex-col md:flex-row gap-6">
        {/* LEFT: INTRO & DETAILS */}
        <div className="w-full md:w-[400px] flex-shrink-0 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-black font-montserrat">
              Intro
            </h2>

            {/* Bio */}
            <div className="text-center mb-6">
              {user.bio ? (
                <p className="text-[15px] text-gray-800 font-montserrat whitespace-pre-wrap">
                  {user.bio}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No bio yet.</p>
              )}
            </div>

            {/* Details List */}
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 text-gray-700">
                <BookOpen size={20} className="text-gray-400" />
                <span>
                  Studies <strong className="text-black">{user.course}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={20} className="text-gray-400" />
                <span>
                  Year Level:{" "}
                  <strong className="text-black">{user.year}</strong>
                </span>
              </div>
              {/* New Location Field */}
              {user.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={20} className="text-gray-400" />
                  <span>
                    Lives in{" "}
                    <strong className="text-black">{user.location}</strong>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={20} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            {/* Trigger Bio/Details Edit */}
            <button
              onClick={() => setShowBioEdit(true)}
              className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-2 rounded-lg transition-colors cursor-pointer"
            >
              Edit Bio & Details
            </button>
          </div>
        </div>

        {/* RIGHT: POSTS FEED */}
        <div className="flex-1 min-w-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-3 items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <Avatar avatarURL={user.avatarURL} className="w-full h-full" />
            </div>
            <div className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full px-4 py-2.5 w-full cursor-pointer transition-colors text-sm font-medium">
              What&apos;s on your mind, {user.fullName.split(" ")[0]}?
            </div>
          </div>

          <div className="flex flex-col items-center">
            {postsLoading ? (
              <div className="py-10 text-gray-400">Loading posts...</div>
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
                  canEdit={true}
                  visibility={post.visibility}
                  isFeed={true}
                  author={{
                    fullName: user.fullName,
                    avatarURL: user.avatarURL,
                    role: user.role,
                  }}
                />
              ))
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-200 w-full">
                <h3 className="text-lg font-bold text-gray-700 mb-1">
                  No posts yet
                </h3>
                <p className="text-gray-500">
                  Share something with the community!
                </p>
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
