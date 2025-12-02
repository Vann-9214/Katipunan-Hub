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
import ChatModal from "./ChatModal";

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
  id: number;
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

// --- DUMMY DATA ---
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    userId: "123",
    type: "Lost",
    status: "Open",
    imageUrl: "/cat.svg",
    title: "White Persian Cat",
    postedBy: "You",
    lostOn: "Oct 31",
    location: "Last seen in the canteen",
    description: "Very friendly white persian cat.",
    category: "Other",
    createdAt: "2025-10-31T10:00:00Z",
    inquiries: [
      {
        id: "u1",
        userName: "Maria S.",
        messagePreview: "I saw a cat nearby!",
        time: "2m ago",
      },
    ],
  },
  {
    id: 2,
    userId: "999",
    type: "Found",
    status: "Resolved",
    imageUrl: "/cat.svg",
    title: "Scientific Calculator",
    postedBy: "Maria S. | BSME",
    lostOn: "Oct 30",
    location: "Found near the library entrance",
    description: "Casio fx-991EX ClassWiz. Owner already claimed it.",
    category: "Electronics",
    createdAt: "2025-10-30T12:00:00Z",
    inquiries: [],
  },
  {
    id: 3,
    userId: "456",
    type: "Lost",
    status: "Open",
    imageUrl: "/Id Card.svg",
    title: "Black Leather Wallet",
    postedBy: "Carlos R. | BSIT",
    lostOn: "Nov 01",
    location: "GLE Building 3rd Floor",
    description: "Contains my student ID and some cash. Please return!",
    category: "Wallets",
    createdAt: "2025-11-01T08:30:00Z",
    inquiries: [],
  },
  {
    id: 4,
    userId: "789",
    type: "Found",
    status: "Resolved",
    imageUrl: "/cat.svg",
    title: "Physics Textbook",
    postedBy: "Liza M. | BSEd",
    lostOn: "Oct 29",
    location: "Study area bench",
    description: "University Physics 14th Edition. Returned to owner.",
    category: "Books",
    createdAt: "2025-10-29T14:15:00Z",
    inquiries: [],
  },
  {
    id: 5,
    userId: "101",
    type: "Lost",
    status: "Open",
    imageUrl: "/cat.svg",
    title: "Blue PE Shirt",
    postedBy: "Mark T. | BSCE",
    lostOn: "Nov 02",
    location: "Gym Locker Room",
    description: "Size Large, has my initials 'M.T.' on the tag.",
    category: "Clothing",
    createdAt: "2025-11-02T16:45:00Z",
    inquiries: [],
  },
  {
    id: 6,
    userId: "102",
    type: "Found",
    status: "Resolved",
    imageUrl: "/cat.svg",
    title: "Airpods Case",
    postedBy: "Sarah L. | BSN",
    lostOn: "Nov 03",
    location: "Near the main gate",
    description: "White Airpods Pro case. Returned to owner.",
    category: "Electronics",
    createdAt: "2025-11-03T09:00:00Z",
    inquiries: [],
  },
];

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
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

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

  const handlePublishPost = (data: ModalPostData) => {
    const objectUrl = URL.createObjectURL(data.attachment);
    const newPost: Post = {
      id: Date.now(),
      userId: user?.id || "anonymous",
      type: data.itemType,
      status: "Open",
      imageUrl: objectUrl,
      title: data.itemName,
      postedBy: user?.name || "You",
      lostOn: new Date().toLocaleDateString(),
      location: data.itemLocation,
      description: data.itemDescription,
      category:
        data.itemCategory === "Select Category" ? "Other" : data.itemCategory,
      createdAt: new Date().toISOString(),
      inquiries: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleStatusUpdate = (
    postId: number,
    newStatus: "Open" | "Resolved"
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: newStatus } : post
      )
    );
    setSelectedPost((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleOpenChat = () => {
    setShowChatModal(true);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col overflow-hidden bg-[#faf3e0]">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/backgroundimage.svg')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          transform: "scale(1.05)",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-1" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-1" />

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

      {/* --- MODALS --- */}
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
                  // Check if user exists before checking ID
                  isOwner={user ? user.id === selectedPost.userId : false}
                  onClose={() => setSelectedPost(null)}
                  onStatusChange={handleStatusUpdate}
                  onChat={handleOpenChat}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showChatModal && selectedPost && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10000,
                    pointerEvents: "auto",
                  }}
                >
                  <ChatModal
                    post={selectedPost}
                    onClose={() => setShowChatModal(false)}
                    // FIX: Added these props back to satisfy the TypeScript interface
                    // They are required by the ChatModal component definition
                    isOwner={user ? user.id === selectedPost.userId : false}
                    onStatusChange={() => {}} // Dummy function
                    onChat={() => {}} // Dummy function
                  />
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}
