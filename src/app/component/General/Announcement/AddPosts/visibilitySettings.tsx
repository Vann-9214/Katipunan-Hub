// components/AddPosts/VisibilitySettings.tsx
"use client";

import Button from "@/app/component/ReusableComponent/Buttons";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { collegeitems } from "../Utils/constants";

interface VisibilitySettingsProps {
  visibleTo: "global" | "college";
  visibleCollege: string | null;
  onVisibleToChange: (value: "global" | "college") => void;
  onVisibleCollegeChange: (value: string | null) => void;
}

export default function VisibilitySettings({
  visibleTo,
  // visibleCollege is received as a prop but not passed to Combobox
  onVisibleToChange,
  onVisibleCollegeChange,
}: VisibilitySettingsProps) {
  return (
    <>
      <h2 className="text-[24px] font-montserrat">Visible To</h2>
      <div className="grid grid-cols-3 gap-4 items-center">
        <Button
          text="Global"
          bg={visibleTo === "global" ? "bg-maroon" : "bg-gray-200"}
          textcolor={visibleTo === "global" ? "text-white" : "text-black"}
          height="h-[45px]"
          rounded="rounded-[30px]"
          onClick={() => {
            onVisibleToChange("global");
            onVisibleCollegeChange(null);
          }}
          width="w-full"
          className="border border-black"
        />
        <Button
          text="College"
          bg={visibleTo === "college" ? "bg-maroon" : "bg-gray-200"}
          textcolor={visibleTo === "college" ? "text-white" : "text-black"}
          height="h-[45px]"
          rounded="rounded-[30px]"
          onClick={() => onVisibleToChange("college")}
          width="w-full"
          className="border border-black"
        />
        <Combobox
          items={collegeitems}
          placeholder="Select College"
          buttonHeight="h-[45px]"
          disabled={visibleTo !== "college"}
          width="w-full"
          // Pass the value back up to the parent
          onChange={(val) => onVisibleCollegeChange(val || null)}
        />
      </div>
    </>
  );
}
