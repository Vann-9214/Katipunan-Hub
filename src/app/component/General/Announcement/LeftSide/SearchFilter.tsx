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
      animate={{
        width: isFocused ? 340 : 320,
        borderColor: isFocused ? "maroon" : "#e5e7eb",
        boxShadow: isFocused ? "0px 4px 20px rgba(0, 0, 0, 0.05)" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center h-[40px] bg-white border rounded-[10px] overflow-hidden"
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.1 : 1,
          rotate: isFocused ? 10 : 0, // Subtle tilt on focus
        }}
        className="ml-3 mr-2"
      >
        <Search
          className={`w-[20px] h-[20px] ${
            isFocused ? "text-black" : "text-gray-400"
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
        className="bg-transparent outline-none text-black placeholder:text-gray-400 text-[16px] font-montserrat font-medium w-full pr-4"
      />
    </motion.div>
  );
}
