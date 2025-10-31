"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchFilter({
  onSearchChange,
}: {
  onSearchChange?: (val: string) => void;
  onSortChange?: (val: string) => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center h-[40px] bg-white border border-customgray rounded-[10px] overflow-hidden w-[320px]">
      {/* Search input */}
      <Search className="text-black w-[24px] h-[24px] mx-2" />
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val);
          onSearchChange?.(val);
        }}
        className="bg-transparent outline-none text-black placeholder:text-black/60 text-[16px] font-montserrat font-medium w-full"
      />

      {/* Combobox */}
    </div>
  );
}
