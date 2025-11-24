"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useDeferredValue,
} from "react";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import AnnouncementLeftBar from "./AnnouncementLeftBar";
import AnnouncementFeed from "./AnnouncementFeed";
import PLCAdCard from "./PLCAdCard";
import { useSearchParams } from "next/navigation";
// --- Types ---
import {
  type DBPostRow,
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
  type FilterState,
  VisibilityOption,
} from "../Utils/types";
import type { User } from "../../../../../../supabase/Lib/General/user";

// --- Constants & Utils ---
import { VISIBILITY, programToCollege } from "../Utils/constants";
import { shapePostForUI } from "./utils";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import { getDateRange } from "../../../../../../supabase/Lib/Announcement/Filter/supabase-helper";

// --- Default State ---
const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "All Time",
  visibility: "Global",
};

// --- Controller Component ---
export default function AnnouncementPageContent() {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);
  const [activeTab, setActiveTab] = useState<"announcement" | "highlight">(
    "announcement"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // --- Performance Optimization ---
  // We defer the values used for the heavy list rendering.
  // This allows the UI (Toggle button) to update immediately (using activeTab),
  // while the list updates a split second later (using deferredTab).
  const deferredTab = useDeferredValue(activeTab);
  const deferredTags = useDeferredValue(activeTags);
  const searchParams = useSearchParams();
  // --- Data Fetching ---
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

  useEffect(() => {
    const targetFilter = searchParams.get("filter");
    const targetId = searchParams.get("id");

    if (targetId && targetFilter) {
      // Ensure we are on "Announcement" tab
      setActiveTab("announcement");

      // Override the filter state to match the notification
      // This triggers fetchPosts automatically because 'filters' is a dependency of the fetch useEffect
      if (targetFilter === "Course" || targetFilter === "Global") {
        setFilters((prev) => ({
          ...prev,
          visibility: targetFilter as VisibilityOption,
        }));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const targetId = searchParams.get("id");

    // Only try to scroll if we have a target ID and posts have loaded
    if (targetId && posts.length > 0) {
      // We wait a tiny bit to ensure the DOM is fully painted
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });

          // Optional: Add a temporary highlight effect so they see which one it is
          element.style.transition =
            "transform 0.3s ease, box-shadow 0.3s ease";
          element.style.transform = "scale(1.02)";
          element.style.boxShadow = "0 0 20px rgba(239, 191, 4, 0.6)"; // Gold glow

          setTimeout(() => {
            element.style.transform = "scale(1)";
            element.style.boxShadow = "none";
          }, 2000);
        }
      }, 600); // 600ms delay to be safe

      return () => clearTimeout(timer);
    }
  }, [posts, searchParams]);

  const { course } = currentUser || {};

  const resolveUserCollegeCode = (userCourse: string | undefined | null) => {
    if (!userCourse) return null;
    const lc = String(userCourse).toLowerCase();
    if (programToCollege[lc]) return programToCollege[lc];
    if (Object.values(programToCollege).includes(lc)) return lc;
    return null;
  };

  const userCollegeCode = useMemo(
    () => resolveUserCollegeCode(course),
    [course]
  );

  const fetchPosts = useCallback(
    async (currentFilters: FilterState, uc: string | null) => {
      try {
        let query = supabase
          .from("Posts")
          .select("*")
          .in("type", ["announcement", "highlight"]);

        // Apply Filters
        const dateRange = getDateRange(currentFilters.date);
        if (dateRange) {
          query = query.gte("created_at", dateRange.startDate);
          query = query.lte("created_at", dateRange.endDate);
        }

        if (currentFilters.visibility === "Global") {
          query = query.eq("visibility", VISIBILITY.GLOBAL);
        } else if (currentFilters.visibility === "Course" && uc) {
          query = query.eq("visibility", uc);
        }

        if (uc) {
          query = query.or(
            `visibility.eq.${VISIBILITY.GLOBAL},visibility.eq.${uc},visibility.is.null`
          );
        } else {
          query = query.or(
            `visibility.eq.${VISIBILITY.GLOBAL},visibility.is.null`
          );
        }

        const isAscending = currentFilters.sort === "Oldest First";
        query = query.order("created_at", { ascending: isAscending });

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching posts:", error);
          setPosts([]);
          return;
        }

        const rows = Array.isArray(data) ? data : [];
        const mapped = rows
          .map((row) => shapePostForUI(row as DBPostRow))
          .filter((x): x is PostUI => x !== null);

        setPosts(mapped);
      } catch (err: unknown) {
        console.error("Unexpected error fetching posts:", err);
      }
    },
    []
  );

  useEffect(() => {
    // Now fetchPosts waits for userCollegeCode to be ready
    fetchPosts(filters, userCollegeCode);
  }, [filters, userCollegeCode, fetchPosts]);

  // --- Handlers ---
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTabToggle = (tab: "announcement" | "highlight") => {
    setActiveTab(tab);
    setActiveTags([]);

    if (tab === "highlight") {
      // Optimization: Only update filters if needed to prevent double-fetching
      setFilters((prev) => {
        if (prev.visibility === "Global" && prev.date === "All Time")
          return prev;
        return { ...prev, visibility: "Global", date: "All Time" };
      });
    }
  };

  const handleAddPost = async (newPostData: NewPostPayload) => {
    try {
      const { data, error } = await supabase
        .from("Posts")
        .insert([newPostData])
        .select()
        .single();
      if (error) throw error;
      const newlyAddedPost = shapePostForUI(data);
      if (newlyAddedPost) {
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

  const handleUpdatePost = async (updatedPost: UpdatePostPayload) => {
    const { id: postId, ...postUpdateData } = updatedPost;
    if (!postId) return;
    try {
      const { data, error } = await supabase
        .from("Posts")
        .update(postUpdateData)
        .eq("id", postId)
        .select()
        .single();
      if (error) throw error;
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
      const { error: dbError } = await supabase
        .from("Posts")
        .delete()
        .eq("id", idToDelete);
      if (dbError) throw dbError;

      if (postToDelete.images && postToDelete.images.length > 0) {
        const imagePaths = postToDelete.images
          .map((url) => {
            try {
              const urlParts = new URL(url).pathname.split("/");
              return urlParts.slice(urlParts.indexOf("posts")).join("/");
            } catch (e) {
              console.error("Invalid image URL:", e);
              return null;
            }
          })
          .filter((path): path is string => !!path);

        if (imagePaths.length > 0) {
          await supabase.storage.from("posts").remove(imagePaths);
        }
      }

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

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingPost(null);
  };

  // --- Client-Side Filtering (Optimized) ---
  const derivedTags = useMemo(() => {
    // Using deferredTab moves this calculation off the main thread
    const candidate = posts.filter((p) => p.type === deferredTab);
    return Array.from(
      new Set(
        candidate
          .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
          .filter(Boolean)
      )
    );
  }, [posts, deferredTab]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    // Using deferredTab for list filtering
    list = list.filter((p) => p.type === deferredTab);

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    // Using deferredTags for tag filtering
    if (deferredTags.length > 0) {
      list = list.filter((p) =>
        p.tags?.some((tag) => deferredTags.includes(tag))
      );
    }

    return list;
  }, [posts, deferredTab, searchTerm, deferredTags]);

  // --- Main Render ---
  const { id, role } = currentUser || {};
  const isAdmin =
    (role?.includes("Platform Administrator") ||
      role?.includes("Announcements Moderator")) ??
    false;
  const currentUserId = id || "";

  // --- Loading UI ---
  if (!currentUser) {
    return (
      <div className="p-[25px]">
        <HomepageTab user={null} />
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="p-[25px] flex-col">
      <HomepageTab user={currentUser} />

      <AnnouncementLeftBar
        activeTab={activeTab} // Pass activeTab (immediate) to Toggle button
        onTabToggle={handleTabToggle}
        onSearchChange={setSearchTerm}
        onFilterChange={handleFilterChange}
        filters={filters}
        isHighlights={activeTab === "highlight"} // Pass activeTab (immediate) to filters
        derivedTags={derivedTags}
        onTagClick={setActiveTags}
      />

      {/* Right Side (PLC Ad Card) */}
      <div className="w-[350px] right-0 top-0 fixed h-full pt-28 flex flex-col items-center">
        <PLCAdCard />
      </div>

      {/* Center Feed */}
      {currentUser && (
        <AnnouncementFeed
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          currentType={deferredTab} // Pass deferredTab (delayed) to the feed
          filteredPosts={filteredPosts}
          editorOpen={editorOpen}
          editingPost={editingPost}
          onAddPost={handleAddPost}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDelete}
          onEditPost={handleEdit}
          onCloseEditor={handleCloseEditor}
        />
      )}
    </div>
  );
}
