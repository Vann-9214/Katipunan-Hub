"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import PostCard from "./PostCard";
import {
  Search,
  Star,
  ChevronDown,
  Plus,
  Check,
  Laptop,
  Book,
  Shirt,
  Blocks,
  Search as SearchIcon, // Distinct alias for the header icon
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import PostItemModal, { ModalPostData } from "./PostItemModal";
import PostViewModal from "./PostViewModal";

import { useRouter } from "next/navigation";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import BackgroundGradient from "@/app/component/ReusableComponent/BackgroundGradient";

// --- FONTS ---
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export type Category =
  | "All Categories"
  | "Electronics"
  | "Wallets"
  | "Books"
  | "Clothing"
  | "Other"
  | "Category";

export interface Inquiry {
  id: string;
  userName: string;
  messagePreview: string;
  time: string;
}

export type Post = {
  id: string;
  userId: string;
  type: "Lost" | "Found";
  status: "Open" | "Resolved";
  imageUrl: string;
  title: string;
  postedBy: string;
  lostOn: string;
  location: string;
  description: string;
  category: Category;
  createdAt: string;
  inquiries: Inquiry[];
};

interface SupabasePostItem {
  id: string;
  user_id: string;
  type: string;
  status: string;
  image_url: string | null;
  title: string;
  lost_date: string;
  location: string;
  description: string;
  category: string;
  created_at: string;
  Accounts: {
    fullName: string;
  } | null;
}

// --- ANIMATION CONFIGS ---
const liquidSpring: Transition = {
  type: "spring",
  stiffness: 700,
  damping: 25,
  mass: 0.5,
};
const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
};
const buttonContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};
const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    x: 50,
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
};
const categoryIcons: { [key in Category]?: React.ReactNode } = {
  Electronics: <Laptop size={18} />,
  Books: <Book size={18} />,
  Clothing: <Shirt size={18} />,
  Other: <Blocks size={18} />,
};

