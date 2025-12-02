"use client";

import Image from "next/image";
import NavigationButton from "./navigationButtons";
import Logo from "../Logo";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Megaphone,
  Newspaper,
  BookOpenText,
  CalendarDays,
  Package,
  Search,
  User as UserIcon,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import ChatPopup from "../../General/Message/ChatPopup/chatPopup";
import Avatar from "../../ReusableComponent/Avatar";
import AccountDropdown from "../../General/Account/accountDropdown";
import type { User } from "../../../../../supabase/Lib/General/user";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";

import { useNotifications } from "../../../../../supabase/Lib/General/useNotification";
import NotificationDropdown from "./NotificationDropdown";

interface HomepageTabProps {
  user: User | null;
}

const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "News" },
  { href: "/Feeds", icon: Newspaper, name: "Feeds" },
  { href: "/PLC", icon: BookOpenText, name: "PLC" },
  { href: "/Calendar", icon: CalendarDays, name: "Calendar" },
  { href: "/LostandFound", icon: Package, name: "Lost & Found" },
];

// Type for our Unified Search Result
interface GlobalSearchResult {
  id: string;
  type: "user" | "news" | "plc" | "feed";
  title: string;
  subtitle: string;
  url: string;
  image?: string | null;
}

export default function HomepageTab({ user }: HomepageTabProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  // --- STATE ---
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { unreadCount, notifications, isLoading, markAsRead } =
    useNotifications(user);

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
  const currentPath = normalize(pathname);
  const isOnMessagePage = pathname.startsWith("/Message");

  // --- EFFECTS ---

  // Close dropdowns on route change
  useEffect(() => {
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery(""); // Optional: Clear search on navigate
  }, [pathname]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- WILDCARD SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowSearchDropdown(true);

      try {
        // 1. Fetch Users (Removed 'email' from select to prevent crash)
        const { data: usersData, error: userError } = await supabase
          .from("Accounts")
          .select("id, fullName, avatarURL") // <-- FIXED HERE
          .ilike("fullName", `%${searchQuery}%`)
          .limit(3);

        if (userError) console.error("User search error:", userError);

        // 2. Fetch News/Announcements (Wildcard match on title)
        const { data: newsData, error: newsError } = await supabase
          .from("Posts")
          .select("id, title, created_at")
          .eq("type", "announcement")
          .ilike("title", `%${searchQuery}%`)
          .limit(3);

        if (newsError) console.error("News search error:", newsError);

        // -- Process Results --
        const results: GlobalSearchResult[] = [];

        // Add Users
        if (usersData) {
          usersData.forEach((u) => {
            // Don't show self
            if (u.id !== user?.id) {
              results.push({
                id: u.id,
                type: "user",
                title: u.fullName || "Unknown User",
                subtitle: "User",
                url: `/Profile/${u.id}`, // <-- Leads to Profile Page
                image: u.avatarURL,
              });
            }
          });
        }

        // Add News
        if (newsData) {
          newsData.forEach((n) => {
            results.push({
              id: n.id,
              type: "news",
              title: n.title,
              subtitle: new Date(n.created_at).toLocaleDateString(),
              url: `/Announcement?id=${n.id}`,
            });
          });
        }

        setSearchResults(results);
      } catch (error) {
        console.error("Search Critical Error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user?.id]);

  // Fetch Chat Badge
  const fetchChatUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("Messages")
        .select("conversation_id")
        .neq("sender_id", user.id)
        .is("read_at", null);
      if (error || !data) return;
      const uniqueConversations = new Set(
        data.map((msg) => msg.conversation_id)
      );
      setChatUnreadCount(uniqueConversations.size);
    } catch (err) {
      console.error("Error fetching chat unread count:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchChatUnreadCount();
    const channel = supabase
      .channel("homepage_chat_badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Messages" },
        () => {
          fetchChatUnreadCount();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchChatUnreadCount]);

  const handleBellClick = () => {
    if (!isNotificationOpen) markAsRead();
    setIsNotificationOpen(!isNotificationOpen);
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setShowSearchDropdown(false);
    setSearchQuery("");
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full fixed top-0 left-0 z-50 shadow-2xl h-[80px] flex items-center justify-between px-2 sm:px-4 md:px-8 overflow-visible"
      style={{
        background: "linear-gradient(to bottom, #4e0505, #3a0000)",
        borderBottom: "3px solid transparent",
        borderImage: "linear-gradient(to right, #EFBF04, #FFD700, #D4AF37) 1",
      }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/noise.png')] mix-blend-overlay" />

      {/* --- LEFT SECTION: LOGO + WILDCARD SEARCH --- */}
      <div className="flex items-center gap-6 flex-shrink-0 relative z-10">
        <div className="hidden min-[860px]:block">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#FFFDF5] rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] border border-[#FFD700]/30"
          >
            <div className="hidden min-[1080px]:block">
              <Logo
                width={45}
                height={50}
                href="/Announcement"
                showText={false}
              />
            </div>
            <div className="block min-[1080px]:hidden">
              <Logo
                width={45}
                height={50}
                href="/Announcement"
                showText={false}
              />
            </div>
          </motion.div>
        </div>

        {/* --- WILDCARD SEARCH BAR --- */}
        <div
          ref={searchContainerRef}
          className="hidden md:block relative w-[200px] lg:w-[280px]"
        >
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowSearchDropdown(true);
              }}
              placeholder="Search..."
              className="w-full h-[40px] pl-10 pr-4 rounded-full bg-black/20 border border-[#EFBF04]/30 text-white placeholder-white/50 text-[13px] focus:outline-none focus:border-[#EFBF04] focus:bg-black/30 transition-all shadow-inner"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#EFBF04]/80"
            />

            {/* Loading Indicator inside input */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-[#EFBF04]" />
              </div>
            )}
          </div>

          {/* --- RESULTS DROPDOWN --- */}
          <AnimatePresence>
            {showSearchDropdown && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[48px] left-0 w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-[#EFBF04]/30 z-50"
              >
                {/* Header Gradient */}
                <div className="h-1 bg-gradient-to-r from-[#EFBF04] via-[#FFD700] to-[#D4AF37]" />

                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-6 text-center text-gray-400 text-xs italic">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.url)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFF9E5] cursor-pointer transition-colors border-b border-gray-50 last:border-none group"
                      >
                        {/* Icon / Avatar Area */}
                        <div className="shrink-0">
                          {result.type === "user" ? (
                            <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden">
                              <Avatar
                                avatarURL={result.image}
                                altText={result.title}
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#8B0E0E]/10 flex items-center justify-center text-[#8B0E0E] group-hover:bg-[#8B0E0E] group-hover:text-[#EFBF04] transition-colors">
                              <Megaphone size={16} />
                            </div>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 truncate font-montserrat group-hover:text-[#8B0E0E]">
                            {result.title}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium truncate flex items-center gap-1">
                            {result.type === "user" ? (
                              <span className="flex items-center gap-1">
                                <UserIcon size={10} /> User
                              </span>
                            ) : (
                              <span>News • {result.subtitle}</span>
                            )}
                          </p>
                        </div>

                        <ChevronRight
                          size={14}
                          className="text-gray-300 group-hover:text-[#EFBF04]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Tip */}
                <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100">
                  Type to search users or news
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MIDDLE: NAVIGATION --- */}
      <nav className="flex items-center gap-1 lg:gap-4 overflow-hidden px-1 flex-1 justify-center relative z-10">
        {navItems.map((item) => {
          const isActive = normalize(item.href) === currentPath;
          return (
            <div
              key={item.name}
              className="transform scale-[0.65] xs:scale-[0.75] sm:scale-90 md:scale-100 transition-transform origin-center"
            >
              <NavigationButton
                label={item.name}
                icon={item.icon}
                href={item.href}
                isActive={isActive}
                theme="dark"
              />
            </div>
          );
        })}
      </nav>

      {/* --- RIGHT: USER ICONS --- */}
      <div className="flex gap-2 sm:gap-4 lg:gap-8 items-center justify-end relative flex-shrink-0 ml-2 z-10">
        {/* Chat Icon */}
        {!isOnMessagePage && (
          <div className="relative flex-shrink-0">
            <motion.button
              onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
              className="rounded-full cursor-pointer transition-all bg-white/10 hover:bg-white/20 flex items-center justify-center relative border border-white/5 hover:border-[#FFD700]/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="p-2">
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={28}
                  height={28}
                  className="invert brightness-0 opacity-90"
                />
              </div>

              <AnimatePresence>
                {chatUnreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#FFD700] text-[#4e0505] text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-[#3a0000] shadow-lg z-10"
                  >
                    {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {isChatPopupOpen && (
                <>
                  <motion.div
                    key="chat-popup"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-16 right-0 z-30 w-[280px] sm:w-[350px] origin-top-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChatPopup />
                  </motion.div>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsChatPopupOpen(false)}
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative flex-shrink-0">
          <motion.button
            onClick={handleBellClick}
            className="flex items-center justify-center relative focus:outline-none w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/5 hover:border-[#FFD700]/50 transition-all"
            whileHover={{ rotate: [0, -15, 15, -10, 10, 0], scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-6 h-6 text-white/90 hover:text-[#FFD700] transition-colors" />

            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-[#FFD700] text-[#4e0505] text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-[#3a0000] shadow-lg"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {isNotificationOpen && (
              <>
                <motion.div
                  key="notif-popup"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-16 right-[-60px] sm:right-0 z-30 origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotificationDropdown
                    notifications={notifications}
                    isLoading={isLoading}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </motion.div>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsNotificationOpen(false)}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`rounded-full cursor-pointer transition-all border-[2px] p-[1px] ${
              isProfileOpen
                ? "border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                : "border-white/20 hover:border-[#FFD700]/70"
            }`}
          >
            <Avatar
              avatarURL={user?.avatarURL}
              altText={user?.fullName || "User Profile"}
              className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] lg:w-[44px] lg:h-[44px]"
            />
          </button>
          <AnimatePresence>
            {isProfileOpen && (
              <>
                <motion.div
                  key="profile-dropdown"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-16 right-0 z-30 origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AccountDropdown
                    user={user}
                    onClose={() => setIsProfileOpen(false)}
                  />
                </motion.div>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsProfileOpen(false)}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
