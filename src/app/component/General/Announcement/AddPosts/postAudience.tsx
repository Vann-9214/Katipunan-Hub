"use client";

import React, { useState } from "react";
import { ArrowLeft, Globe, School, Circle, CheckCircle2 } from "lucide-react";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { collegeitems } from "../Utils/constants";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
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
    <div className="w-full max-h-[90vh] flex flex-col h-full bg-white">
      {/* --- HEADER --- */}
      <div className="relative flex items-center px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 flex-shrink-0 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
        {/* Back Button - FIXED: z-50 to ensure it is clickable */}
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-6 p-2 -ml-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors z-50 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1
          className={`${montserrat.className} flex-1 text-[20px] font-bold text-white tracking-wide text-center z-10 pointer-events-none`}
        >
          Select Audience
        </h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* --- Options Area --- */}
      <motion.div
        className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar bg-[#F9FAFB]"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <p
          className={`${ptSans.className} text-sm text-gray-500 font-bold mb-2 px-1`}
        >
          Who can see this post?
        </p>

        {/* Global Option */}
        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSelect("global")}
          className={`group flex items-center justify-between w-full p-5 rounded-2xl transition-all cursor-pointer shadow-sm border ${
            selectedType === "global"
              ? "bg-white border-[#EFBF04] ring-1 ring-[#EFBF04]/50 shadow-md"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full transition-colors ${
                selectedType === "global"
                  ? "bg-[#EFBF04]/10 text-[#EFBF04]"
                  : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
              }`}
            >
              <Globe size={24} />
            </div>
            <div className="text-left">
              <p
                className={`${montserrat.className} font-bold text-[16px] text-gray-900`}
              >
                Global
              </p>
              <p className={`${ptSans.className} text-sm text-gray-500`}>
                Visible to everyone on Katipunan Hub
              </p>
            </div>
          </div>
          {selectedType === "global" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <CheckCircle2 size={24} className="text-[#8B0E0E] fill-white" />
            </motion.div>
          ) : (
            <Circle
              size={24}
              className="text-gray-200 group-hover:text-gray-300"
            />
          )}
        </motion.button>

        {/* College Option Wrapper */}
        <motion.div
          variants={itemVariants}
          className={`w-full rounded-2xl transition-all bg-white border shadow-sm ${
            selectedType === "college"
              ? "border-[#EFBF04] ring-1 ring-[#EFBF04]/50 shadow-md"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }`}
        >
          {/* Clickable Row */}
          <motion.button
            type="button"
            className="flex items-center justify-between w-full p-5 cursor-pointer group rounded-t-2xl"
            onClick={() => handleSelect("college")}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full transition-colors ${
                  selectedType === "college"
                    ? "bg-[#EFBF04]/10 text-[#EFBF04]"
                    : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                }`}
              >
                <School size={24} />
              </div>
              <div className="text-left">
                <p
                  className={`${montserrat.className} font-bold text-[16px] text-gray-900`}
                >
                  College Specific
                </p>
                <p className={`${ptSans.className} text-sm text-gray-500`}>
                  Visible only to a specific college
                </p>
              </div>
            </div>
            {selectedType === "college" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <CheckCircle2 size={24} className="text-[#8B0E0E] fill-white" />
              </motion.div>
            ) : (
              <Circle
                size={24}
                className="text-gray-200 group-hover:text-gray-300"
              />
            )}
          </motion.button>

          {/* Dropdown Area */}
          <AnimatePresence>
            {selectedType === "college" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
                className="px-5 pb-5 pt-0 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl"
              >
                <div className="pt-4">
                  <p
                    className={`${montserrat.className} text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1`}
                  >
                    Select Target College
                  </p>
                  <Combobox
                    items={collegeitems}
                    onChange={handleCollegeSelect}
                    defaultMode="value"
                    defaultValue={selectedCollege}
                    placeholder="Choose a college..."
                    emptyText="No college found."
                    width="w-full"
                    buttonHeight="h-[50px]"
                    rounded="rounded-xl"
                    buttonBG="bg-white"
                    borderColor="border-gray-200"
                    hoverBG="hover:bg-gray-50"
                    textColor="text-gray-700"
                    selectedTextColor="text-[#8B0E0E] font-bold"
                    checkArrowColor="text-[#EFBF04]"
                    dropdownBG="bg-white"
                    dropdownBorderColor="border-gray-200"
                    dropdownRounded="rounded-xl"
                    dropdownHoverBG="hover:bg-[#EFBF04]/10"
                    dropdownHoverTextColor="hover:text-[#8B0E0E]"
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
