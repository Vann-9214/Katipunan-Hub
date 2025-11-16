"use client";

import AddPosts from "../AddPosts/addPosts";
import Posts from "../Posts/Posts";
import { PostUI, NewPostPayload, UpdatePostPayload } from "../Utils/types";
import formatPostDate from "../Utils/formatDate";

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
          <p className="text-gray-500 text-[18px] w-[800px] text-center font-montserrat">
            No posts available at the moment.
          </p>
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
