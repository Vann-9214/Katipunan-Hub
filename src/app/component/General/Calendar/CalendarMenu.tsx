"use client";
import React from "react";
import Image from "next/image";
import { PT_Sans } from "next/font/google";
import { MenuType } from "@/app/component/General/Calendar/types";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface CalendarMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  selectedMenu: MenuType;
  viewMode: "month" | "year";
  onMenuSelect: (name: string) => void;
}

export default function CalendarMenu({
  menuOpen,
  setMenuOpen,
  selectedMenu,
  viewMode,
  onMenuSelect,
}: CalendarMenuProps) {
  // Reordered: Reminder first, Schedule second
  const menuItems = [
    { name: "Reminder", icon: "/Bellplus.svg" },
    { name: "Schedule", icon: "/Schedule.svg" },
  ];

  // --- LOGIC: Determines which view is currently active ---
  // Year is active when viewMode is "year"
  const isYearToggled = viewMode === "year";
  // Month is active when viewMode is "month"
  const isMonthToggled = viewMode === "month";

  // --- FILTERS (Maroon and Gray) ---
  const maroonFilter =
    "brightness(0) saturate(100%) invert(11%) sepia(89%) saturate(7417%) hue-rotate(357deg) brightness(93%) contrast(119%)";
  const grayFilter = "grayscale(100%) opacity(0.4)";

  return (
    <>
      {/* Backdrop to close menu - closes menu and doesn't block other interactions */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[10]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Container - Fixed positioning with lower z-index */}
      <div
        className="fixed z-[10]"
        style={{
          right: "66px",
          top: "100px",
        }}
      >
        <div className="flex items-center gap-4 justify-end">
          
          {/* ----- CALENDAR TOGGLE PILL ----- */}
          <div className="flex items-center gap-6 px-6 py-2 bg-[#F2F2F2] rounded-full border-2 border-[#2C2C2C] shadow-sm">
            
            {/* MONTH BUTTON */}
            <button
              onClick={() => onMenuSelect("Month")}
              className={`transition-all duration-300 ease-in-out ${
                isMonthToggled
                  ? "scale-125" 
                  : "scale-90 hover:scale-100" 
              }`}
            >
              <Image
                src="/Calendar.svg"
                alt="Month View"
                width={34} 
                height={34}
                className="transition-all duration-300"
                style={{
                  filter: isMonthToggled ? maroonFilter : grayFilter,
                }}
              />
            </button>

            {/* YEAR BUTTON */}
            <button
              onClick={() => onMenuSelect("Year")}
              className={`transition-all duration-300 ease-in-out ${
                isYearToggled
                  ? "scale-125"
                  : "scale-90 hover:scale-100" 
              }`}
            >
              <Image
                src="/Calendar.svg"
                alt="Year View"
                width={34}
                height={34}
                className="transition-all duration-300"
                style={{
                  filter: isYearToggled ? maroonFilter : grayFilter,
                }}
              />
            </button>
          </div>
          {/* ----- END TOGGLE PILL ----- */}

          {/* Menu Button (Three Dots) */}
          <button
            className="transition-transform duration-300 hover:scale-110"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Image
              src="/menu icon.svg"
              alt="Menu Icon"
              width={50}
              height={50}
              className={`transition-transform duration-300 ${
                menuOpen ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {/* Reminder and Schedule Buttons (Dropdown) - Reminder is now first/left */}
        {menuOpen && (
          <div className="flex gap-3 mt-3 justify-end">
            {menuItems.map((item, index) => {
              // Check if this button should be selected
              // If selectedMenu is "Year" or "Month", default to "Reminder" being selected
              // Otherwise, match against selectedMenu
              const isSelected = 
                (selectedMenu === "Year" || selectedMenu === "Month")
                  ? item.name === "Reminder"
                  : selectedMenu === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => onMenuSelect(item.name)}
                  className={`${
                    ptSans.className
                  } flex items-center gap-3 px-6 py-3 rounded-full font-medium text-[17px] transition-all duration-200 shadow-md ${
                    isSelected
                      ? "bg-[#FFD700] text-black scale-105 border-2 border-[#FFD700]"
                      : "bg-white text-gray-700 border-2 border-[#5C0000] hover:scale-105 hover:shadow-lg"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "slideIn 0.3s ease-out forwards",
                    opacity: 0,
                    transform: "translateY(20px)",
                  }}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    className="transition-transform duration-200"
                  />
                  <span className="font-semibold">{item.name}</span>
                </button>
              );
            })}
            <style jsx>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
}