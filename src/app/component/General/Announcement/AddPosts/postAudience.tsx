// PostAudienceSelector.tsx
"use client";

import React, { useState } from "react";
import { ArrowLeft, Globe, School, Circle, CheckCircle2 } from "lucide-react";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { collegeitems } from "../Utils/constants";
import { motion, AnimatePresence } from "framer-motion";

interface PostAudienceSelectorProps {
  currentVisibleTo: "global" | "college";
  currentVisibleCollege: string | null;
  onSelectAudience: (
    visibleTo: "global" | "college",
    college: string | null
  ) => void;
  onClose: () => void;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

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
      setSelectedCollege(null);
      onSelectAudience("global", null);
    }
  };

  const handleCollegeSelect = (collegeValue: string) => {
    const college = collegeValue || null;
    setSelectedCollege(college);
    onSelectAudience("college", college);
  };

  return (
    <div className="w-full max-h-[90vh] flex flex-col h-full">
      {/* Header */}
      <div className="relative flex items-center p-6 border-b border-gray-200 flex-shrink-0">
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-6 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="flex-1 font-montserrat text-2xl font-bold text-gray-900 text-center">
          Post audience
        </h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* Options Area */}
      <motion.div
        className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Global Option */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect("global")}
          className={`flex items-center justify-between w-full p-4 border rounded-xl transition-all cursor-pointer ${
            selectedType === "global"
              ? "border-black bg-black/5 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full text-gray-700">
              <Globe size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-gray-900">Global</p>
              <p className="text-sm text-gray-500 font-medium">
                Visible to everyone on Katipunan Hub
              </p>
            </div>
          </div>
          {selectedType === "global" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <CheckCircle2 size={24} className="text-maroon fill-current" />
            </motion.div>
          ) : (
            <Circle size={24} className="text-gray-300" />
          )}
        </motion.button>

        {/* College Option Wrapper */}
        <motion.div
          variants={itemVariants}
          layout // Smoothly animate height when dropdown appears
          className={`w-full border rounded-xl overflow-hidden transition-all ${
            selectedType === "college"
              ? "border-black bg-black/5 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {/* Clickable Row */}
          <motion.button
            type="button"
            whileHover={
              selectedType !== "college"
                ? { scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }
                : {}
            }
            onClick={() => handleSelect("college")}
            className="flex items-center justify-between w-full p-4 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full text-gray-700">
                <School size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-gray-900">College</p>
                <p className="text-sm text-gray-500 font-medium">
                  Visible only to specific colleges
                </p>
              </div>
            </div>
            {selectedType === "college" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <CheckCircle2 size={24} className="text-maroon fill-current" />
              </motion.div>
            ) : (
              <Circle size={24} className="text-gray-300" />
            )}
          </motion.button>

          {/* Dropdown Area (Animate Height) */}
          <AnimatePresence>
            {selectedType === "college" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
                className="px-4 pb-4"
              >
                <div className="pt-2">
                  <Combobox
                    items={collegeitems}
                    onChange={handleCollegeSelect}
                    defaultMode="value"
                    defaultValue={selectedCollege}
                    placeholder="Select College"
                    emptyText="No college found."
                    width="w-full"
                    buttonHeight="h-auto py-3"
                    rounded="rounded-lg"
                    buttonBG="bg-white"
                    borderColor="border-gray-300"
                    hoverBG="hover:bg-gray-50"
                    textColor="text-gray-700"
                    selectedTextColor="text-black font-semibold"
                    checkArrowColor="text-maroon"
                    dropdownBG="bg-white"
                    dropdownBorderColor="border-gray-300"
                    dropdownRounded="rounded-lg"
                    dropdownHoverBG="hover:bg-gray-100"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
