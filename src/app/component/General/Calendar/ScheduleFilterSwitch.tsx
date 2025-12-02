"use client";

import React from "react";
import { Montserrat } from "next/font/google";
import { FilterType } from "@/app/component/General/Calendar/types";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

interface ScheduleFilterSwitchProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function ScheduleFilterSwitch({
  selectedFilter,
  onFilterChange,
}: ScheduleFilterSwitchProps) {
  const filters: FilterType[] = ["Global", "Personal", "All"];
  const selectedIndex = filters.indexOf(selectedFilter);

  return (
    <div className="relative w-full bg-white rounded-full p-1.5 shadow-md border-2 border-[#800000]">
      <div className="flex relative">
        {/* Sliding background indicator with enhanced animation */}
        <div
          className="absolute top-0 bottom-0 bg-[#FFD700] rounded-full z-0 shadow-lg"
          style={{
            width: `${100 / filters.length}%`,
            transform: `translateX(${selectedIndex * 100}%)`,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`${montserrat.className} flex-1 relative z-10 px-3 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${
              selectedFilter === filter
                ? "text-black scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}