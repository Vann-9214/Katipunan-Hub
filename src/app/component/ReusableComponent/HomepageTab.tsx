"use client";

import Link from "next/link";
import NavigationButton from "./navigationButtons";
import Logo from "./Logo";
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

const navItems = [
  { href: "/Announcement", icon: Megaphone, name: "Announcement" },
  { href: "/Feeds", icon: Newspaper, name: "Feeds" },
  { href: "/PLC", icon: BookOpenText, name: "PLC" },
  { href: "/Calendar", icon: CalendarDays, name: "Calendar" },
  { href: "/LostandFound", icon: Package, name: "Lost & Found" },
];

export default function HomepageTab() {
  const pathname = usePathname() ?? "/";

  // Normalize path (remove trailing slash)
  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;

  const currentPath = normalize(pathname);

  return (
    <header className="h-[80px] w-full fixed top-0 left-0 z-10 flex items-center justify-between px-8 bg-gradient-to-r from-[#FFF7CD] to-[#FFC9C9] shadow-md">
      {/* Left: Logo */}
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
      <div className="flex gap-8 items-center text-black">
        <MessageCircle className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
        <Bell className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
        <Link href="/">
          <User className="w-8 h-8 cursor-pointer transition-colors hover:text-[#8B0E0E]" />
        </Link>
      </div>
    </header>
  );
}
