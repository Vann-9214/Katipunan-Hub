"use client";

import AdvancedFilter from "../LeftSide/AdvanceFilter";
import TagsFilter from "../LeftSide/TagsFilter";
import SearchFilter from "../LeftSide/SearchFilter";
import { FilterState } from "../Utils/types";

// Component Interface
interface AnnouncementSidebarProps {
  onSearchChange: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
  derivedTags: string[];
  onTagClick: (tags: string[]) => void;
}

// Component
export default function AnnouncementLeftBar({
  onSearchChange,
  onFilterChange,
  filters,
  derivedTags,
  onTagClick,
}: AnnouncementSidebarProps) {
  // Render
  return (
    <div className="bg-gray-100/50 w-[350px] left-0 top-0 fixed h-full pt-28 flex flex-col items-center overflow-y-auto">
      <div className="shrink-0 flex flex-col gap-3 mb-5 mt-8">
        <SearchFilter onSearchChange={onSearchChange} />
        <AdvancedFilter
          onChange={onFilterChange}
          initialFilters={filters}
          isHighlights={false}
        />
        <TagsFilter tags={derivedTags} onTagClick={onTagClick} />
      </div>
    </div>
  );
}
