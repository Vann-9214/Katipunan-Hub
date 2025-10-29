"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// --- Child Components ---
import AdvancedFilter from "../General/AdvanceFilter";
import AddPosts from "../AddPosts/addPosts";
import TagsFilter from "../General/TagsFilter";
import ButtonFIlter from "../General/ButtonFilter";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "../General/SearchFilter";
import Posts from "../Posts/Posts";

// --- Types ---
import {
  type DBPostRow,
  type PostUI,
  type CurrentUser,
  type FilterState, // 👈 Import the main filter state type
  type SortOption,
  type DateOption,
  type VisibilityOption,
} from "../Utils/types"; // 👈 Adjust path as needed

// --- Constants & Utils ---
import { VISIBILITY, programToCollege } from "../Utils/constants";
import { shapePostForUI } from "./utils";
import formatPostDate from "../Utils/formatDate";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import { getDateRange } from "../../../../../../supabase/Lib/Announcement/Filter/supabase-helper"; // 👈 Import your new helper

// --- Default State ---
const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "All Time", // Default to 'All Time'
  visibility: "Global",
};

export default function AnnouncementPageContent() {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Post editor control
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"announcement" | "highlight">(
    "announcement"
  );

  // Client-side filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Supabase client
  const supabase = createClientComponentClient();

  // --- Fetch current user once ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await getCurrentUserDetails();
        if (isMounted) setCurrentUser(user);
      } catch (err) {
        console.error("Error getting current user details:", err);
        if (isMounted) setCurrentUser(null);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Derived User Data ---
  const { id, role, course } = currentUser || {};

  const resolveUserCollegeCode = (userCourse: string | undefined | null) => {
    if (!userCourse) return null;
    const lc = String(userCourse).toLowerCase();
    if (programToCollege[lc]) return programToCollege[lc];
    // Fallback for simple codes like 'cba', 'ccs' etc.
    if (Object.values(programToCollege).includes(lc)) return lc;
    return null;
  };

  const userCollegeCode = useMemo(
    () => resolveUserCollegeCode(course),
    [course]
  );

  // --- 🥇 MAIN DATA FETCHING FUNCTION ---
  const fetchPosts = useCallback(
    async (currentFilters: FilterState, uc: string | null) => {
      console.log("Fetching with filters:", currentFilters);
      try {
        let query = supabase
          .from("Posts")
          .select("*")
          .filter("type", "in", '("announcement", "highlight")');

        // 1. Apply Date Filter
        const dateRange = getDateRange(currentFilters.date);
        if (dateRange) {
          query = query.gte("created_at", dateRange.startDate);
          query = query.lte("created_at", dateRange.endDate);
        }

        // 2. Apply Visibility Filter from state
        // This is the user's *choice* from the filter UI
        if (currentFilters.visibility === "Global") {
          query = query.eq("visibility", VISIBILITY.GLOBAL);
        } else if (currentFilters.visibility === "Course" && uc) {
          query = query.eq("visibility", uc);
        }
        // If 'All', we don't add a specific UI filter,
        // but the baseline security filter below still applies.

        // 3. Apply BASELINE Security Filter
        // Ensures user can *only* ever see 'Global' or their own 'Course' posts
        if (uc) {
          query = query.or(
            `visibility.eq.${VISIBILITY.GLOBAL},visibility.eq.${uc},visibility.is.null`
          );
        } else {
          // e.g., Admin, or user with no college code
          query = query.or(
            `visibility.eq.${VISIBILITY.GLOBAL},visibility.is.null`
          );
        }

        // 4. Apply Sort Filter
        const isAscending = currentFilters.sort === "Oldest First";
        query = query.order("created_at", { ascending: isAscending });

        // 5. Execute Query
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching posts:", error);
          setPosts([]); // Set empty on error
          return;
        }

        // 6. Map to UI shape
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows
          .map((row) => shapePostForUI(row as DBPostRow))
          .filter((x): x is PostUI => x !== null);

        setPosts(mapped);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Unexpected error fetching posts:", err.message);
        } else {
          console.error("Unexpected error fetching posts:", err);
        }
      }
    },
    [supabase] // Only depends on supabase client
  );

  // --- Run fetch when user or filters change ---
  useEffect(() => {
    if (!currentUser) return; // Wait for user data
    fetchPosts(filters, userCollegeCode);
  }, [currentUser, filters, userCollegeCode, fetchPosts]);

  // --- Filter Change Handler ---
  const handleFilterChange = (newFilters: FilterState) => {
    console.log("New filters applied:", newFilters);
    setFilters(newFilters);
  };

  // --- Post CRUD Handlers ---

  const handleAddPost = async (newPostData: {
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
    author_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("Posts")
        .insert([newPostData])
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again.");
        return;
      }

      const newlyAddedPost = shapePostForUI(data);
      if (newlyAddedPost) {
        // Add to state, respecting current sort order
        setPosts((prev) =>
          filters.sort === "Newest First"
            ? [newlyAddedPost, ...prev]
            : [...prev, newlyAddedPost]
        );
      }
    } catch (err) {
      console.error("Unexpected error creating post:", err);
      alert("An unexpected error occurred.");
    }
  };

  const handleUpdatePost = async (updatedPost: {
    id?: string;
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
  }) => {
    const { id: postId, ...postUpdateData } = updatedPost;
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from("Posts")
        .update(postUpdateData)
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        console.error("Error updating post:", error);
        alert("Failed to update post. Please try again.");
        return;
      }

      const freshlyUpdatedPost = shapePostForUI(data);
      if (freshlyUpdatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? freshlyUpdatedPost : p))
        );
      }

      setEditingPost(null);
      setEditorOpen(false);
    } catch (err) {
      console.error("Unexpected error updating post:", err);
      alert("An unexpected error occurred while updating.");
    }
  };

  const handleDelete = async (idToDelete: string) => {
    const postToDelete = posts.find((p) => p.id === idToDelete);
    if (!postToDelete) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${postToDelete.title}"?`
      )
    ) {
      return;
    }

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from("Posts")
        .delete()
        .eq("id", idToDelete);

      if (dbError) throw dbError;

      // 2. Delete images from Storage
      if (postToDelete.images && postToDelete.images.length > 0) {
        const imagePaths = postToDelete.images
          .map((url) => {
            try {
              const urlParts = new URL(url).pathname.split("/");
              // Path should be "posts/filename.jpg"
              return urlParts.slice(urlParts.indexOf("posts")).join("/");
            } catch (e) {
              return null;
            }
          })
          .filter((path): path is string => !!path);

        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("posts") // bucket name
            .remove(imagePaths);

          if (storageError) {
            console.error("Error deleting images from storage:", storageError);
            // Non-fatal, continue to remove post from UI
          }
        }
      }

      // 3. Update UI
      setPosts((prev) => prev.filter((p) => p.id !== idToDelete));
      if (editingPost?.id === idToDelete) {
        setEditingPost(null);
        setEditorOpen(false);
      }
      alert("Post deleted successfully.");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting the post.");
    }
  };

  const handleEdit = (idToEdit: string) => {
    const post = posts.find((p) => p.id === idToEdit);
    if (!post) return;
    setEditingPost(post);
    setEditorOpen(true);
  };

  // --- Memoized Derived State (for client-side filtering) ---

  // `derivedTags` now respects the DB-level filters
  const derivedTags = useMemo(() => {
    const candidate = posts.filter((p) => p.type === activeTab);
    return Array.from(
      new Set(
        candidate
          .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
          .filter(Boolean)
      )
    );
  }, [posts, activeTab]);

  // `filteredPosts` is now *much* simpler.
  // It only handles client-side filtering (search, tags, tab).
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    // 1. Filter by active tab
    list = list.filter((p) => p.type === activeTab);

    // 2. Filter by search term
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    // 3. Filter by active tags
    if (activeTags.length > 0) {
      list = list.filter((p) =>
        p.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    // 🛑 Sort & Visibility filtering is already done by Supabase!

    return list;
  }, [posts, activeTab, searchTerm, activeTags]);

  // --- Loading UI ---
  if (!currentUser) {
    return (
      <div className="p-[25px]">
        <HomepageTab />
        <p className="mt-20 text-gray-500 text-lg font-montserrat">
          Loading user data...
        </p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="p-[25px] flex-col">
      <HomepageTab />

      {/* Left Side */}
      <div className="bg-white w-[350px] left-0 top-0 fixed h-full pt-28 flex flex-col items-center overflow-y-auto">
        <div className="mb-8">
          <ToggleButton
            width="w-[320px]"
            height="h-[40px]"
            textSize="text-[16px]"
            leftLabel="Announcement"
            rightLabel="Highlights"
            leftActiveBg="bg-maroon"
            rightActiveBg="bg-maroon"
            active={activeTab === "announcement" ? "left" : "right"}
            onToggle={(side) => {
              setActiveTab(side === "left" ? "announcement" : "highlight");
              setActiveTags([]);
            }}
          />
        </div>
        <div className="shrink-0 flex flex-col gap-3 mb-5">
          <SearchFilter onSearchChange={(val) => setSearchTerm(val)} />
          <AdvancedFilter
            onChange={handleFilterChange}
            initialFilters={filters}
          />
          <TagsFilter
            tags={derivedTags}
            onTagClick={(selectedTags: string[]) => setActiveTags(selectedTags)}
          />
        </div>
      </div>

      {/* Right Side (Placeholder) */}
      <div className="bg-gray-200 w-[350px] right-0 top-0 fixed h-full"></div>

      {/* Main Posts */}
      <div className="flex items-center justify-center mt-20 gap-10">
        <div className="space-y-8 flex flex-col items-center">
          {role &&
            (role.includes("Platform Administrator") ||
              role.includes("Announcements Moderator")) && (
              <AddPosts
                onAddPost={handleAddPost}
                onUpdatePost={handleUpdatePost}
                externalOpen={editorOpen}
                onExternalClose={() => {
                  setEditorOpen(false);
                  setEditingPost(null);
                }}
                initialPost={editingPost ?? null}
                currentType={activeTab}
                authorId={id}
              />
            )}
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-[18px] w-[800px] text-center font-montserrat">
              No posts available at the moment.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <Posts
                key={post.id} // 👈 Use unique ID for key
                postId={post.id!}
                userId={id}
                title={post.title}
                description={post.description}
                date={formatPostDate(post.created_at || post.date)}
                images={post.images}
                onDelete={() => handleDelete(post.id!)}
                onEdit={() => handleEdit(post.id!)}
                canEdit={
                  role?.includes("Platform Administrator") ||
                  role?.includes("Announcements Moderator")
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
