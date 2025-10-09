"use client";

import AddPosts from "./AddPosts"; // your AddAnnouncement file (keeps same import name)
import TagsFilter from "./TagsFilter";
import ButtonFIlter from "@/app/component/General/Announcement/ButtonFilter";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "@/app/component/General/Announcement/SearchFilter";
import { useState, useMemo } from "react";
import Posts from "./Posts";

export default function AnnouncementPageContent() {
  // store multiple posts
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

  // Editor control state
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

  // Active tab state (controlled)
  // "announcement" = left, "highlight" = right
  const [activeTab, setActiveTab] = useState<"announcement" | "highlight">(
    "announcement"
  );

  // Search + sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "latest" | "oldest" | "top-reacts"
  >("latest");

  // ✅ Tag filter state
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Add post
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

  // Update post
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

  // Delete post
  const handleDelete = (index: number) => {
    setPosts((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingPost(null);
      setEditorOpen(false);
    }
  };

  // Edit post
  const handleEdit = (index: number) => {
    const post = posts[index];
    if (!post) return;
    setEditingIndex(index);
    setEditingPost(post);
    setEditorOpen(true);
  };

  // Derived tags: only from posts of the active tab (announcement or highlight)
  const derivedTags = Array.from(
    new Set(
      posts
        .filter((p) => p.type === activeTab)
        .flatMap((p) => (p.tags && p.tags.length ? p.tags : []))
    )
  );

  // Proper memoized filter + sort (includes tag filtering + type filter)
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    // filter by active tab type
    list = list.filter((p) => p.type === activeTab);

    // search filter
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    // tags filter (OR logic: show posts that have any selected tag)
    if (activeTags.length > 0) {
      list = list.filter((p) =>
        p.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    // sort by date
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "latest" ? db - da : da - db;
    });

    return list;
  }, [posts, activeTab, searchTerm, sortOrder, activeTags]);

  return (
    <div className="p-[25px] flex-col">
      <HomepageTab />
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[130px]">
        {activeTab === "announcement" ? "Announcement" : "Highlights"}
      </h1>

      <div className="flex gap-10">
        {/* Left: Posts */}
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
                // pass type (optional display inside Posts)
                // @ts-ignore no prop type required, Posts will accept it if present
                // (or update Posts prop types to include type)
                // type={post.type}
                onDelete={() => handleDelete(i)}
                onEdit={() => handleEdit(i)}
              />
            ))
          )}
        </div>

        {/* Right: Filters + AddPosts */}
        <div>
          <div className="fixed w-[540px] flex flex-col gap-3">
            <ToggleButton
              leftLabel="Announcement"
              rightLabel="Highlights"
              leftActiveBg="bg-maroon"
              rightActiveBg="bg-maroon"
              active={activeTab === "announcement" ? "left" : "right"}
              onToggle={(side) => {
                // switch tabs and clear active tag filters so they don't carry over
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
              currentType={activeTab} // pass current active tab to modal
            />
          </div>
        </div>
      </div>
    </div>
  );
}
