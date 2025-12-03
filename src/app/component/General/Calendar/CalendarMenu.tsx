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
  onMenuSelect,
}: CalendarMenuProps) {
  // Reordered: Reminder first, Schedule second
  const menuItems = [
    { name: "Reminder", icon: "/Bellplus.svg" },
    { name: "Schedule", icon: "/Schedule.svg" },
  ];

  return (
    <>
      {/* Backdrop to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Container - Fixed positioning */}
      <div
        className="fixed z-[50]"
        style={{
          right: "60px",
          top: "135px",
        }}
      >
        <div className="flex flex-col items-end gap-3">
          {/* Menu Button (Three Dots) - Redesigned to be a floating action button */}
          <button
            className={`flex items-center justify-center w-[50px] h-[50px] rounded-full shadow-lg transition-all duration-300 border border-white/20 backdrop-blur-md ${
              menuOpen
                ? "bg-[#8B0E0E] rotate-90"
                : "bg-white hover:bg-gray-50 hover:scale-105"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Image
              src="/menu icon.svg"
              alt="Menu Icon"
              width={24}
              height={24}
              className={`transition-all duration-300 ${
                menuOpen ? "brightness-0 invert" : ""
              }`}
            />
          </button>

          {/* Dropdown Items */}
          {menuOpen && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
              {menuItems.map((item, index) => {
                const isSelected =
                  selectedMenu === "Year" || selectedMenu === "Month"
                    ? item.name === "Reminder"
                    : selectedMenu === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onMenuSelect(item.name);
                      setMenuOpen(false);
                    }}
                    className={`${
                      ptSans.className
                    } flex items-center justify-end gap-3 px-6 py-3 rounded-2xl shadow-md transition-all duration-200 border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#8B0E0E] to-[#5e0a0a] text-white border-[#8B0E0E] scale-105"
                        : "bg-white text-gray-700 border-white hover:bg-gray-50 hover:scale-105"
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <span className="font-bold text-[15px]">{item.name}</span>
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      className={`transition-transform duration-200 ${
                        isSelected ? "brightness-0 invert" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