// --- MAIN COMPONENT ---
export default function LostandFoundContent({ user }: { user: User | null }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, []);

  // --- Realtime Subscription ---
  useEffect(() => {
    const channel = supabase
      .channel("realtime-lost-and-found")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "LostAndFoundPosts" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
            return;
          }

          const { data, error } = await supabase
            .from("LostAndFoundPosts")
            .select(`*, Accounts (fullName)`)
            .eq("id", payload.new.id)
            .single();

          if (data && !error) {
            const item = data as SupabasePostItem;
            const newPost: Post = {
              id: item.id,
              userId: item.user_id,
              type: item.type as "Lost" | "Found",
              status: item.status as "Open" | "Resolved",
              imageUrl:
                item.image_url ||
                (item.type === "Found" ? "/found.svg" : "/lost.svg"),
              title: item.title,
              postedBy: item.Accounts?.fullName || "Anonymous",
              lostOn: item.lost_date || "",
              location: item.location || "",
              description: item.description || "",
              category: (item.category as Category) || "Other",
              createdAt: item.created_at,
              inquiries: [],
            };

            setPosts((prev) => {
              if (payload.eventType === "UPDATE") {
                return prev.map((p) => (p.id === newPost.id ? newPost : p));
              }
              return [newPost, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("LostAndFoundPosts")
        .select(
          `
          *,
          Accounts (
            fullName
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((item: SupabasePostItem) => ({
          id: item.id,
          userId: item.user_id,
          type: item.type as "Lost" | "Found",
          status: item.status as "Open" | "Resolved",
          imageUrl:
            item.image_url ||
            (item.type === "Found" ? "/found.svg" : "/lost.svg"),
          title: item.title,
          postedBy: item.Accounts?.fullName || "Anonymous",
          lostOn: item.lost_date || "",
          location: item.location || "",
          description: item.description || "",
          category: (item.category as Category) || "Other",
          createdAt: item.created_at,
          inquiries: [],
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const [showStarOptions, setShowStarOptions] = useState<boolean>(false);
  const [activeStarFilter, setActiveStarFilter] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Category");
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node))
        setShowSortDropdown(false);
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      )
        setShowCategoryDropdown(false);
      if (starRef.current && !starRef.current.contains(event.target as Node))
        setShowStarOptions(false);
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const categories: Category[] = [
    "All Categories",
    "Electronics",
    "Books",
    "Clothing",
    "Other",
  ];
  const sortOptions = ["Latest", "Oldest"];

  const filteredPosts = posts
    .filter((post) => {
      if (
        activeStarFilter === "All" ||
        (post.type as string) === activeStarFilter
      )
        return true;
      return false;
    })
    .filter((post) => {
      if (
        selectedCategory === "All Categories" ||
        selectedCategory === "Category"
      )
        return true;
      return post.category === selectedCategory;
    })
    .filter((post) => {
      if (searchQuery.trim() === "") return true;
      const query = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(query);
      const matchDesc = post.description.toLowerCase().includes(query);
      const matchLoc = post.location.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchLoc;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return selectedSort === "Latest" ? dateB - dateA : dateA - dateB;
    });

  // --- Handlers ---
  const handlePublishPost = async (data: ModalPostData) => {
    if (!user) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      let publicUrl = null;

      if (data.attachment) {
        const fileExt = data.attachment.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lost-and-found")
          .upload(filePath, data.attachment);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("lost-and-found")
          .getPublicUrl(filePath);

        publicUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("LostAndFoundPosts")
        .insert({
          user_id: user.id,
          title: data.itemName,
          description: data.itemDescription,
          type: data.itemType,
          location: data.itemLocation,
          category:
            data.itemCategory === "Select Category"
              ? "Other"
              : data.itemCategory,
          lost_date: new Date().toLocaleDateString(),
          image_url: publicUrl,
          status: "Open",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setShowPostModal(false);
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Failed to publish post. Please try again.");
    }
  };

  const handleStatusUpdate = async (
    postId: number | string,
    newStatus: "Open" | "Resolved"
  ) => {
    try {
      const { error } = await supabase
        .from("LostAndFoundPosts")
        .update({ status: newStatus })
        .eq("id", postId);

      if (error) throw error;
      setSelectedPost((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // --- UPDATED SMART CHAT LOGIC ---
  const handleOpenChat = async () => {
    if (!selectedPost || !selectedPost.userId) return;

    // Prevent chatting with self
    if (user && user.id === selectedPost.userId) {
      alert("You cannot chat with yourself.");
      return;
    }

    if (!user) {
      alert("Please log in to chat.");
      return;
    }

    const targetId = selectedPost.userId;

    try {
      // 1. Fetch conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from("Conversations")
        .select("id, user_a_id, user_b_id")
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

      if (error) {
        console.error("Error checking conversations:", error);
        // Fallback: Just go to new message page
        navigateToNewChat(targetId);
        return;
      }

      // 2. Filter to find the one with the target user
      const existingConv = conversations?.find(
        (c) =>
          (c.user_a_id === user.id && c.user_b_id === targetId) ||
          (c.user_a_id === targetId && c.user_b_id === user.id)
      );

      if (existingConv) {
        // Conversation exists -> Go to it
        router.push(`/Message/${existingConv.id}`);
      } else {
        // No conversation -> Go to New Message page
        navigateToNewChat(targetId);
      }
    } catch (err) {
      console.error("Unexpected error in chat redirect:", err);
      navigateToNewChat(targetId);
    }
  };

  // Helper to construct the new chat URL
  const navigateToNewChat = (targetId: string) => {
    if (!selectedPost) return;
    const inquiryMessage = `Hello, I'm inquiring about the "${selectedPost.title}" (${selectedPost.type}) you posted in Lost & Found.`;
    router.push(
      `/Message/new/${targetId}?initialMessage=${encodeURIComponent(
        inquiryMessage
      )}`
    );
  };

  return (
    <div className="min-h-screen w-full pb-12 relative flex flex-col">
      <BackgroundGradient />

      {/* --- Page Container --- */}
      <div className="max-w-[1400px] mt-17 w-full mx-auto px-4 md:px-8 py-8 space-y-8 flex-1 flex flex-col">
        {/* --- Header & Toolbar Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Title Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-gradient-to-br from-[#8B0E0E] to-[#5e0a0a] rounded-2xl shadow-lg shadow-red-900/20 text-white">
              <SearchIcon size={32} />
            </div>
            <div>
              <h1
                className={`${montserrat.className} text-[28px] md:text-[32px] font-extrabold text-[#1a1a1a] leading-tight`}
              >
                Lost & Found
              </h1>
              <p
                className={`${ptSans.className} text-gray-500 font-medium text-sm md:text-base`}
              >
                Report lost items or help return found ones to their owners.
              </p>
            </div>
          </motion.div>

          {/* Controls Toolbar */}
          <div className="flex flex-col items-end">
            <div
              className="flex justify-end items-center w-full h-12 relative z-30"
              ref={searchRef}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isSearchOpen ? (
                  <motion.div
                    key="search-bar"
                    layoutId="search-container"
                    style={{ originX: 0 }}
                    className="relative w-full md:w-[400px] h-12 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 flex items-center overflow-hidden"
                    transition={liquidSpring}
                  >
                    <motion.div
                      className="w-full h-full flex items-center"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <input
                        type="text"
                        placeholder="Search items..."
                        className={`${ptSans.className} w-full h-full pl-12 pr-4 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400`}
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search
                        className="absolute left-4 text-gray-400"
                        size={20}
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="search-buttons"
                    layoutId="search-container"
                    style={{ originX: 0 }}
                    className="flex justify-end items-center gap-3 w-fit h-12"
                    transition={liquidSpring}
                  >
                    <motion.div
                      className="flex justify-end items-center gap-3 w-full"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Search Trigger */}
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-3 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center w-12 h-12 transition-transform duration-200 hover:scale-105"
                      >
                        <Search size={22} />
                      </button>

                      {/* Filter Controls Container */}
                      <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-200 h-12">
                        {/* Sort Dropdown */}
                        <div className="relative h-full" ref={sortRef}>
                          <button
                            className={`${ptSans.className} flex items-center justify-between px-4 h-full rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm transition-colors min-w-[110px]`}
                            onClick={() => {
                              setShowSortDropdown(!showSortDropdown);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <span>{selectedSort}</span>
                            <ChevronDown size={16} />
                          </button>
                          {showSortDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden p-1.5 animate-fadeIn">
                              {sortOptions.map((op) => (
                                <button
                                  key={op}
                                  className={`flex items-center justify-between w-full px-4 py-2.5 font-bold text-sm rounded-lg mb-0.5 last:mb-0 transition-colors ${
                                    selectedSort === op
                                      ? "bg-[#8B0E0E] text-white"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedSort(op);
                                    setShowSortDropdown(false);
                                  }}
                                >
                                  {op}
                                  {selectedSort === op && <Check size={16} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="w-[1px] h-6 bg-gray-200" />

                        {/* Category Dropdown */}
                        <div className="relative h-full" ref={categoryRef}>
                          <button
                            className={`${ptSans.className} flex items-center justify-between px-4 h-full rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm transition-colors min-w-[140px]`}
                            onClick={() => {
                              setShowCategoryDropdown(!showCategoryDropdown);
                              setShowSortDropdown(false);
                            }}
                          >
                            <span className="truncate max-w-[100px]">
                              {selectedCategory === "Category"
                                ? "Category"
                                : selectedCategory}
                            </span>
                            <ChevronDown size={16} />
                          </button>
                          {showCategoryDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden p-1.5 animate-fadeIn">
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  className={`flex items-center gap-3 w-full px-4 py-2.5 font-bold text-sm rounded-lg mb-0.5 last:mb-0 transition-colors ${
                                    cat !== "All Categories"
                                      ? "pl-4"
                                      : "justify-center"
                                  } ${
                                    selectedCategory === cat
                                      ? "bg-[#8B0E0E] text-white"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {cat !== "All Categories" &&
                                    (categoryIcons[cat] || (
                                      <Blocks size={16} />
                                    ))}
                                  {cat}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Type Filters (All / Found / Lost) */}
            <div
              className="flex items-center justify-end gap-3 mt-4 relative z-20"
              ref={starRef}
            >
              <AnimatePresence>
                {showStarOptions && (
                  <motion.div
                    className="flex justify-end gap-3"
                    variants={buttonContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {["All", "Found", "Lost"].map((filter) => (
                      <motion.button
                        key={filter}
                        variants={buttonVariants}
                        onClick={() => setActiveStarFilter(filter)}
                        className={`${
                          montserrat.className
                        } px-6 py-2.5 rounded-full text-sm font-bold shadow-sm border border-gray-100 transition-all ${
                          activeStarFilter === filter
                            ? "bg-[#8B0E0E] text-white scale-105"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {filter}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <button
                  className="p-3 bg-[#8B0E0E] text-white rounded-2xl shadow-lg shadow-red-900/30 hover:bg-[#720b0b] w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all active:scale-95 hover:scale-105"
                  onClick={() => setShowStarOptions(!showStarOptions)}
                >
                  <Star size={22} fill="white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        <div className="flex-1 relative z-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8B0E0E] rounded-full animate-spin" />
              <p className={`${ptSans.className} text-gray-500 font-medium`}>
                Loading posts...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPost(post)}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Search size={32} />
                  </div>
                  <p className={`${ptSans.className} text-lg font-medium`}>
                    No items found matching your filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- FAB --- */}
        <motion.button
          layoutId="post-item-modal"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-10 right-10 bg-[#8B0E0E] text-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-xl shadow-red-900/40 hover:bg-[#720b0b] transition-all z-40 hover:scale-105"
          onClick={() => setShowPostModal(true)}
        >
          <Plus size={32} />
        </motion.button>
      </div>

      {/* --- Modals --- */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {showPostModal && (
                <PostItemModal
                  onClose={() => setShowPostModal(false)}
                  onPublish={handlePublishPost}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedPost && (
                <PostViewModal
                  post={selectedPost}
                  isOwner={user ? user.id === selectedPost.userId : false}
                  onClose={() => setSelectedPost(null)}
                  onStatusChange={(id, status) =>
                    handleStatusUpdate(id, status)
                  }
                  onChat={handleOpenChat}
                />
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}
