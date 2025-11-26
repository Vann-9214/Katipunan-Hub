"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "../Announcement/LeftSide/SearchFilter";
import AdvancedFilter from "../Announcement/LeftSide/AdvanceFilter";
import { FilterState } from "../Announcement/Utils/types";

interface FeedsLeftBarProps {
  activeTab: "feed" | "plc";
  onTabToggle: (tab: "feed" | "plc") => void;
  onSearchChange: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export default function FeedsLeftBar({
  activeTab,
  onTabToggle,
  onSearchChange,
  onFilterChange,
  filters,
}: FeedsLeftBarProps) {
  return (
    <div className="bg-white w-[350px] left-0 top-0 fixed h-full pt-28 flex flex-col items-center overflow-y-auto border-r border-gray-100">
      <div className="mb-8">
        <ToggleButton
          width="w-[320px]"
          height="h-[40px]"
          textSize="text-[16px]"
          leftLabel="Feed"
          rightLabel="PLC"
          leftActiveBg="bg-maroon"
          rightActiveBg="bg-gold"
          active={activeTab === "feed" ? "left" : "right"}
          onToggle={(side) => onTabToggle(side === "left" ? "feed" : "plc")}
        />
      </div>

      {activeTab === "feed" && (
        <div className="shrink-0 flex flex-col gap-3 mb-5 w-[320px]">
          <SearchFilter onSearchChange={onSearchChange} />
          {/* Reuse AdvancedFilter but ignore visibility for feeds usually */}
          <AdvancedFilter
            onChange={onFilterChange}
            initialFilters={filters}
            isHighlights={true} // This forces "Global" visibility mode
          />
        </div>
      )}

      <div className="px-8 text-center mt-4">
        {activeTab === "feed" ? (
          <p className="text-gray-500 font-montserrat text-sm">
            Connect with the community. Share your thoughts, photos, and updates
            with everyone at CIT-U.
          </p>
        ) : (
          <p className="text-gray-500 font-montserrat text-sm">
            <span className="text-[#8B0E0E] font-bold">PLC Hall of Fame</span>
            <br />
            Celebrating our top-rated tutors and successful learning sessions.
          </p>
        )}
      </div>
    </div>
  );
}
