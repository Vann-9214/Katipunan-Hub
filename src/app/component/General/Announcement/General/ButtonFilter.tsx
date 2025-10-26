"use client";

import { useState, useEffect } from "react";
import Button from "@/app/component/ReusableComponent/Buttons";

export type VisibilityOption = "Global" | "Course" | "All";

interface ButtonFilterProps {
  // optional controlled `active` value (if not provided, component is uncontrolled)
  active?: VisibilityOption;
  // callback when user picks a different filter
  onChange?: (val: VisibilityOption) => void;
}

export default function ButtonFIlter({
  active: activeProp,
  onChange,
}: ButtonFilterProps) {
  // default to "Global"
  const [active, setActive] = useState<VisibilityOption>(
    activeProp ?? "Global"
  );

  useEffect(() => {
    if (activeProp) setActive(activeProp);
  }, [activeProp]);

  const buttons: VisibilityOption[] = ["Global", "Course", "All"];

  const handleClick = (btn: VisibilityOption) => {
    setActive(btn);
    if (onChange) onChange(btn);
  };

  return (
    <div className="flex gap-3 w-full flex-wrap">
      {buttons.map((btn) => (
        <Button
          key={btn}
          text={btn}
          onClick={() => handleClick(btn)}
          bg={active === btn ? "bg-maroon" : "bg-[#D6D6D6]"}
          textcolor={active === btn ? "text-white" : "text-black"}
          width="w-auto md:flex-1"
          height="h-[45px]"
          rounded="rounded-[20px]"
          className="border border-gray-400 text-[18px] font-montserrat font-medium transition-all duration-200"
        />
      ))}
    </div>
  );
}
