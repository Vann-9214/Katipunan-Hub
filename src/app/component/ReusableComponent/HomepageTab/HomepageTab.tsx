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

export default function HomepageTab({ user }: HomepageTabProps) {
  const pathname = usePathname() ?? "/";
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, notifications, isLoading, markAsRead } =
    useNotifications(user);

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
  const currentPath = normalize(pathname);
  const isOnMessagePage = pathname.startsWith("/Message");

  useEffect(() => {
    if (isOnMessagePage) setIsChatPopupOpen(false);
  }, [isOnMessagePage]);

  useEffect(() => {
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
  }, [pathname]);

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

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full fixed top-0 left-0 z-50 shadow-2xl h-[80px] flex items-center justify-between px-2 sm:px-4 md:px-8 overflow-visible"
      // 1. Fusion Background: Deep Maroon Gradient
      style={{
        background: "linear-gradient(to bottom, #4e0505, #3a0000)",
        borderBottom: "3px solid transparent",
        borderImage: "linear-gradient(to right, #EFBF04, #FFD700, #D4AF37) 1",
      }}
    >
      {/* 2. Subtle Noise/Pattern Overlay (Optional for texture) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/noise.png')] mix-blend-overlay" />

      {/* --- LEFT: LOGO (Wrapped in White Card for Contrast) --- */}
      <div className="hidden min-[860px]:block flex-shrink-0 mr-4 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#FFFDF5] rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] border border-[#FFD700]/30"
        >
          <div className="hidden min-[1080px]:block">
            <Logo width={45} height={50} href="/Announcement" />
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

      {/* --- MIDDLE: NAVIGATION (Passed 'dark' theme) --- */}
      <nav className="flex items-center gap-1 lg:gap-4 overflow-hidden px-1 min-[860px]:flex-1 min-[860px]:justify-center max-[859px]:justify-start relative z-10">
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
                theme="dark" // Enables White/Gold styling
              />
            </div>
          );
        })}
      </nav>

      {/* --- RIGHT: USER ICONS (White/Gold Theme) --- */}
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
                {/* TINTED ICON: Using CSS filter to make the black icon white/gold */}
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={28}
                  height={28}
                  className="invert brightness-0 opacity-90" // Inverts black to white
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
