"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Imported motion
import {
  SortOption,
  DateOption,
  VisibilityOption,
  FilterState,
} from "../Utils/types"; // Keep your imports

interface AdvancedFilterProps {
  onChange: (filters: {
    sort: SortOption;
    date: DateOption;
    visibility: VisibilityOption;
  }) => void;
  initialFilters?: {
    sort: SortOption;
    date: DateOption;
    visibility: VisibilityOption;
  };
  isHighlights?: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  sort: "Newest First",
  date: "Today",
  visibility: "Global",
};

export default function AdvancedFilter({
  onChange,
  initialFilters = DEFAULT_FILTERS,
  isHighlights = false,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const effectiveInitialFilters = {
    ...initialFilters,
    ...(isHighlights && { visibility: "Global" as VisibilityOption }),
  };

  const [activeFilters, setActiveFilters] = useState<FilterState>(
    effectiveInitialFilters
  );

  const [tempFilters, setTempFilters] = useState<FilterState>(
    effectiveInitialFilters
  );

  useEffect(() => {
    if (isHighlights && activeFilters.visibility !== "Global") {
      const globalOnlyFilters = {
        ...activeFilters,
        visibility: "Global" as VisibilityOption,
      };

      setActiveFilters(globalOnlyFilters);
      setTempFilters(globalOnlyFilters);
      onChange(globalOnlyFilters);
    }
  }, [isHighlights, activeFilters, onChange]);

  useEffect(() => {
    if (isOpen) {
      if (isHighlights && activeFilters.visibility !== "Global") {
        setTempFilters({ ...activeFilters, visibility: "Global" });
      } else {
        setTempFilters(activeFilters);
      }
    }
  }, [isOpen, activeFilters, isHighlights]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Wait for animation to finish slightly before resetting (optional) or reset immediately
    setTimeout(() => setTempFilters(activeFilters), 200);
  };

  const handleSave = () => {
    setActiveFilters(tempFilters);
    onChange(tempFilters);
    setIsOpen(false);
  };

  const FilterTag = ({ label }: { label: string }) => (
    <motion.div
      layout // Smoothly adjusts position if tags change size
      className="flex h-[32px] items-center justify-center rounded-[10px] border border-gray-400 bg-white px-[5px] py-1"
    >
      <span className="text-[11px] font-montserrat font-medium text-black">
        {label}
      </span>
    </motion.div>
  );

  return (
    <div className="w-fit max-w-[320px] rounded-lg border border-gray-300 shadow-sm overflow-hidden bg-white">
      {/* 1. FILTER HEADER */}
      <div className="flex w-full items-center gap-2 bg-gray-100 p-2 z-20 relative">
        <span className="text-[16px] font-medium text-black">Filter</span>
        <button
          onClick={handleToggleOpen}
          className="rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
          aria-label={isOpen ? "Close filters" : "Open filters"}
          aria-expanded={isOpen}
        >
          <SlidersHorizontal size={20} />
        </button>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {/* LayoutGroup helps animate these smoothly if they change */}
          <FilterTag label={activeFilters.sort} />
          <FilterTag label={activeFilters.visibility} />
          <FilterTag label={activeFilters.date} />
        </div>
      </div>

      {/* 2. ANIMATED EXPANDABLE CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-white"
          >
            <div className="p-6 pt-4">
              {/* --- Sort By --- */}
              <FilterRadioGroup
                label="Sort by"
                options={["Newest First", "Oldest First"]}
                activeOption={tempFilters.sort}
                onChange={(val) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sort: val as SortOption,
                  }))
                }
              />

              {/* --- Date --- */}
              <FilterRadioGroup
                label="Date"
                options={["Today", "This Week", "This Month", "All Time"]}
                activeOption={tempFilters.date}
                onChange={(val) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    date: val as DateOption,
                  }))
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
                disabledOptions={isHighlights ? ["Course", "All"] : []}
              />

              {/* --- Action Buttons --- */}
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="rounded-lg bg-gray-200 px-5 py-2 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="rounded-lg bg-maroon px-5 py-2 text-[15px] font-semibold text-white transition-colors hover:bg-maroon/90 cursor-pointer"
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HELPER COMPONENT ---

interface FilterRadioGroupProps {
  label: string;
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
  disabledOptions?: string[];
}

function FilterRadioGroup({
  label,
  options,
  activeOption,
  onChange,
  disabledOptions = [],
}: FilterRadioGroupProps) {
  return (
    <div className="mb-4 border-b pb-4 last:border-0 last:pb-0">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {options.map((option) => {
          const isDisabled = disabledOptions.includes(option);

          return (
            <motion.button
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              key={option}
              onClick={() => onChange(option)}
              disabled={isDisabled}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all ${
                // Simplified border logic for cleaner active states
                activeOption === option
                  ? "border-maroon bg-maroon/5"
                  : "border-gray-300 bg-transparent"
              } ${
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-maroon/50"
              }`}
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
