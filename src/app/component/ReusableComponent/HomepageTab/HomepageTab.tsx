"use client";

import Image from "next/image";
import NavigationButton from "./navigationButtons";
import Logo from "../Logo";
import { usePathname } from "next/navigation";
import {
  Bell,
  Megaphone,
  Newspaper,
  BookOpenText,
  CalendarDays,
  Package,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import ChatPopup from "../../General/Message/ChatPopup/chatPopup";
import Avatar from "../../ReusableComponent/Avatar";
import AccountDropdown from "../../General/Account/accountDropdown";
import type { User } from "../../../../../supabase/Lib/General/user";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient"; // Added import

// --- IMPORTS ---
import { useNotifications } from "../../../../../supabase/Lib/General/useNotification";
import NotificationDropdown from "./NotificationDropdown";

// Component Interface
interface HomepageTabProps {
  user: User | null;
}

// Navigation
const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "News" },
  { href: "/Feeds", icon: Newspaper, name: "Feeds" },
  { href: "/PLC", icon: BookOpenText, name: "PLC" },
  { href: "/Calendar", icon: CalendarDays, name: "Calendar" },
  { href: "/LostandFound", icon: Package, name: "Lost & Found" },
];

// Component
export default function HomepageTab({ user }: HomepageTabProps) {
  const pathname = usePathname() ?? "/";
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- CHAT BADGE STATE ---
  // This counts how many PEOPLE have messaged you (Unique conversations)
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // --- NOTIFICATIONS STATE ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, notifications, isLoading, markAsRead } =
    useNotifications(user);

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;

  const currentPath = normalize(pathname);
  const isOnMessagePage = pathname.startsWith("/Message");

  useEffect(() => {
    if (isOnMessagePage) {
      setIsChatPopupOpen(false);
    }
  }, [isOnMessagePage]);

  useEffect(() => {
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
  }, [pathname]);

  // --- NEW: CALCULATE UNIQUE CHAT SENDERS ---
  const fetchChatUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch all unread messages that were NOT sent by me
      const { data, error } = await supabase
        .from("Messages")
        .select("conversation_id")
        .neq("sender_id", user.id) // Not my messages
        .is("read_at", null); // That are unread

      if (error || !data) return;

      // Use a Set to count UNIQUE conversation IDs
      // If Person A sent 4 messages, they appear 4 times in 'data', but only once in the Set.
      const uniqueConversations = new Set(
        data.map((msg) => msg.conversation_id)
      );

      // This number represents "How many people have unread messages for me"
      setChatUnreadCount(uniqueConversations.size);
    } catch (err) {
      console.error("Error fetching chat unread count:", err);
    }
  }, [user?.id]);

  // --- NEW: CHAT REALTIME LISTENER ---
  useEffect(() => {
    if (!user?.id) return;

    fetchChatUnreadCount(); // Initial fetch

    const channel = supabase
      .channel("homepage_chat_badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Messages" },
        () => {
          fetchChatUnreadCount(); // Update count on any message change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchChatUnreadCount]);

  // Handler
  const handleBellClick = () => {
    if (!isNotificationOpen) {
      markAsRead();
    }
    setIsNotificationOpen(!isNotificationOpen);
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
  };

  return (
    // Header
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="
        w-full fixed top-0 left-0 z-20 shadow-md 
        bg-[#FFE6CE]
        h-[80px]
        flex items-center 
        justify-between
        px-2 sm:px-4 md:px-8
      "
    >
      {/* --- LEFT: LOGO --- */}
      <div className="hidden min-[860px]:block flex-shrink-0 mr-4">
        <div className="hidden min-[1080px]:block">
          <Logo width={50} height={55} href="/Announcement" />
        </div>
        <div className="block min-[1080px]:hidden">
          <Logo width={50} height={55} href="/Announcement" showText={false} />
        </div>
      </div>

      {/* --- MIDDLE: NAVIGATION --- */}
      <nav
        className={`
        flex items-center gap-1 lg:gap-4 overflow-hidden px-1
        min-[860px]:flex-1 min-[860px]:justify-center
        max-[859px]:justify-start
      `}
      >
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
              />
            </div>
          );
        })}
      </nav>

      {/* --- RIGHT: USER ICONS --- */}
      <div className="flex gap-2 sm:gap-4 lg:gap-8 items-center justify-end text-black relative flex-shrink-0 ml-2">
        {/* Chat Icon */}
        {!isOnMessagePage && (
          <div className="relative flex-shrink-0">
            <motion.button
              onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
              className="rounded-full cursor-pointer transition-colors bg-black/10 hover:brightness-150 flex items-center justify-center relative" // Added relative
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="hidden sm:block">
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={43}
                  height={43}
                  className="p-1 rounded-full object-cover hidden min-[860px]:block"
                />
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={36}
                  height={36}
                  className="p-1 rounded-full object-cover block min-[860px]:hidden"
                />
              </div>
              <div className="block sm:hidden">
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={30}
                  height={30}
                  className="p-1 rounded-full object-cover"
                />
              </div>

              {/* --- CHAT BADGE (Counts Unique People) --- */}
              <AnimatePresence>
                {chatUnreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#8B0E0E] text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-[#FFE6CE] z-10"
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
                    transition={{ duration: 0.2 }}
                    className="absolute top-14 right-0 z-30 w-[280px] sm:w-[350px] origin-top-right"
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

        {/* --- NOTIFICATION BELL ICON --- */}
        <div className="relative flex-shrink-0">
          <motion.button
            onClick={handleBellClick}
            className="flex items-center justify-center relative focus:outline-none"
            whileHover={{ rotate: [0, -15, 15, -10, 10, 0], scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Bell className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 cursor-pointer text-black hover:text-[#8B0E0E] transition-colors" />

            {/* Notification Badge (Counts unread notifications) */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-[#8B0E0E] text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-[#FFE6CE]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isNotificationOpen && (
              <>
                <motion.div
                  key="notif-popup"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-[-60px] sm:right-0 z-30 origin-top-right"
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
            className={`rounded-full cursor-pointer transition-colors hover:bg-black/10 ${
              isProfileOpen ? "bg-black/10" : "bg-transparent"
            }`}
          >
            <Avatar
              avatarURL={user?.avatarURL}
              altText={user?.fullName || "User Profile"}
              className="w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] lg:w-[43px] lg:h-[43px]"
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
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-0 z-30 origin-top-right"
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
