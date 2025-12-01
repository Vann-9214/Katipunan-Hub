"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "../Announcement/LeftSide/SearchFilter";
import AdvancedFilter from "../Announcement/LeftSide/AdvanceFilter";
import { FilterState } from "../Announcement/Utils/types";
// 1. Import User type and necessary icons/components
import type { User } from "../../../../../supabase/Lib/General/user";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { Mail, BookOpen, GraduationCap, Pen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image component

interface FeedsLeftBarProps {
  activeTab: "feed" | "plc";
  onTabToggle: (tab: "feed" | "plc") => void;
  onSearchChange: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
  user: User | null;
}

export default function FeedsLeftBar({
  activeTab,
  onTabToggle,
  onSearchChange,
  onFilterChange,
  filters,
  user,
}: FeedsLeftBarProps) {
  return (
    <div className="bg-white w-[350px] left-0 top-0 fixed h-full pt-24 flex flex-col items-center overflow-y-auto border-r border-gray-100 custom-scrollbar pb-8">
      <div className="mb-6">
        <ToggleButton
          width="w-[320px]"
          height="h-[40px]"
          textSize="text-[16px]"
          leftLabel="Feed"
          rightLabel="PLC"
          leftActiveBg="bg-gradient-to-b from-[#6E0A0A] to-[#4e0505]"
          rightActiveBg="bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37]"
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

      {/* --- EDITED: Profile Card (Matching Account Theme) --- */}
      {user && (
        <div className="w-[320px]">
          <div className="w-full rounded-[24px] bg-white border border-gray-100 shadow-xl overflow-hidden relative">
            {/* --- EDITED: Conditional Cover Photo --- */}
            <div className="relative h-[100px] w-full bg-gray-800 overflow-hidden">
              {user.coverURL ? (
                <Image
                  src={user.coverURL}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              ) : (
                // Default Dark Maroon/Red gradient with text overlay
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#8B0E0E] to-[#4e0505] opacity-100">
                  <span className="text-white/20 font-bold text-xl select-none font-montserrat tracking-widest">
                    KATIPUNAN HUB
                  </span>
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="px-5 pb-5 relative">
              {/* Avatar (Overlapping) */}
              <div className="absolute -top-12 left-5 p-[3px] bg-white rounded-full shadow-md">
                <div className="rounded-full border-2 border-[#EFBF04] p-[2px]">
                  <Avatar
                    avatarURL={user.avatarURL}
                    altText={user.fullName}
                    className="w-20 h-20"
                  />
                </div>
              </div>

              {/* Spacer for Avatar */}
              <div className="h-10 mb-2"></div>

              {/* User Info */}
              <h3 className="font-montserrat font-bold text-[20px] text-[#1a1a1a]">
                {user.fullName}
              </h3>

              {/* Details List */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <Mail size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans font-bold uppercase tracking-wide">
                    {user.course}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <GraduationCap size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans">
                    {user.year} Year
                  </span>
                </div>
              </div>

              {/* Profile Button */}
              <Link href="/Account" className="block mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  // --- EDITED: Button Theme (MATCHES Account Page Button) ---
                  className="w-full bg-gradient-to-b from-[#4e0505] to-[#3a0000] cursor-pointer hover:bg-[#600a0a] border border-[#EFBF04]/50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                >
                  <Pen size={18} className="text-[#EFBF04]" strokeWidth={2.5} />
                  <span className="font-montserrat">Profile</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
