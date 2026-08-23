"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useDeferredValue,
} from "react";
import LoadingScreen from "@/components/LoadingScreen";
import HomepageTab from "@/components/HomepageTab";
import AnnouncementLeftBar from "./components/AnnouncementLeftBar";
import AnnouncementFeed from "./components/AnnouncementFeed";
import PLCAdCard from "./components/PLCAdCard";
import { useSearchParams, useRouter } from "next/navigation";
import BackgroundGradient from "@/components/BackgroundGradient";

// --- Types ---
import {
  type DBPostRow,
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
  type FilterState,
  VisibilityOption,
} from "./utils/types";
import type { User } from "@/database/supabase/General/user";

// --- Database Logic ---
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  subscribeToAnnouncements,
} from "@/database/supabase/Announcement";

// --- Constants & Utils ---
import { programToCollege } from "./utils/constants";
import { shapePostForUI } from "./utils/utils";

// --- Default State ---
const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "All Time",
  visibility: "Global",
};

// --- Controller Component ---
export default function AnnouncementContent() {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // --- Performance Optimization ---
  const deferredTags = useDeferredValue(activeTags);
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await getCurrentUserDetails();
        if (isMounted) {
          if (!user) {
            router.push("/");
            return;
          }
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Error getting current user details:", err);
        if (isMounted) router.push("/");
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    const targetFilter = searchParams.get("filter");
    const targetId = searchParams.get("id");

    if (targetId && targetFilter) {
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

    if (targetId && posts.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.style.transition =
            "transform 0.3s ease, box-shadow 0.3s ease";
          element.style.transform = "scale(1.02)";
          element.style.boxShadow = "0 0 20px rgba(239, 191, 4, 0.6)";

          setTimeout(() => {
            element.style.transform = "scale(1)";
            element.style.boxShadow = "none";
          }, 2000);
        }
      }, 600);

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
        const { data, error } = await getAnnouncements(currentFilters, uc);

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

  // --- Initial Fetch ---
  useEffect(() => {
    if (currentUser) {
      fetchPosts(filters, userCollegeCode);
    }
  }, [currentUser, filters, userCollegeCode, fetchPosts]);

  // --- Realtime Subscription for Announcements ---
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToAnnouncements(() => {
      fetchPosts(filters, userCollegeCode);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, filters, userCollegeCode, fetchPosts]);

  // --- Handlers ---
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleAddPost = async (newPostData: NewPostPayload) => {
    try {
      const { data, error } = await createAnnouncement(newPostData);
      if (error) throw error;
      const newlyAddedPost = shapePostForUI(data);
      if (newlyAddedPost) {
        setPosts((prev) =>
          filters.sort === "Newest First"
            ? [newlyAddedPost, ...prev]
            : [...prev, newlyAddedPost]
        );
      }
    } catch (err: any) {
      console.error(
        "Unexpected error creating announcement:",
        JSON.stringify(err, null, 2),
        err?.message
      );
      alert("An unexpected error occurred: " + (err?.message || "Check console"));
    }
  };

  const handleUpdatePost = async (updatedPost: UpdatePostPayload) => {
    const { id: postId } = updatedPost;
    if (!postId) return;
    try {
      const { data, error } = await updateAnnouncement(updatedPost);
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
      console.error("Unexpected error updating announcement:", err);
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
      const { error: dbError } = await deleteAnnouncement(idToDelete);
      if (dbError) throw dbError;

      setPosts((prev) => prev.filter((p) => p.id !== idToDelete));
      if (editingPost?.id === idToDelete) {
        setEditingPost(null);
        setEditorOpen(false);
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("An error occurred while deleting the announcement.");
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

  // --- Client-Side Filtering ---
  const derivedTags = useMemo(() => {
    const candidate = posts.filter((p) => p.type === "announcement");
    return Array.from(
      new Set(
        candidate
          .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
          .filter(Boolean)
      )
    );
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    list = list.filter((p) => p.type === "announcement");

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    if (deferredTags.length > 0) {
      list = list.filter((p) =>
        p.tags?.some((tag) => deferredTags.includes(tag))
      );
    }

    return list;
  }, [posts, searchTerm, deferredTags]);

  // --- Main Render ---
  const { id, role } = currentUser || {};
  const isAdmin =
    (role?.includes("Platform Administrator") ||
      role?.includes("Announcements Moderator")) ??
    false;

  const isTutor = role?.includes("Tutor") ?? false;
  const currentUserId = id || "";

  // --- Loading UI ---
  if (isAuthLoading || !currentUser) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-[25px] flex-col">
      <BackgroundGradient />

      <HomepageTab user={currentUser} />

      <AnnouncementLeftBar
        onSearchChange={setSearchTerm}
        onFilterChange={handleFilterChange}
        filters={filters}
        derivedTags={derivedTags}
        onTagClick={setActiveTags}
      />

      {/* Right Side (PLC Ad Card) - HIDDEN IF USER IS A TUTOR */}
      {!isTutor && (
        <div className="w-[350px] right-0 top-0 fixed h-full pt-28 flex flex-col items-center">
          <PLCAdCard />
        </div>
      )}

      {/* Center Feed */}
      <AnnouncementFeed
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        filteredPosts={filteredPosts}
        editorOpen={editorOpen}
        editingPost={editingPost}
        onAddPost={handleAddPost}
        onUpdatePost={handleUpdatePost}
        onDeletePost={handleDelete}
        onEditPost={handleEdit}
        onCloseEditor={handleCloseEditor}
        searchTerm={searchTerm}
      />
    </div>
  );
}
