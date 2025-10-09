"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Combobox } from "../../ReusableComponent/Combobox";

export default function SearchFilter({
  onSearchChange,
  onSortChange,
}: {
  onSearchChange?: (val: string) => void;
  onSortChange?: (val: string) => void;
}) {
  const [search, setSearch] = useState("");

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "top-reacts", label: "Top Reacts" },
  ];

  return (
    <div className="flex items-center h-[50px] bg-white border border-customgray rounded-full overflow-hidden w-full max-w-[540px]">
      {/* Search input */}
      <div className="flex w-[320px] h-[40px] border bg-[#D6D6D6] border-customgray rounded-[50px] items-center flex-1 mx-1 px-4">
        <Search className="text-[#6D0000] w-5 h-5 mr-2" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            onSearchChange?.(val);
          }}
          className="bg-transparent outline-none text-gray-800 placeholder:text-gray-700 text-[18px] font-montserrat w-full"
        />
      </div>

      {/* Combobox */}
      <div className="mx-1">
        <Combobox
          items={sortOptions}
          placeholder="Choose Time"
          width="w-[200px]"
          buttonHeight="h-[40px]"
          rounded="rounded-[50px]"
          dropdownRounded="rounded-[15px]"
          dropdownHeight="h-[180px]"
          buttonBG="bg-[#D6D6D6]"
          borderColor="border-customgray"
          textColor="text-gray-700"
          selectedTextColor="text-gray-900"
          hoverBG="hover:bg-gray-300"
          dropdownBG="bg-white"
          dropdownTextColor="text-gray-700"
          dropdownHoverBG="hover:bg-[#D6D6D6]"
          checkArrowColor="text-green-700"
          onChange={(val) => onSortChange?.(val)}
        />
      </div>
    </div>
  );
}
