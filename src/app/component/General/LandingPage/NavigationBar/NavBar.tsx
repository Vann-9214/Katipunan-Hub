"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600"], // SemiBold
});

type NavBarProps = {
  currentTab: string;
};

export default function NavBar({ currentTab }: NavBarProps) {
  const [activeIcon, setActiveIcon] = useState<string>("");

  const tabs = [
    { name: "Announcement", path: "/announcement" },
    { name: "Feeds", path: "/feed" },
    { name: "Groups", path: "/group" },
    { name: "Calendar", path: "/calendar" },
    { name: "PLC", path: "/plc" },
    { name: "Lost & Found", path: "/lost&found" },
  ];

  const icons = [
    { name: "Chat", file: "/Chat.svg" },
    { name: "Notifications", file: "/Notifications.svg" },
    { name: "Account", file: "/Account.svg" },
    { name: "Settings", file: "/Settings.svg" },
  ];

  return (
    <nav className={`w-full shadow-md ${montserrat.className}`}>
      {/* 🔝 Top Bar with background (90px height) */}
      <div className="w-full h-[90px] relative">
        <Image
          src="/Navbar.svg"
          alt="Navbar background"
          fill
          className="object-cover"
          priority
        />

        {/* Right side icons */}
        <div className="absolute inset-0 flex items-center justify-end px-8 gap-6">
          {icons.map((icon) => (
            <button
              key={icon.name}
              onClick={() => setActiveIcon(icon.name)}
              className="relative"
            >
              <Image
                src={icon.file}
                alt={icon.name}
                width={40}
                height={40}
                className={`transition duration-200 ${
                  activeIcon === icon.name
                    ? "brightness-0 invert sepia saturate-500 hue-rotate-[10deg]"
                    : ""
                }`}
                style={
                  activeIcon === icon.name
                    ? { filter: "brightness(0) saturate(100%) invert(74%) sepia(93%) saturate(558%) hue-rotate(8deg) brightness(105%) contrast(105%)" }
                    : {}
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* 🔻 Bottom Tabs (65px) */}
      <div className="flex justify-around items-center bg-white text-gray-700 h-[65px] shadow-inner">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.path}>
            <span
              className={`text-[24px] font-semibold hover:text-red-600 cursor-pointer ${
                currentTab === tab.name ? "text-red-600 font-bold" : ""
              }`}
            >
              {tab.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}