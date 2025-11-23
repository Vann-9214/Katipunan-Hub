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
import { useState, useEffect } from "react";
import ChatPopup from "../../General/Message/ChatPopup/chatPopup";
import Avatar from "../../ReusableComponent/Avatar";
import AccountDropdown from "../../General/Account/accountDropdown";
import type { User } from "../../../../../supabase/Lib/General/user";
import { motion, AnimatePresence } from "framer-motion"; // ADDED AnimatePresence

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
  }, [pathname]);

  return (
    // Header
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      // Fixed Height: 80px always
      className="
        w-full fixed top-0 left-0 z-[20] shadow-md 
        bg-[#FFE6CE]
        h-[80px]
        flex items-center 
        justify-between
        px-2 sm:px-4 md:px-8
      "
    >
      {/* --- LEFT: LOGO --- */}
      {/* >= 1080px: Full Logo
         860px - 1079px: Icon Only
         < 860px: GONE (Hidden)
      */}
      <div className="hidden min-[860px]:block flex-shrink-0 mr-4">
        <div className="hidden min-[1080px]:block">
          <Logo width={50} height={55} href="/Announcement" />
        </div>
        <div className="block min-[1080px]:hidden">
          <Logo width={50} height={55} href="/Announcement" showText={false} />
        </div>
      </div>

      {/* --- MIDDLE: NAVIGATION --- */}
      {/* >= 860px: Centered in the available space (flex-1, justify-center)
         < 860px: Justify-start (pushes to the left since logo is gone)
      */}
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
      {/* Justify-end to stick to the right side */}
      <div className="flex gap-2 sm:gap-4 lg:gap-8 items-center justify-end text-black relative flex-shrink-0 ml-2">
        {/* Chat Icon */}
        {!isOnMessagePage && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
              className="rounded-full cursor-pointer transition-colors bg-black/10 hover:brightness-150 flex items-center justify-center"
            >
              {/* Large Icon */}
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
              {/* Small Icon (Mobile) */}
              <div className="block sm:hidden">
                <Image
                  src="/Chat.svg"
                  alt="Chat"
                  width={30}
                  height={30}
                  className="p-1 rounded-full object-cover"
                />
              </div>
            </button>
            <AnimatePresence>
              {" "}
              {/* ADDED AnimatePresence */}
              {isChatPopupOpen && (
                <>
                  <motion.div
                    key="chat-popup"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-14 right-0 z-30 w-[280px] sm:w-[350px] origin-top-right" // ADDED origin-top-right
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

        {/* Bell Icon */}
        <div className="flex-shrink-0">
          <Bell className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
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
            {" "}
            {/* ADDED AnimatePresence */}
            {isProfileOpen && (
              <>
                <motion.div
                  key="profile-dropdown"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-0 z-30 origin-top-right" // ADDED origin-top-right
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
