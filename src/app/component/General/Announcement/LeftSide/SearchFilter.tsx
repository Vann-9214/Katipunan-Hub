"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchFilter({
  onSearchChange,
}: {
  onSearchChange?: (val: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      // Animate container properties based on focus state
      // REMOVED: width animation. Kept border and shadow.
      animate={{
        borderColor: isFocused ? "#EFBF04" : "transparent", // Gold border on focus
        boxShadow: isFocused ? "0px 4px 20px rgba(0, 0, 0, 0.2)" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      // Fixed width of 320px
      // Applied your specific maroon gradient background
      className="flex items-center h-[40px] w-[320px] bg-gradient-to-b from-[#6E0A0A] to-[#4e0505] border border-white/10 rounded-[10px] overflow-hidden"
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.1 : 1,
          rotate: isFocused ? 10 : 0, // Subtle tilt on focus
        }}
        className="ml-3 mr-2"
      >
        <Search
          className={`w-[20px] h-[20px] transition-colors duration-300 ${
            isFocused ? "text-[#EFBF04]" : "text-white/70" // Gold icon on focus, white/70 otherwise
          }`}
        />
      </motion.div>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val);
          onSearchChange?.(val);
        }}
        className={`bg-transparent outline-none placeholder:text-white/70 text-[16px] font-montserrat font-medium w-full pr-4 transition-colors duration-300 ${
          isFocused ? "text-white" : "text-white/90"
        }`}
      />
    </motion.div>
  );
}
