"use client";

import Logo from "./Logo";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle, User, Settings } from "lucide-react";

const navItems = [
  { name: "Announcement", href: "/Announcement" },
  { name: "Feeds", href: "/Feeds" },
  { name: "Groups", href: "/Groups" },
  { name: "PLC", href: "/PLC" },
  { name: "Calendar", href: "/Calendar" },
  { name: "Lost & Found", href: "/LostandFound" },
];

export default function HomepageTab() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (href: string) => {
    router.push(href); // ✅ Safe for client navigation — no SSR mismatch
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[1] shadow-md">
      {/* Top Gradient Bar */}
      <div className="flex justify-between items-center h-[80px] px-8 py-2 bg-[linear-gradient(to_right,#FFFFFF_0%,#EFBF04_60%,#8B0E0E_87%,#4E0505_100%)]">
        {/* Left: Logo */}
        <Logo href="/Announcement" />

        {/* Right: Icons */}
        <div className="flex gap-10 text-gold">
          <MessageCircle className="w-[50px] h-[50px] cursor-pointer hover:scale-110 transition" />
          <Bell className="w-[50px] h-[50px] cursor-pointer hover:scale-110 transition" />
          <User className="w-[50px] h-[50px] cursor-pointer hover:scale-110 transition" />
          <Settings
            className="w-[50px] h-[50px] cursor-pointer hover:scale-110 transition"
            onClick={() => router.push("/")}
          />
        </div>
      </div>

      {/* Bottom Navigation Tabs */}
      <nav className="bg-white h-[70px] flex justify-around items-center py-2 shadow-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleClick(item.href)}
              className={`font-montserrat text-[24px] font-medium transition-all ${
                isActive
                  ? "text-maroon border-maroon drop-shadow-[0_0_0.75px_#8B0E0E] cursor-pointer"
                  : "text-black drop-shadow-[0_0_0.5px_#00000099] hover:text-maroon hover:drop-shadow-[0_0_0.75px_#8B0E0E] cursor-pointer"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>
    </header>
  );
}