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

// --- 1. ADD IMPORTS ---
// (These paths are from your file)
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../supabase/Lib/General/user";

const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "Announcement" },
  { href: "/Feeds", icon: Newspaper, name: "Feeds" },
  { href: "/PLC", icon: BookOpenText, name: "PLC" },
  { href: "/Calendar", icon: CalendarDays, name: "Calendar" },
  { href: "/LostandFound", icon: Package, name: "Lost & Found" },
];

export default function HomepageTab() {
  const pathname = usePathname() ?? "/";
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- 2. ADD STATE TO HOLD THE USER ---
  const [user, setUser] = useState<User | null>(null);

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;

  const currentPath = normalize(pathname);
  const isOnMessagePage = pathname.startsWith("/Message");

  // --- (Existing effects are fine) ---
  useEffect(() => {
    if (isOnMessagePage) {
      setIsChatPopupOpen(false);
    }
  }, [isOnMessagePage]);

  useEffect(() => {
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // --- 3. ADD EFFECT TO FETCH USER DATA ON LOAD ---
  useEffect(() => {
    const loadUserData = async () => {
      const userDetails = await getCurrentUserDetails();
      if (userDetails) {
        setUser(userDetails);
      }
    };
    loadUserData();
  }, []); // Empty array means this runs once when the component mounts

  return (
    <header className="h-[80px] w-full fixed top-0 left-0 z-20 flex items-center justify-between px-8 bg-gradient-to-r from-[#FFF7CD] to-[#FFC9C9] shadow-md">
      {/* --- (Left: Logo) --- */}
      <Logo width={50} height={55} href="/Announcement" />

      {/* --- (Middle: Navigation) --- */}
      <nav className="flex gap-4">
        {navItems.map((item) => {
          const itemPath = normalize(item.href);
          const isActive = currentPath === itemPath;

          return (
            <NavigationButton
              key={item.name}
              label={item.name}
              icon={item.icon}
              href={item.href}
              isActive={isActive}
            />
          );
        })}
      </nav>

      {/* --- (Right: User Icons) --- */}
      <div className="flex gap-8 items-center text-black relative">
        {/* --- (Chat Icon & Popup) --- */}
        {!isOnMessagePage && (
          <>
            <button
              onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
              className="rounded-full
                         cursor-pointer transition-colors bg-black/10
                         hover:brightness-150"
            >
              <Image
                src="/Chat.svg"
                alt="Chat Messages"
                width={43}
                height={43}
                className="p-1 rounded-full object-cover transition-color"
              />
            </button>

            {isChatPopupOpen && (
              <>
                <div
                  className="absolute top-14 right-0 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChatPopup />
                </div>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsChatPopupOpen(false)}
                />
              </>
            )}
          </>
        )}

        {/* --- (Notification Bell) --- */}
        <Bell className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />

        {/* --- Profile Avatar & Dropdown --- */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`rounded-full
                           cursor-pointer transition-colors
                           hover:bg-black/10
                           ${isProfileOpen ? "bg-black/10" : "bg-transparent"}`}
          >
            {/* --- 4. USE THE USER DATA FROM STATE --- */}
            <Avatar
              avatarURL={user?.avatarURL}
              altText={user?.fullName || "User Profile"}
              className="w-[43px] h-[43px]"
            />
          </button>

          {/* Profile Dropdown Logic */}
          {isProfileOpen && (
            <>
              <div
                className="absolute top-14 right-0 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {/* This component fetches its own data, which is fine, 
                  but now our main button also has data.
                */}
                <AccountDropdown
                  user={user}
                  onClose={() => setIsProfileOpen(false)}
                />
              </div>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsProfileOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
