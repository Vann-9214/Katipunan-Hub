// AnnouncementPageContent/index.tsx
"use client";

import AddPosts from "../AddPosts/addPosts";
import TagsFilter from "../General/TagsFilter";
import ButtonFIlter from "../General/ButtonFilter";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "../General/SearchFilter";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import Posts from "../Posts/Posts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Import from our new organized files
import { type DBPostRow, type PostUI, type CurrentUser } from "../Utils/types";
import { VISIBILITY, programToCollege } from "../Utils/constants";
import { shapePostForUI } from "./utils";
// <-- Import your utility formatter (adjust path if needed)
import formatPostDate from "../Utils/formatDate";

export default function AnnouncementPageContent() {
  // --- ALL hooks declared up front (stable order) ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Posts state (populated from DB)
  const [posts, setPosts] = useState<
    {
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
    }[]
  >([]);
  const supabase = createClientComponentClient();

  // 🧩 Step 1 — Check session validity
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log(
        "🟩 Supabase Auth Session:",
        user ? "Authenticated" : "No session"
      );
      console.log("🧭 User ID from supabase.auth.getUser():", user?.id);
      if (error) console.error("Auth session error:", error);
    };
    checkSession();
  }, [supabase]);
  // Post editor control
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<PostUI | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"announcement" | "highlight">(
    "announcement"
  );

  // Filtering & sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "latest" | "oldest" | "top-reacts"
  >("latest");

  // Tag filter
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Visibility UI filter (right-side buttons) — default to Global
  const [visibilityFilter, setVisibilityFilter] = useState<
    "Global" | "Course" | "All"
  >("Global");

  // --- Fetch current user once (effect after hooks) ---
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

  // --- Safe destructure with fallback (currentUser might still be null briefly) ---
  const { id, email, fullName, role, course, studentID, year, avatarURL } =
    currentUser || {};

  // Helper: resolve user's college code from `course`
  const resolveUserCollegeCode = (userCourse: string | undefined | null) => {
    if (!userCourse) return null;
    const lc = String(userCourse).toLowerCase();
    const knownCollegeCodes = [
      "cea",
      "cba",
      "cas",
      "ccs",
      "coed",
      "con",
      "chtm",
      "claw",
      "cah",
      "cit",
      "cagr",
    ];
    if (knownCollegeCodes.includes(lc)) return lc;
    if (programToCollege[lc]) return programToCollege[lc];
    return null;
  };

  // compute once for convenience
  const userCollegeCode = resolveUserCollegeCode(course);

  // --- Fetch posts from Supabase (filter by visibility using resolved college) ---
  const fetchPosts = useCallback(
    async (userCourse: string | undefined | null) => {
      try {
        const { data, error } = await supabase
          .from("Posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        const rows = Array.isArray(data) ? data : [];
        const uc = resolveUserCollegeCode(userCourse);

        const filtered = rows
          // only keep rows that are announcement or highlight
          .filter((r) => r.type === "announcement" || r.type === "highlight")
          // apply baseline visibility rules
          .filter((r) => {
            if (r.type === "highlight") return true;
            const vis = r.visibility;
            if (vis === null || vis === undefined) return true;
            if (vis === VISIBILITY.GLOBAL) return true;
            if (uc && vis === uc) return true;
            return false;
          });
        // map to UI shape
        const mapped = rows
          // keep rows typed
          .filter((r) => r.type === "announcement" || r.type === "highlight")
          .filter((r) => {
            if (r.type === "highlight") return true;
            const vis = r.visibility;
            if (vis === null || vis === undefined) return true;
            if (vis === VISIBILITY.GLOBAL) return true;
            if (uc && vis === uc) return true;
            return false;
          })
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
    []
  );

  // run fetch when user info is available
  useEffect(() => {
    if (!currentUser) return;
    fetchPosts(course);
  }, [currentUser, course, fetchPosts]);

  // --- Post handlers (MODIFIED TO UPDATE DATABASE) ---

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
        .single(); // Use .single() to get the created object back

      if (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again."); // User feedback
        return;
      }

      // Shape the new post from DB response to match UI state structure
      const newlyAddedPost = shapePostForUI(data);
      if (newlyAddedPost) {
        setPosts((prev) => [newlyAddedPost, ...prev]);
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
    const { id, ...postUpdateData } = updatedPost;

    if (!id) {
      console.error("Cannot update post without an ID.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("Posts")
        .update(postUpdateData)
        .eq("id", id)
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
          prev.map((p) => (p.id === id ? freshlyUpdatedPost : p))
        );
      }

      // Close the editor after a successful update
      setEditingIndex(null);
      setEditingPost(null);
      setEditorOpen(false);
    } catch (err) {
      console.error("Unexpected error updating post:", err);
      alert("An unexpected error occurred while updating.");
    }
  };

  const handleDelete = async (id: string) => {
    const postToDelete = posts.find((p) => p.id === id);
    if (!postToDelete || !postToDelete.id) {
      console.error("Could not find post to delete or post has no ID.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${postToDelete.title}"?`
      )
    ) {
      return;
    }

    try {
      // 1️⃣ Delete the post row in database
      const { error: dbError } = await supabase
        .from("Posts")
        .delete()
        .eq("id", postToDelete.id);

      if (dbError) {
        console.error("Error deleting post:", dbError);
        alert("Failed to delete post. Please try again.");
        return;
      }

      // 2️⃣ Delete any linked images from the Supabase Storage bucket
      if (postToDelete.images && postToDelete.images.length > 0) {
        // Extract file paths from the image URLs
        const imagePaths = postToDelete.images
          .map((url) => {
            const parts = url.split("/"); // e.g. https://xxx.supabase.co/storage/v1/object/public/posts-images/folder/file.jpg
            const idx = parts.indexOf("posts"); // your bucket name
            return idx >= 0 ? parts.slice(idx + 1).join("/") : null;
          })
          .filter((path): path is string => !!path);

        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("posts") // bucket name
            .remove(imagePaths);

          if (storageError) {
            console.error("Error deleting images from storage:", storageError);
          }
        }
      }

      // 3️⃣ Update the UI after deletion
      setPosts((prev) => prev.filter((p) => p.id !== id));

      // Reset editing state if same post was being edited
      if (editingPost?.id === id) {
        setEditingIndex(null);
        setEditingPost(null);
        setEditorOpen(false);
      }

      alert("Post deleted successfully.");
    } catch (err) {
      console.error("Unexpected error deleting post:", err);
      alert("An unexpected error occurred while deleting.");
    }
  };

  const handleEdit = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setEditingIndex(posts.findIndex((p) => p.id === id));
    setEditingPost(post);
    setEditorOpen(true);
  };

  // --- Derived tags (now respect visibilityFilter + activeTab) ---
  const derivedTags = useMemo(() => {
    let candidate = posts.filter((p) => p.type === activeTab);

    if (visibilityFilter === "Global") {
      candidate = candidate.filter(
        (p) =>
          p.type === "highlight" || (p.visibility ?? null) === VISIBILITY.GLOBAL
      );
    } else if (visibilityFilter === "Course") {
      candidate = candidate.filter(
        (p) => p.type === "highlight" || p.visibility === userCollegeCode
      );
    }

    const tags = Array.from(
      new Set(
        candidate
          .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
          .filter(Boolean)
      )
    );

    return tags;
  }, [posts, activeTab, visibilityFilter, userCollegeCode]);

  // --- Memoized filtered/sorted posts shown in feed ---
  const filteredPosts = useMemo(() => {
    let list = [...posts];
    list = list.filter((p) => p.type === activeTab);

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    if (activeTags.length > 0) {
      list = list.filter((p) =>
        p.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    if (visibilityFilter === "Global") {
      list = list.filter(
        (p) =>
          p.type === "highlight" || (p.visibility ?? null) === VISIBILITY.GLOBAL
      );
    } else if (visibilityFilter === "Course") {
      list = list.filter(
        (p) => p.type === "highlight" || p.visibility === userCollegeCode
      );
    }

    list.sort((a, b) => {
      // Use the raw created_at for accurate sorting, fallback to date string
      const da = new Date(a.created_at || a.date).getTime();
      const db = new Date(b.created_at || b.date).getTime();
      return sortOrder === "latest" ? db - da : da - db;
    });

    return list;
  }, [
    posts,
    activeTab,
    searchTerm,
    sortOrder,
    activeTags,
    visibilityFilter,
    userCollegeCode,
  ]);

  // --- Loading UI while user data is still fetching ---
  if (!currentUser) {
    return (
      <div className="p-[25px]">
        <HomepageTab />
        <p className="mt-[130px] text-gray-500 text-lg font-montserrat">
          Loading user data...
        </p>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="p-[25px] flex-col">
      <HomepageTab />

      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[130px]">
        {activeTab === "announcement" ? "Announcement" : "Highlights"}
      </h1>

      <div className="flex gap-10">
        {/* Left: Display Area for Filtered Posts */}
        <div className="space-y-8">
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-[18px] w-[800px] font-montserrat mt-5">
              No posts available at the moment.
            </p>
          ) : (
            filteredPosts.map((post, i) => (
              <Posts
                key={`${post.id}-${i}`} // Use unique ID for key
                postId={post.id!} // <<<--- Pass post.id as postId
                userId={id} // <<<--- Pass current user's id as userId
                title={post.title}
                description={post.description}
                // <-- Use formatted date string for display
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

        {/* Right: Filters, Toggles, and AddPosts Controls */}
        <div>
          <div className="fixed w-[540px] flex flex-col gap-3">
            <ToggleButton
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
            <SearchFilter
              onSearchChange={(val) => setSearchTerm(val)}
              onSortChange={(val) =>
                setSortOrder(val as "latest" | "oldest" | "top-reacts")
              }
            />
            {activeTab === "announcement" && (
              <h1 className="font-montserrat font-semibold text-[23px]">
                Filters :
              </h1>
            )}

            {activeTab === "announcement" && (
              <ButtonFIlter
                active={visibilityFilter}
                onChange={(val) => {
                  setVisibilityFilter(val);
                }}
              />
            )}

            <TagsFilter
              tags={derivedTags}
              onTagClick={(selectedTags: string[]) =>
                setActiveTags(selectedTags)
              }
            />

            {role &&
              (role.includes("Platform Administrator") ||
                role.includes("Announcements Moderator")) && (
                <AddPosts
                  onAddPost={handleAddPost}
                  onUpdatePost={handleUpdatePost}
                  externalOpen={editorOpen}
                  onExternalClose={() => {
                    setEditorOpen(false);
                    setEditingIndex(null);
                    setEditingPost(null);
                    // No need to fetch here anymore, state is updated optimistically
                  }}
                  initialPost={editingPost ?? null}
                  currentType={activeTab}
                  authorId={id}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
