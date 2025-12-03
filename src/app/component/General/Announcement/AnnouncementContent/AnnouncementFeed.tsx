// src/app/component/General/Announcement/AnnouncementContent/AnnouncementFeed.tsx
"use client";

import AddPosts from "../AddPosts/addPosts";
import Posts from "../Posts/Posts";
import { PostUI, NewPostPayload, UpdatePostPayload } from "../Utils/types";
import formatPostDate from "../Utils/formatDate";
import { Megaphone } from "lucide-react";

// Component Interface
interface AnnouncementFeedProps {
  isAdmin: boolean;
  currentUserId: string;
  currentType: "announcement" | "highlight";
  filteredPosts: PostUI[];
  editorOpen: boolean;
  editingPost: PostUI | null;
  onAddPost: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost: (post: UpdatePostPayload) => Promise<void> | void;
  onDeletePost: (id: string) => void;
  onEditPost: (id: string) => void;
  onCloseEditor: () => void;
  searchTerm: string;
}

// Component
export default function AnnouncementFeed({
  isAdmin,
  currentUserId,
  currentType,
  filteredPosts,
  editorOpen,
  editingPost,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onEditPost,
  onCloseEditor,
  searchTerm,
}: AnnouncementFeedProps) {
  // Render
  return (
    <div className="flex items-center justify-center mt-20 gap-10">
      <div className="space-y-8 flex flex-col items-center">
        {isAdmin && (
          <AddPosts
            onAddPost={onAddPost}
            onUpdatePost={onUpdatePost}
            externalOpen={editorOpen}
            onExternalClose={onCloseEditor}
            initialPost={editingPost}
            currentType={currentType}
            authorId={currentUserId}
          />
        )}
        {filteredPosts.length === 0 ? (
          // --- EDITED: "No Posts" Card with Gold/Maroon Theme ---
          <div className="w-[590px] p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
            <div className="bg-white w-full h-full rounded-[18px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#EFBF04]/30 bg-gradient-to-b from-[#4e0505] to-[#3a0000] flex items-center gap-3">
                <div className="p-1.5 bg-white/10 rounded-full border border-white/10">
                  <Megaphone size={18} className="text-[#EFBF04]" />
                </div>
                <h3 className="font-montserrat font-bold text-[18px] text-white tracking-wide">
                  {/* Dynamic Header Text */}
                  {currentType === "highlight" ? "Highlights" : "Announcements"}
                </h3>
              </div>
              {/* Body */}
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                  <Megaphone size={24} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1 font-montserrat">
                  {/* Dynamic Body Text */}
                  {searchTerm
                    ? "No results found"
                    : currentType === "highlight"
                    ? "No highlights yet"
                    : "No announcements yet"}
                </h3>
                <p className="text-gray-500 text-sm font-ptsans">
                  {searchTerm
                    ? `We couldn't find anything matching "${searchTerm}"`
                    : "Stay tuned for the latest updates and news."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Posts
              key={post.id}
              postId={post.id!}
              type={post.type}
              userId={currentUserId}
              title={post.title}
              description={post.description}
              date={formatPostDate(post.created_at || post.date)}
              images={post.images}
              onDelete={() => onDeletePost(post.id!)}
              onEdit={() => onEditPost(post.id!)}
              canEdit={isAdmin}
              visibility={post.visibility}
            />
          ))
        )}
      </div>
    </div>
  );
}
