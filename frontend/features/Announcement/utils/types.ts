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
 */
export interface DBPostRow {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  tags: string[] | null;
  type: "announcement";
  author_id: string;
  created_at: string;
  updated_at: string;
  visibility: string | null;
}

/**
 * Represents a Post object after being processed for display in the UI.
 */
export interface PostUI {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  tags: string[];
  type: "announcement";
  visibility: string | null;
  author_id: string;
  created_at: string;
}

// --- Component Prop Types ---

/**
 * Data payload required for creating a new post.
 */
export interface NewPostPayload {
  title: string;
  description: string;
  images: string[] | null;
  tags: string[] | null;
  type: "announcement";
  visibility: string | null;
  author_id: string;
}

/**
 * Data payload required for updating an existing post.
 */
export interface UpdatePostPayload {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  tags: string[] | null;
  type: "announcement";
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
  initialPost?: PostUI | null;
  currentType?: "announcement";
  authorId?: string | null;
}