"use client";

import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";

interface ToggleButtonProps {
  leftLabel?: string;
  rightLabel?: string;
  active?: "left" | "right";
  onToggle?: (side: "left" | "right") => void;
  leftActiveBg?: string;
  rightActiveBg?: string;
  width?: string;
  height?: string;
  textSize?: string;
}

export default function ToggleButton({
  leftLabel = "Left",
  rightLabel = "Right",
  active = "left",
  onToggle,
  leftActiveBg = "bg-maroon",
  rightActiveBg = "bg-gold",
  width = "w-[540px]",
  height = "h-[50px]",
  textSize = "text-[16px]",
}: ToggleButtonProps) {
  return (
    <div
      className={`
        ${width} ${height} 
        bg-white 
        rounded-[30px] 
        border 
        border-black/40 
        flex 
        items-center
      `}
    >
      {/* Left slot */}
      <div className="w-[50%] h-full flex justify-center items-center p-[5px]">
        {active === "left" ? (
          <Button
            font="font-medium"
            text={leftLabel}
            textcolor="text-white"
            textSize={textSize}
            bg={leftActiveBg}
            height="h-full"
            width="w-full"
            onClick={() => onToggle?.("left")}
          />
        ) : (
          <TextButton
            fontSize="font-medium"
            text={leftLabel}
            className="text-[#7C7C7C]"
            textSize={textSize}
            type="button"
            onClick={() => onToggle?.("left")}
          />
        )}
      </div>

      {/* Right slot */}
      <div className="w-[50%] h-full flex justify-center items-center p-[5px]">
        {active === "right" ? (
          <Button
            font="font-medium"
            text={rightLabel}
            textcolor="text-white"
            textSize={textSize}
            bg={rightActiveBg}
            height="h-full"
            width="w-full"
            onClick={() => onToggle?.("right")}
          />
        ) : (
          <TextButton
            fontSize="font-medium"
            text={rightLabel}
            className="text-[#7C7C7C]"
            textSize={textSize}
            type="button"
            onClick={() => onToggle?.("right")}
          />
        )}
      </div>
    </div>
  );
}
