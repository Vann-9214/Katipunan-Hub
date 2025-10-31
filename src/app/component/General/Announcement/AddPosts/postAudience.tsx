// PostAudienceSelector.tsx

import React, { useState } from "react";
import { ArrowLeft, Globe, School, Circle } from "lucide-react";
import { Combobox } from "@/app/component/ReusableComponent/Combobox"; // Make sure this path is correct

interface PostAudienceSelectorProps {
  currentVisibleTo: "global" | "college";
  currentVisibleCollege: string | null;
  onSelectAudience: (
    visibleTo: "global" | "college",
    college: string | null
  ) => void;
  onClose: () => void;
}

// Example college list
const colleges = ["ccs", "cba", "cea", "cas", "coed", "con", "chtm"];

// Format the list for the Combobox component
const collegeItems = colleges.map((college) => ({
  value: college,
  label: college.toUpperCase(), // e.g., "CCS"
}));

export default function PostAudienceSelector({
  currentVisibleTo,
  currentVisibleCollege,
  onSelectAudience,
  onClose,
}: PostAudienceSelectorProps) {
  const [selectedType, setSelectedType] = useState<"global" | "college">(
    currentVisibleTo
  );
  const [selectedCollege, setSelectedCollege] = useState<string | null>(
    currentVisibleCollege
  );

  const handleSelect = (type: "global" | "college") => {
    setSelectedType(type);
    if (type === "global") {
      setSelectedCollege(null); // Reset college if global is selected
      onSelectAudience("global", null); // Immediately update parent for global
    }
  };

  const handleCollegeSelect = (collegeValue: string) => {
    const college = collegeValue || null;
    setSelectedCollege(college);
    onSelectAudience("college", college);
  };

  return (
    <div className="w-full max-h-[90vh] flex flex-col">
      {/* 1. Header */}
      <div className="relative flex items-center p-6 border-b border-gray-200 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-6 text-gray-500 hover:text-gray-700 cursor-pointer" // Added cursor-pointer
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 font-montserrat text-2xl font-bold text-gray-900 text-center">
          Post audience
        </h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* 2. Options Area */}
      <div className="p-6 space-y-4 overflow-y-auto">
        {/* Global Option */}
        <button
          type="button"
          onClick={() => handleSelect("global")}
          className={`flex items-center justify-between w-full p-4 border rounded-lg transition-colors cursor-pointer ${
            // Added cursor-pointer
            selectedType === "global"
              ? "border-maroon bg-maroon/5"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <Globe size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-left">Global</p>
              <p className="text-sm text-gray-600 text-left">
                All students on this app
              </p>
            </div>
          </div>
          {selectedType === "global" ? (
            // --- UPDATED ---
            <Circle size={20} className="text-maroon" fill="currentColor" />
          ) : (
            <Circle size={20} className="text-gray-400" />
          )}
        </button>

        {/* College Option Wrapper */}
        <div
          className={`w-full border rounded-lg transition-colors ${
            selectedType === "college"
              ? "border-maroon bg-maroon/5"
              : "border-gray-200" // Removed hover here, as button handles it
          }`}
        >
          {/* Part 1: The clickable row */}
          <button
            type="button"
            onClick={() => handleSelect("college")}
            className={`flex items-center justify-between w-full p-4 cursor-pointer ${
              // Added cursor-pointer
              selectedType !== "college" && "hover:bg-gray-50" // Add hover only if not selected
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <School size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-left">College</p>
                <p className="text-sm text-gray-600 text-left">
                  Certain colleges will see
                </p>
              </div>
            </div>
            {selectedType === "college" ? (
              // --- UPDATED ---
              <Circle size={20} className="text-maroon" fill="currentColor" />
            ) : (
              <Circle size={20} className="text-gray-400" />
            )}
          </button>

          {/* Part 2: The Combobox */}
          {selectedType === "college" && (
            <div className="pb-4 px-4">
              <Combobox
                items={collegeItems}
                onChange={handleCollegeSelect}
                defaultMode="value"
                defaultValue={selectedCollege}
                placeholder="Select College"
                emptyText="No college found."
                // --- Styling ---
                width="w-full"
                buttonHeight="h-auto py-3"
                rounded="rounded-lg"
                buttonBG="bg-gray-100"
                borderColor="border-transparent"
                textColor="text-gray-700"
                selectedTextColor="text-gray-900"
                checkArrowColor="text-maroon"
                // --- Dropdown styles ---
                dropdownBG="bg-white"
                dropdownBorderColor="border-gray-300"
                dropdownRounded="rounded-lg"
                dropdownHoverBG="hover:bg-gray-100"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
