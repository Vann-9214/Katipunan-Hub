"use client";

import { useState } from "react";
import Button from "@/app/component/ReusableComponent/Buttons";

export default function ButtonFIlter() {
  const [active, setActive] = useState("Global");

  const buttons = ["Global", "Course", "All"];

  return (
    <div className="flex gap-3 w-full flex-wrap">
      {buttons.map((btn) => (
        <Button
          key={btn}
          text={btn}
          onClick={() => setActive(btn)}
          bg={active === btn ? "bg-maroon" : "bg-[#D6D6D6]"}
          textcolor={active === btn ? "text-white" : "text-black"}
          width="w-auto md:flex-1" // ✨ natural width on mobile, equal on desktop
          height="h-[45px]"
          rounded="rounded-[20px]"
          className="border border-gray-400 text-[18px] font-montserrat font-medium transition-all duration-200"
        />
      ))}
    </div>
  );
}
