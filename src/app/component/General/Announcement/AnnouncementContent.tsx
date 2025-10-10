"use client";

import AddPosts from "./AddPosts";
import TagsFilter from "./TagsFilter";
import ButtonFIlter from "@/app/component/General/Announcement/ButtonFilter";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "@/app/component/General/Announcement/SearchFilter";
import { useState, useMemo, useEffect } from "react";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/getUser";
import Posts from "./Posts";

export default function AnnouncementPageContent() {
  // --- ALL hooks declared up front (stable order) ---
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Posts state
  const [posts, setPosts] = useState<
    {
      title: string;
      description: string;
      date: string;
      images: string[];
      tags: string[];
      type: "announcement" | "highlight";
    }[]
  >([]);

  // Post editor control
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<{
    title: string;
    description: string;
    date: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
  } | null>(null);

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

  // --- Post handlers (unchanged) ---
  const handleAddPost = (newPost: {
    title: string;
    description: string;
    date: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
  }) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdatePost = (updatedPost: {
    title: string;
    description: string;
    date: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
  }) => {
    setPosts((prev) =>
      prev.map((p, i) => (i === (editingIndex ?? -1) ? updatedPost : p))
    );
    setEditingIndex(null);
    setEditingPost(null);
    setEditorOpen(false);
  };

  const handleDelete = (index: number) => {
    setPosts((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingPost(null);
      setEditorOpen(false);
    }
  };

  const handleEdit = (index: number) => {
    const post = posts[index];
    if (!post) return;
    setEditingIndex(index);
    setEditingPost(post);
    setEditorOpen(true);
  };

  // --- Derived tags ---
  const derivedTags = Array.from(
    new Set(
      posts
        .filter((p) => p.type === activeTab)
        .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
    )
  );

  // --- Memoized filtered/sorted posts ---
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

    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "latest" ? db - da : da - db;
    });

    return list;
  }, [posts, activeTab, searchTerm, sortOrder, activeTags]);

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

      {/* Dynamic Header */}
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[130px]">
        {activeTab === "announcement" ? "Announcement" : "Highlights"}
      </h1>

      <div className="flex gap-10">
        {/* Left: Display Area for Filtered Posts */}
        <div className="space-y-8">
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-[18px] w-[800px] font-montserrat mt-5">
              No announcements available at the moment.
            </p>
          ) : (
            filteredPosts.map((post, i) => (
              <Posts
                key={`${post.title}-${i}-${post.date}`}
                title={post.title}
                description={post.description}
                date={post.date}
                images={post.images}
                onDelete={() => handleDelete(i)}
                onEdit={() => handleEdit(i)}
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
            <h1 className="font-montserrat font-semibold text-[23px]">
              Filters :
            </h1>
            <ButtonFIlter />
            <TagsFilter
              tags={derivedTags}
              onTagClick={(selectedTags: string[]) =>
                setActiveTags(selectedTags)
              }
            />

            {/* ✅ AddPosts only for authorized roles */}
            {role &&
              (role.includes("Platform Administrator") ||
                role.includes("Announcements Moderator")) && (
                <AddPosts
                  onAddPost={handleAddPost}
                  externalOpen={editorOpen}
                  onExternalClose={() => {
                    setEditorOpen(false);
                    setEditingIndex(null);
                    setEditingPost(null);
                  }}
                  initialPost={editingPost ?? null}
                  onUpdatePost={handleUpdatePost}
                  currentType={activeTab}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
