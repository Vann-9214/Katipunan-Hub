"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Circle } from "lucide-react";
import {
  SortOption,
  DateOption,
  VisibilityOption,
  FilterState,
} from "../Utils/types"; // Adjust path as needed

// Define the filter types

// Props for the main component
interface AdvancedFilterProps {
  // Callback to parent with all active filters
  onChange: (filters: {
    sort: SortOption;
    date: DateOption;
    visibility: VisibilityOption;
  }) => void;
  // Optional: to control state from parent
  initialFilters?: {
    sort: SortOption;
    date: DateOption;
    visibility: VisibilityOption;
  };
}

// Default state
const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "Today",
  visibility: "Global",
};

export default function AdvancedFilter({
  onChange,
  initialFilters = DEFAULT_FILTERS,
}: AdvancedFilterProps) {
  // State for the popover
  const [isOpen, setIsOpen] = useState(false);

  // This is the *applied* filter state
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(initialFilters);

  // This is the *temporary* state while the popover is open
  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters);

  // Update temp state when popover opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(activeFilters);
    }
  }, [isOpen, activeFilters]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Discard temporary changes
    setTempFilters(activeFilters);
  };

  const handleSave = () => {
    // Apply temporary changes
    setActiveFilters(tempFilters);
    // Send changes to parent
    onChange(tempFilters);
    // Close modal
    setIsOpen(false);
  };

  // Helper to create a tag
  const FilterTag = ({ label }: { label: string }) => (
    <div className="flex h-[32px] items-center justify-center rounded-[10px] border border-gray-400 bg-white px-[5px] py-1">
      <span className="text-[11px] font-montserrat font-medium text-black">
        {label}
      </span>
    </div>
  );

  return (
    <div className="w-fit max-w-[320px] rounded-lg border border-gray-300 shadow-sm overflow-hidden transition-all">
      {/* 1. FILTER HEADER (Always visible) */}
      <div className="flex w-full items-center gap-2 bg-gray-100 p-2">
        <span className="text-[16px] font-medium text-black">Filter</span>
        <button
          onClick={handleToggleOpen}
          className="rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
          aria-label={isOpen ? "Close filters" : "Open filters"}
          aria-expanded={isOpen}
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Active Filter Tags (as seen in image) */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1">
          <FilterTag label={activeFilters.sort} />
          <FilterTag label={activeFilters.visibility} />
          <FilterTag label={activeFilters.date} />
        </div>
      </div>

      {/* 2. EXPANDABLE CONTENT (Replaces the modal) */}
      {isOpen && (
        <div className="bg-white p-6 pt-4">
          {/* --- Sort By --- */}
          <FilterRadioGroup
            label="Sort by"
            options={["Newest First", "Oldest First"]}
            activeOption={tempFilters.sort}
            onChange={(val) =>
              setTempFilters((prev) => ({ ...prev, sort: val as SortOption }))
            }
          />

          {/* --- Date --- */}
          <FilterRadioGroup
            label="Date"
            options={["Today", "This Week", "This Month", "All Time"]}
            activeOption={tempFilters.date}
            onChange={(val) =>
              setTempFilters((prev) => ({ ...prev, date: val as DateOption }))
            }
          />

          {/* --- Visibility --- */}
          <FilterRadioGroup
            label="Visibility"
            options={["Global", "Course", "All"]}
            activeOption={tempFilters.visibility}
            onChange={(val) =>
              setTempFilters((prev) => ({
                ...prev,
                visibility: val as VisibilityOption,
              }))
            }
          />

          {/* --- Action Buttons --- */}
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={handleCancel}
              className="rounded-lg bg-gray-200 px-5 py-2 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-maroon px-5 py-2 text-[15px] font-semibold text-white transition-colors hover:bg-maroon/90 cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENT ---
// (Kept in the same file for simplicity)

interface FilterRadioGroupProps {
  label: string;
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
}

function FilterRadioGroup({
  label,
  options,
  activeOption,
  onChange,
}: FilterRadioGroupProps) {
  return (
    <div className="mb-4 border-b pb-4">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5 transition-all cursor-pointer"
          >
            {activeOption === option ? (
              <Circle size={18} className="text-maroon" fill="currentColor" />
            ) : (
              <Circle size={18} className="text-gray-400" />
            )}
            <span
              className={`text-[15px] ${
                activeOption === option
                  ? "font-semibold text-maroon"
                  : "font-medium text-gray-600"
              }`}
            >
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
