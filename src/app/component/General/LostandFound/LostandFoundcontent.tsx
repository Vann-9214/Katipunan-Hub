"use client";

import React, { useState, useRef, useEffect } from "react";
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
import PostItemModal, { type ModalPostData } from "./PostItemModal";
import PostViewModal from "./PostViewModal";

// --- Types ---
export type Category =
  | "All Categories"
  | "Electronics"
  | "Wallets"
  | "Books"
  | "Clothing"
  | "Other"
  | "Category";

export type Post = {
  id: number;
  type: "Lost" | "Found";
  imageUrl: string;
  title: string;
  postedBy: string;
  lostOn: string;
  location: string;
  description: string;
  category: Category;
  createdAt: string;
};

export type NewPostData = Omit<Post, "id" | "createdAt">;

type StarFilter = "Lost" | "Found" | "All";
type SortOrder = "Latest" | "Oldest";

// --- Dummy Data (INITIAL_POSTS) ---
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    type: "Lost",
    imageUrl: "/cat.svg",
    title: "White Persian Cat",
    postedBy: "Juan D. | BSCpE",
    lostOn: "Oct 31",
    location: "Last seen in the canteen",
    description: "Very friendly white persian cat, answers to 'Snowy'.",
    category: "Other",
    createdAt: "2025-10-31T10:00:00Z",
  },
  {
    id: 2,
    type: "Found",
    imageUrl: "/cat.svg",
    title: "Scientific Calculator",
    postedBy: "Maria S. | BSME",
    lostOn: "Oct 30",
    location: "Found near the library entrance",
    description: "Casio fx-991EX ClassWiz, has a sticker on the back.",
    category: "Electronics",
    createdAt: "2025-10-30T12:00:00Z",
  },
  {
    id: 3,
    type: "Lost",
    imageUrl: "/Id Card.svg",
    title: "Black Leather Wallet",
    postedBy: "Carlos R. | BSIT",
    lostOn: "Nov 01",
    location: "GLE Building 3rd Floor",
    description: "Contains my student ID and some cash. Please return!",
    category: "Wallets",
    createdAt: "2025-11-01T08:30:00Z",
  },
  {
    id: 4,
    type: "Found",
    imageUrl: "/cat.svg",
    title: "Physics Textbook",
    postedBy: "Liza M. | BSEd",
    lostOn: "Oct 29",
    location: "Study area bench",
    description: "University Physics 14th Edition. Left on the table.",
    category: "Books",
    createdAt: "2025-10-29T14:15:00Z",
  },
  {
    id: 5,
    type: "Lost",
    imageUrl: "/cat.svg",
    title: "Blue PE Shirt",
    postedBy: "Mark T. | BSCE",
    lostOn: "Nov 02",
    location: "Gym Locker Room",
    description: "Size Large, has my initials 'M.T.' on the tag.",
    category: "Clothing",
    createdAt: "2025-11-02T16:45:00Z",
  },
  {
    id: 6,
    type: "Found",
    imageUrl: "/cat.svg",
    title: "Airpods Case",
    postedBy: "Sarah L. | BSN",
    lostOn: "Nov 03",
    location: "Near the main gate",
    description: "White Airpods Pro case, empty. Found it on the ground.",
    category: "Electronics",
    createdAt: "2025-11-03T09:00:00Z",
  },
];

// --- Icon Helper ---
const categoryIcons: { [key in Category]?: React.ReactNode } = {
  Electronics: <Laptop size={18} />,
  Books: <Book size={18} />,
  Clothing: <Shirt size={18} />,
  Other: <Blocks size={18} />,
};

// --- Animation Variants ---
const buttonContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      staggerDirection: -1,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    x: 50,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

const searchSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
};

const searchBarVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: searchSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: 20,
    transition: searchSpring,
  },
};

const searchClosedVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: searchSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: -20,
    transition: searchSpring,
  },
};

