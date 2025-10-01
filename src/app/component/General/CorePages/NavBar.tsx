"use client";

import Image from "next/image";

type NavBarProps = {
  currentTab: string; // e.g. "Announcement", "Feeds", etc.
};

export default function NavBar({ currentTab }: NavBarProps) {
  const tabs = [
    "Announcement",
    "Feeds",
    "Groups",
    "PLC",
    "Calendar",
    "Lost & Found",
  ];

  return (
    <nav className="w-full shadow-md">
      {/* Top Bar (SVG) */}
      <div className="w-full">
        <Image
          src="/NavBar.svg" // put your NavBar.svg inside public/
          alt="Katipunan NavBar"
          width={1440}
          height={90}
          priority
        />
      </div>

      {/* Bottom Tabs */}
      <div className="flex justify-around bg-white text-gray-700 font-medium py-2 shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`hover:text-red-600 ${
              currentTab === tab ? "text-red-600 font-semibold" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}