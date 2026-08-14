// --- Filter Types ---

/** Options for sorting posts */
export type SortOption = "Newest First" | "Oldest First";

/** Options for filtering posts by date */
export type DateOption = "Today" | "This Week" | "This Month" | "All Time";

/** Options for filtering posts by visibility */
export type VisibilityOption = "Global" | "Course" | "All";

/**
 * The complete state object for all filters managed by AdvancedFilter.
 */
export interface FilterState {
  sort: SortOption;
  date: DateOption;
  visibility: VisibilityOption;
}

// --- User Types ---

/**
 * Represents the detailed object for the currently authenticated user.
 * Fetched from `getCurrentUserDetails()`.
 */
export interface CurrentUser {
  id: string;
  email?: string;
  fullName?: string | null;
  role?: string;
  course?: string;
  studentID?: string;
  year?: string;
  avatarURL?: string;
}

// --- Post Types ---

/**
 * Represents the raw data structure of a row from the "Posts" table in Supabase.
 * This should match your database schema exactly.
 */
export interface DBPostRow {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  tags: string[] | null;
  type: "announcement" | "highlight" | "feed"; // Added 'feed'
  author_id: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
  visibility: string | null;
}

/**
 * Represents a Post object after being processed for display in the UI.
 * (e.g., dates formatted, null arrays empty). This is the shape for your `posts` state.
 */
export interface PostUI {
  id: string;
  title: string;
  description: string;
  date: string; // Formatted date string for display (e.g., "Oct 30, 2025")
  images: string[]; // Normalized to always be an array
  tags: string[]; // Normalized to always be an array
  type: "announcement" | "highlight" | "feed"; // Added 'feed'
  visibility: string | null;
  author_id: string;
  created_at: string; // Raw ISO string, kept for accurate sorting
}

// --- Component Prop Types ---

/**
 * Data payload required for creating a new post.
 * Used by `onAddPost` in `AddPostsProps`.
 */
export interface NewPostPayload {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight" | "feed"; // Added 'feed'
  visibility: string | null;
  author_id: string;
}

/**
 * Data payload required for updating an existing post.
 * Used by `onUpdatePost` in `AddPostsProps`.
 */
export interface UpdatePostPayload {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight" | "feed"; // Added 'feed'
  visibility: string | null;
}

/**
 * Props for the `AddPosts` component.
 */
export interface AddPostsProps {
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostUI | null; // Use the UI shape for consistency
  currentType?: "announcement" | "highlight" | "feed"; // Added 'feed'
  authorId?: string; // The ID of the user creating the post
}

/**
 * Props for the `UploadButton` component.
 */
export interface UploadButtonProps {
  onUpload?: (files: string[]) => void;
  predefinedImages?: string[];
}

/**
 * Ref handle for the `UploadButton` component, allowing parent
 * to call its internal methods.
 */
export interface UploadButtonHandle {
  uploadAndGetFinalUrls: () => Promise<string[]>;
  getRemovedUrls: () => string[];
  isDirty: () => boolean; // Added to check for changes
}