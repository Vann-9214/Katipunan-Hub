"use client";

import Link from "next/link";
import NavigationButton from "./navigationButtons"; // Assuming this is still used
import Logo from "../Logo"; // Assuming this is still used
import { usePathname } from "next/navigation";
import {
  Bell,
  MessageCircle,
  User,
  Megaphone,
  Newspaper,
  BookOpenText,
  CalendarDays,
  Package,
} from "lucide-react";
import { useState } from "react";
import ChatPopup from "./chatPopup"; // Assuming ChatPopup is one level down

const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "Announcement" },
  { href: "/Feeds", icon: Newspaper, name: "Feeds" },
  { href: "/PLC", icon: BookOpenText, name: "PLC" },
  { href: "/Calendar", icon: CalendarDays, name: "Calendar" },
  { href: "/LostandFound", icon: Package, name: "Lost & Found" },
];

export default function HomepageTab() {
  const pathname = usePathname() ?? "/";
  // 1. Add state to manage the popup visibility
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  // Normalize path (remove trailing slash)
  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;

  const currentPath = normalize(pathname);

  return (
    // Increased z-index to 20 to ensure the popup renders above other elements
    <header className="h-[80px] w-full fixed top-0 left-0 z-20 flex items-center justify-between px-8 bg-gradient-to-r from-[#FFF7CD] to-[#FFC9C9] shadow-md">
      {/* Left: Logo */}
      {/* Assuming Logo component takes width, height, and href props */}
      <Logo width={50} height={55} href="/Announcement" />

      {/* Middle: Navigation Icons */}
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
        {/* Chat Icon - Click to toggle popup */}
        <MessageCircle
          className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]"
          // 2. Add click handler to toggle state
          onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
        />

        <Bell className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
        <Link href="/">
          <User className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
        </Link>

        {/* 3. Conditionally render the Chat Popup */}
        {isChatPopupOpen && (
          <>
            <div
              className="absolute top-[80px] right-0 z-30"
              // Prevent closing if clicking inside the popup
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ensure your ChatPopup component path is correct */}
              <ChatPopup />
            </div>
            {/* 4. Overlay to close the popup when clicking outside */}
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsChatPopupOpen(false)}
            />
          </>
        )}
      </div>
    </header>
  );
}
