"use client";

import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";

interface ToggleButtonProps {
  leftLabel?: string;
  rightLabel?: string;
  active?: "left" | "right";
  onToggle?: (side: "left" | "right") => void;
  leftActiveBg?: string;
  rightActiveBg?: string;
}

export default function ToggleButton({
  leftLabel = "Left",
  rightLabel = "Right",
  active = "left",
  onToggle,
  leftActiveBg = "bg-maroon",
  rightActiveBg = "bg-gold",
}: ToggleButtonProps) {
  return (
    <div className="w-[540px] h-[50px] bg-white rounded-[30px] border border-black/40 flex items-center px-[5px]">
      {/* Left slot */}
      <div className="w-[50%] flex justify-center">
        {active === "left" ? (
          <Button
            text={leftLabel}
            textcolor="text-white"
            bg={leftActiveBg}
            height="h-[40px]"
            width="w-[260px]"
            onClick={() => onToggle?.("left")}
          />
        ) : (
          <TextButton
            text={leftLabel}
            className="text-[#7C7C7C]"
            type="button"
            onClick={() => onToggle?.("left")}
          />
        )}
      </div>

      {/* Right slot */}
      <div className="w-[50%] flex justify-center">
        {active === "right" ? (
          <Button
            text={rightLabel}
            textcolor="text-white"
            bg={rightActiveBg}
            height="h-[40px]"
            width="w-[260px]"
            onClick={() => onToggle?.("right")}
          />
        ) : (
          <TextButton
            text={rightLabel}
            className="text-[#7C7C7C]"
            type="button"
            onClick={() => onToggle?.("right")}
          />
        )}
      </div>
    </div>
  );
}
