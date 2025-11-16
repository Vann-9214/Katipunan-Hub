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

// Component Interface
interface HomepageTabProps {
  user: User | null;
}

// Navigation
const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "Announcement" },
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

  // Effects
  useEffect(() => {
    if (isOnMessagePage) {
      setIsChatPopupOpen(false);
    }
  }, [isOnMessagePage]);

  useEffect(() => {
    setIsChatPopupOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Render
  return (
    <header className="h-[80px] w-full fixed top-0 left-0 z-20 flex items-center justify-between px-8 bg-gradient-to-r from-[#FFF7CD] to-[#FFC9C9] shadow-md">
      {/* Left: Logo */}
      <Logo width={50} height={55} href="/Announcement" />

      {/* Middle: Navigation */}
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

      {/* Right: User Icons */}
      <div className="flex gap-8 items-center text-black relative">
        {/* Chat Icon & Popup */}
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

        {/* Notification Bell */}
        <Bell className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`rounded-full
                           cursor-pointer transition-colors
                           hover:bg-black/10
                           ${isProfileOpen ? "bg-black/10" : "bg-transparent"}`}
          >
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
