"use client";

import AdvancedFilter from "../LeftSide/AdvanceFilter";
import TagsFilter from "../LeftSide/TagsFilter";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "../LeftSide/SearchFilter";
import { FilterState } from "../Utils/types";

// Component Interface
interface AnnouncementSidebarProps {
  activeTab: "announcement" | "highlight";
  onTabToggle: (tab: "announcement" | "highlight") => void;
  onSearchChange: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
  isHighlights: boolean;
  derivedTags: string[];
  onTagClick: (tags: string[]) => void;
}

// Component
export default function AnnouncementLeftBar({
  activeTab,
  onTabToggle,
  onSearchChange,
  onFilterChange,
  filters,
  isHighlights,
  derivedTags,
  onTagClick,
}: AnnouncementSidebarProps) {
  // Render
  return (
    <div className="bg-gray-100/50 w-[350px] left-0 top-0 fixed h-full pt-28 flex flex-col items-center overflow-y-auto">
      <div className="mb-8">
        <ToggleButton
          width="w-[320px]"
          height="h-[40px]"
          textSize="text-[16px]"
          leftLabel="Announcement"
          rightLabel="Highlights"
          leftActiveBg="bg-gradient-to-b from-[#6E0A0A] to-[#4e0505]"
          rightActiveBg="bg-gradient-to-b from-[#6E0A0A] to-[#4e0505]"
          active={activeTab === "announcement" ? "left" : "right"}
          onToggle={(side) =>
            onTabToggle(side === "left" ? "announcement" : "highlight")
          }
        />
      </div>
      <div className="shrink-0 flex flex-col gap-3 mb-5">
        <SearchFilter onSearchChange={onSearchChange} />
        <AdvancedFilter
          onChange={onFilterChange}
          initialFilters={filters}
          isHighlights={isHighlights}
        />
        <TagsFilter tags={derivedTags} onTagClick={onTagClick} />
      </div>
    </div>
  );
}