// --- Main Component ---
export default function LostandFoundContent() {
  // --- CREATE STATE FOR POSTS ---
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const [showStarOptions, setShowStarOptions] = useState<boolean>(false);
  const [activeStarFilter, setActiveStarFilter] = useState<StarFilter>("All");
  const [showCategoryDropdown, setShowCategoryDropdown] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Category");

  const categories: Category[] = [
    "All Categories",
    "Electronics",
    "Books",
    "Clothing",
    "Other",
  ];

  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<SortOrder>("Latest");
  const sortOptions: SortOrder[] = ["Latest", "Oldest"];

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (starRef.current && !starRef.current.contains(event.target as Node)) {
        setShowStarOptions(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortRef, categoryRef, starRef, searchRef, isSearchOpen]);

  // --- FILTER TO USE STATE (posts) INSTEAD OF CONSTANT ---
  const filteredPosts = posts
    .filter((post) => {
      if (activeStarFilter === "All") return true;
      return post.type === activeStarFilter;
    })
    .filter((post) => {
      if (
        selectedCategory === "All Categories" ||
        selectedCategory === "Category"
      )
        return true;
      return post.category === selectedCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (selectedSort === "Latest") return dateB - dateA;
      return dateA - dateB;
    });

  // --- Handle modal publish action ---
  const handlePublishPost = (data: ModalPostData) => {
    const objectUrl = URL.createObjectURL(data.attachment);

    const newPost: Post = {
      id: Date.now(),
      type: data.itemType,
      imageUrl: objectUrl,
      title: data.itemName,
      postedBy: "You",
      lostOn: new Date().toLocaleDateString(),
      location: data.itemLocation,
      description: data.itemDescription,
      category:
        data.itemCategory === "Select Category" ? "Other" : data.itemCategory,
      createdAt: new Date().toISOString(),
    };

    // --- UPDATE STATE TO INCLUDE NEW POST ---
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative"
      style={{
        backgroundImage: "url('/backgroundimage.svg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0" />

      <main className="max-w-6xl mx-auto px-8 pb-28 relative z-20 pt-[100px]">
        
        {/* --- FIXED TITLE --- */}
        <h1 className="font-bold font-montserrat text-[32px] text-maroon mb-[15px]">
          Lost and Found
        </h1>

        <div className="grid grid-cols-12 items-start gap-8 mt-5">
          {/* --- Title Section --- */}
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

          {/* --- Filter & Search Section --- */}
          <div className="col-span-5 flex flex-col items-end">
            <div
              className="flex justify-end items-center gap-4 w-full h-14 relative z-30"
              ref={searchRef}
            >
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-bar"
                    className="relative w-full"
                    variants={searchBarVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="p-3 pl-12 h-14 bg-white text-gray-700 rounded-full w-full focus:outline-none shadow-lg ring-2 ring-[#fde68a]"
                      autoFocus
                    />
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search-closed"
                    className="flex justify-end items-center gap-4 w-full"
                    variants={searchClosedVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="flex-grow">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-3 bg-white text-gray-600 rounded-full shadow-lg ring-2 ring-[#fde68a] hover:bg-gray-50 flex items-center justify-center w-14 h-14 ml-auto transition-transform duration-200 hover:scale-110"
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
                            {sortOptions.map((option) => (
                              <button
                                key={option}
                                className={`flex items-center justify-center gap-2 w-full px-5 py-3 font-medium rounded-full mb-2 last:mb-0 transition-all ${
                                  selectedSort === option
                                    ? "bg-yellow-400 text-black"
                                    : "bg-yellow-300 text-gray-700 hover:bg-yellow-400"
                                }`}
                                onClick={() => {
                                  setSelectedSort(option);
                                  setShowSortDropdown(false);
                                }}
                              >
                                {selectedSort === option && <Check size={18} />}
                                {option} First
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
                          <span className="truncate">{selectedCategory}</span>
                          <ChevronDown size={20} />
                        </button>
                        {showCategoryDropdown && (
                          <div className="absolute top-0 right-0 w-56 bg-[#FFFBEB] rounded-2xl shadow-lg z-50 overflow-hidden p-3 animate-fadeIn">
                            {categories.map((category) => {
                              const hasIcon = category !== "All Categories";

                              return (
                                <button
                                  key={category}
                                  className={`flex items-center gap-2 w-full px-5 py-3 font-medium rounded-full mb-2 last:mb-0 transition-all ${
                                    hasIcon
                                      ? "justify-start pl-6"
                                      : "justify-center"
                                  } ${
                                    selectedCategory === category
                                      ? "bg-yellow-400 text-black"
                                      : "bg-yellow-300 text-gray-700 hover:bg-yellow-400"
                                  }`}
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {hasIcon &&
                                    (categoryIcons[category] || (
                                      <Blocks size={18} />
                                    ))}
                                  {category}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- Filter Pills --- */}
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
                    <motion.button
                      key="all"
                      variants={buttonVariants}
                      onClick={() => {
                        setActiveStarFilter("All");
                      }}
                      className={`px-8 py-3 rounded-full font-semibold shadow-md
                                  ${
                                    activeStarFilter === "All"
                                      ? "bg-yellow-400 text-black scale-105"
                                      : "bg-white text-gray-700"
                                  }`}
                    >
                      All
                    </motion.button>
                    <motion.button
                      key="found"
                      variants={buttonVariants}
                      onClick={() => {
                        setActiveStarFilter("Found");
                      }}
                      className={`px-8 py-3 rounded-full font-semibold shadow-md
                                  ${
                                    activeStarFilter === "Found"
                                      ? "bg-yellow-400 text-black scale-105"
                                      : "bg-white text-gray-700"
                                  }`}
                    >
                      Found
                    </motion.button>
                    <motion.button
                      key="lost"
                      variants={buttonVariants}
                      onClick={() => {
                        setActiveStarFilter("Lost");
                      }}
                      className={`px-8 py-3 rounded-full font-semibold shadow-md
                                  ${
                                    activeStarFilter === "Lost"
                                      ? "bg-yellow-400 text-black scale-105"
                                      : "bg-white text-gray-700"
                                  }`}
                    >
                      Lost
                    </motion.button>
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

        <hr className="w-full max-w-6xl mx-auto border-t border-gray-400 my-10" />

        <div className="flex flex-wrap justify-start gap-10 pb-20">
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

        {/* --- Add Post Button --- */}
        <motion.button
          layoutId="post-item-modal"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-10 right-10 bg-[#800000] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-red-900 transition-all z-40 hover:scale-110"
          onClick={() => setShowPostModal(true)}
        >
          <Plus size={40} />
        </motion.button>
      </main>

      {/* --- Modals --- */}
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
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}