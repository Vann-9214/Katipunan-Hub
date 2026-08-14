"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, Circle, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SortOption,
  DateOption,
  VisibilityOption,
  FilterState,
} from "../Utils/types";

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
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

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
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTimeout(() => setTempFilters(activeFilters), 200);
  };

  const handleSave = () => {
    setActiveFilters(tempFilters);
    onChange(tempFilters);
    setIsOpen(false);
  };

  // --- FILTER TAG (Updated Gold Gradient) ---
  const FilterTag = ({ label }: { label: string }) => (
    <motion.div
      layout
      className="flex h-[28px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] px-[5px] shrink-0 shadow-sm"
    >
      <span className="text-[10px] font-montserrat font-bold text-white whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );

  // --- MODAL CONTENT ---
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        // ADDED: Gold Gradient Border via padding
        className="relative w-full max-w-[450px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl z-10"
      >
        {/* Inner White Container */}
        <div className="bg-white rounded-[22px] overflow-hidden w-full h-full flex flex-col">
          {/* Header: Custom Maroon Gradient */}
          <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30">
            <div>
              <h2 className="text-[20px] font-bold font-montserrat text-white tracking-wide">
                Filter Posts
              </h2>
              <p className="text-white/70 text-xs font-ptsans mt-0.5">
                Customize your feed view
              </p>
            </div>
            <motion.button
              onClick={handleCancel}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
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
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <motion.button
              onClick={handleCancel}
              whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
              whileTap={{ scale: 0.98 }}
              className="px-5 cursor-pointer py-2.5 rounded-xl text-[14px] font-bold font-montserrat text-gray-600 bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 cursor-pointer rounded-xl text-[14px] font-bold font-montserrat text-white bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-md flex items-center gap-2"
            >
              <Check size={16} strokeWidth={3} />
              Apply Filters
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* --- TRIGGER BAR (In Sidebar) --- */}
      <div className="w-full max-w-[320px] rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-gradient-to-b from-[#6E0A0A] to-[#4e0505]">
        <div className="flex w-full items-center gap-2 p-2 pl-3">
          <span className="text-[16px] font-bold text-white font-montserrat">
            Filter
          </span>

          <div className="h-5 w-[1px] bg-white/20 shrink-0" />

          <motion.button
            onClick={handleToggleOpen}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-md text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={18} />
          </motion.button>

          {/* Tags List: HIDDEN scrollbar */}
          <div className="flex flex-1 items-center gap-1 overflow-x-auto py-[3px] hide-scrollbar mask-linear-fade">
            <FilterTag label={activeFilters.sort} />
            <FilterTag label={activeFilters.visibility} />
            <FilterTag label={activeFilters.date} />
          </div>
        </div>
      </div>

      {/* --- RENDER MODAL --- */}
      {mounted &&
        createPortal(
          <AnimatePresence>{isOpen && modalContent}</AnimatePresence>,
          document.body
        )}
    </>
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
    <div className="space-y-3">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-montserrat">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const isDisabled = disabledOptions.includes(option);
          const isActive = activeOption === option;

          return (
            <motion.button
              key={option}
              onClick={() => onChange(option)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-[10px] border text-[14px] font-medium transition-colors duration-200 font-montserrat
                ${
                  isActive
                    ? "bg-gradient-to-b from-[#6E0A0A] to-[#4e0505] text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }
                ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              `}
            >
              {isActive ? (
                <Circle size={14} className="fill-white text-white" />
              ) : (
                <Circle size={14} className="text-gray-300" />
              )}
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
