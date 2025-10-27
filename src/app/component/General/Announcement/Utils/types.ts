// types.ts on AddPosts.tsx

export interface PostShape {
  id?: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight";
  visibleTo?: "global" | "college";
  visibleCollege?: string | null;
  author_id?: string;
  visibility?: string | null;
}

export interface UserSummary {
  id: string;
  fullName?: string | null;
  avatarURL?: string | null;
}

export interface AddPostsProps {
  onAddPost?: (post: {
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
    author_id?: string | undefined;
  }) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostShape | null;
  onUpdatePost?: (updated: {
    id: string;
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
  }) => Promise<void> | void;
  currentType?: "announcement" | "highlight";
  author?: UserSummary | null;
  authorId?: string | null;
}

// AnnouncementPageContent/types.ts

// shape of a DB row returned by Supabase for the Posts table
export type DBPostRow = {
  id?: string;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
  createdAt?: string | null; // sometimes createdAt
  images?: string[] | null;
  tags?: string[] | null;
  type?: "announcement" | "highlight" | string | null;
  visibility?: string | null;
  author_id?: string | null;
};

// shape used by the UI (your posts state)
export type PostUI = {
  id?: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight";
  visibility?: string | null;
  author_id?: string;
  created_at?: string | null;
};

// shape of the current user object returned by getCurrentUserDetails()
export type CurrentUser = {
  id?: string;
  email?: string | null;
  fullName?: string | null;
  role?: string | string[] | null;
  course?: string | null;
  studentID?: string | null;
  year?: string | null;
  avatarURL?: string | null;
};

// Types.ts on UploadButton

export interface UploadButtonProps {
  onUpload?: (files: string[]) => void; // optional callback
  predefinedImages?: string[]; // existing server URLs to show initially
}

// exports both methods for parent to call
export interface UploadButtonHandle {
  uploadAndGetFinalUrls: () => Promise<string[]>;
  getRemovedUrls: () => string[];
}