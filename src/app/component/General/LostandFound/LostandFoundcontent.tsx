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
} from "lucide-react";
import PostItemModal, { ModalPostData } from "./PostItemModal";
import PostViewModal from "./PostViewModal";

import { useRouter } from "next/navigation";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
// --- NEW IMPORT ---
import BackgroundGradient from "@/app/component/ReusableComponent/BackgroundGradient";

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

/**
 * Interface representing the raw shape of a post row returned from Supabase.
 * Added to resolve the "Unexpected any" error during data mapping.
 */
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

  // --- NEW: Realtime Subscription for LostAndFoundPosts ---
  useEffect(() => {
    const channel = supabase
      .channel("realtime-lost-and-found")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "LostAndFoundPosts" },
        async (payload) => {
          // 1. Handle DELETE
          if (payload.eventType === "DELETE") {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
            return;
          }

          // 2. Handle INSERT or UPDATE
          // We must fetch the full row to get the joined 'Accounts' (author name)
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
              // If UPDATE, replace existing
              if (payload.eventType === "UPDATE") {
                return prev.map((p) => (p.id === newPost.id ? newPost : p));
              }
              // If INSERT, prepend to list
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

  // --- FETCH POSTS FROM SUPABASE ---
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
        /* Using the SupabasePostItem interface here instead of 'any' 
           to resolve the TypeScript error.
        */
        const formattedPosts: Post[] = data.map((item: SupabasePostItem) => ({
          id: item.id,
          userId: item.user_id,
          type: item.type as "Lost" | "Found",
          status: item.status as "Open" | "Resolved",
          // UPDATED: Proper default image logic
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

      /* Removed 'data: newPostData' from destructuring 
         to resolve unused variable warning.
      */
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

      // fetchPosts(); // Removed this because Realtime listener will handle the update
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

      // State update is handled by Realtime listener now
      setSelectedPost((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // --- UPDATED CHAT HANDLER ---
  const handleOpenChat = () => {
    if (selectedPost && selectedPost.userId) {
      if (user && user.id === selectedPost.userId) {
        alert("You cannot chat with yourself.");
        return;
      }

      // Construct an initial inquiry message
      const inquiryMessage = `Hello, I'm inquiring about the "${selectedPost.title}" (${selectedPost.type}) you posted in Lost & Found.`;

      // Redirect to message page with the pre-filled message in query params
      router.push(
        `/Message/new/${
          selectedPost.userId
        }?initialMessage=${encodeURIComponent(inquiryMessage)}`
      );
    }
  };

  return (
    // REPLACED OLD BACKGROUND WITH NEW GRADIENT
    <div className="fixed inset-0 w-full h-full flex flex-col overflow-hidden">
      {/* --- REPLACED: BackgroundGradient --- */}
      <BackgroundGradient />

      <div className="relative z-10 flex flex-col h-full">
        <div className="shrink-0 pt-[80px] px-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-12 items-start gap-8 mt-5">
            <div className="col-span-7">
              <p className="font-light italic text-[#800000] text-xl mb-3">
                Lost something? We may have it
                <br />
                Found something? Post it here
              </p>
              <h2 className="font-extrabold text-[#800000] text-[40px] tracking-wide mb-4">
                FIND AND POST IT HERE!
              </h2>
            </div>
            <div className="col-span-5 flex flex-col items-end">
              <div
                className="flex justify-end items-center w-full h-14 relative z-30"
                ref={searchRef}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isSearchOpen ? (
                    <motion.div
                      key="search-bar"
                      layoutId="search-container"
                      style={{ originX: 0 }}
                      className="relative w-full h-14 bg-white rounded-full shadow-lg ring-2 ring-[#fde68a] flex items-center overflow-hidden"
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
                          className="w-full h-full pl-12 pr-4 bg-transparent focus:outline-none text-gray-700"
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
                      className="flex justify-end items-center gap-4 w-fit h-14"
                      transition={liquidSpring}
                    >
                      <motion.div
                        className="flex justify-end items-center gap-4 w-full"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="flex-grow flex justify-end">
                          <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-3 bg-white text-gray-600 rounded-full shadow-lg ring-2 ring-[#fde68a] hover:bg-gray-50 flex items-center justify-center w-14 h-14 transition-transform duration-200 hover:scale-110"
                          >
                            <Search size={24} />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-lg ring-2 ring-[#fde68a]">
                          <div className="relative" ref={sortRef}>
                            <button
                              className="flex items-center justify-between px-5 py-3 bg-white text-gray-600 rounded-full font-medium hover:bg-gray-50 w-32 transition-transform duration-200 hover:scale-105"
                              onClick={() => {
                                setShowSortDropdown(!showSortDropdown);
                                setShowCategoryDropdown(false);
                              }}
                            >
                              <span>{selectedSort}</span>
                              <ChevronDown size={20} />
                            </button>
                            {showSortDropdown && (
                              <div className="absolute top-0 right-0 w-56 bg-[#FFFBEB] rounded-2xl shadow-lg z-50 overflow-hidden p-3 animate-fadeIn">
                                {sortOptions.map((op) => (
                                  <button
                                    key={op}
                                    className={`flex items-center justify-center gap-2 w-full px-5 py-3 font-medium rounded-full mb-2 last:mb-0 transition-all ${
                                      selectedSort === op
                                        ? "bg-yellow-400 text-black"
                                        : "bg-yellow-300 text-gray-700 hover:bg-yellow-400"
                                    }`}
                                    onClick={() => {
                                      setSelectedSort(op);
                                      setShowSortDropdown(false);
                                    }}
                                  >
                                    {selectedSort === op && <Check size={18} />}
                                    {op} First
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative" ref={categoryRef}>
                            <button
                              className="flex items-center justify-between px-5 py-3 bg-white text-gray-600 rounded-full font-medium hover:bg-gray-50 w-48 transition-transform duration-200 hover:scale-105"
                              onClick={() => {
                                setShowCategoryDropdown(!showCategoryDropdown);
                                setShowSortDropdown(false);
                              }}
                            >
                              <span className="truncate">
                                {selectedCategory}
                              </span>
                              <ChevronDown size={20} />
                            </button>
                            {showCategoryDropdown && (
                              <div className="absolute top-0 right-0 w-56 bg-[#FFFBEB] rounded-2xl shadow-lg z-50 overflow-hidden p-3 animate-fadeIn">
                                {categories.map((cat) => (
                                  <button
                                    key={cat}
                                    className={`flex items-center gap-2 w-full px-5 py-3 font-medium rounded-full mb-2 last:mb-0 transition-all ${
                                      cat !== "All Categories"
                                        ? "justify-start pl-6"
                                        : "justify-center"
                                    } ${
                                      selectedCategory === cat
                                        ? "bg-yellow-400 text-black"
                                        : "bg-yellow-300 text-gray-700 hover:bg-yellow-400"
                                    }`}
                                    onClick={() => {
                                      setSelectedCategory(cat);
                                      setShowCategoryDropdown(false);
                                    }}
                                  >
                                    {cat !== "All Categories" &&
                                      (categoryIcons[cat] || (
                                        <Blocks size={18} />
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
              <div
                className="flex items-center justify-end gap-4 mt-6 relative z-20"
                ref={starRef}
              >
                <AnimatePresence>
                  {showStarOptions && (
                    <motion.div
                      className="flex justify-end gap-4"
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
                          className={`px-8 py-3 rounded-full font-semibold shadow-md ${
                            activeStarFilter === filter
                              ? "bg-yellow-400 text-black scale-105"
                              : "bg-white text-gray-700"
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
                    className="p-3 bg-[#800000] text-white rounded-full hover:bg-red-900 w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-100 ease-out active:scale-90 hover:scale-110"
                    onClick={() => setShowStarOptions(!showStarOptions)}
                  >
                    <Star size={24} fill="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr className="w-full max-w-7xl mx-auto border-t border-gray-400 my-4" />
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-20 w-full relative z-0">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-600 text-lg">Loading posts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mt-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => setSelectedPost(post)}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-lg">No posts found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.button
          layoutId="post-item-modal"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-10 right-10 bg-[#800000] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-red-900 transition-all z-40 hover:scale-110"
          onClick={() => setShowPostModal(true)}
        >
          <Plus size={40} />
        </motion.button>
      </div>

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
                  /* Removed 'id as any' cast. 
                     Passed parameters directly as they are compatible.
                  */
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
