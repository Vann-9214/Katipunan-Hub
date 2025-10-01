import React, { useState } from "react";
import Image from "next/image";

interface TextBoxProps {
  type?: string;
  height?: string;
  width?: string; // Tailwind width like "w-full", "w-[300px]"
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  rightImageSrc?: string;
  rightToggleImageSrc?: string; // optional toggle image
  rightImageAlt?: string;
  rightImageWidth?: number;
  rightImageHeight?: number;
  onRightClick?: () => void;
  overrideTypeOnToggle?: [string, string]; // e.g. ["password", "text"]
}

export default function TextBox({
  type = "text",
  placeholder = "",
  height = "h-[60px]",
  width = "w-[540px]",
  value,
  onChange,
  className = "",
  rightImageSrc,
  rightToggleImageSrc,
  rightImageAlt = "icon",
  rightImageWidth = 30,
  rightImageHeight = 30,
  onRightClick,
  overrideTypeOnToggle,
}: TextBoxProps) {
  const [toggled, setToggled] = useState(false);

  const handleRightClick = () => {
    if (rightToggleImageSrc) {
      setToggled((prev) => !prev);
    }
    onRightClick?.();
  };

  const inputType =
    overrideTypeOnToggle && toggled
      ? overrideTypeOnToggle[1]
      : overrideTypeOnToggle
      ? overrideTypeOnToggle[0]
      : type;

  return (
    <div className={`relative ${width} select-none`}>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`text-[20px] ${height} w-full px-5 pr-13 rounded-[30px] border border-black font-montserrat focus:outline-none focus:ring-1 ${className}`}
      />

      {rightImageSrc && (
        <div className="absolute right-4 top-1/2 -translate-y-[45%]">
          {onRightClick || rightToggleImageSrc ? (
            <button
              type="button"
              onClick={handleRightClick}
              className="cursor-pointer transition-all hover:scale-105 active:scale-95 duration-150 ease-in-out"
            >
              <Image
                src={
                  toggled && rightToggleImageSrc
                    ? rightToggleImageSrc
                    : rightImageSrc
                }
                alt={rightImageAlt}
                width={rightImageWidth}
                height={rightImageHeight}
                draggable={false}
              />
            </button>
          ) : (
            <Image
              src={rightImageSrc}
              alt={rightImageAlt}
              width={rightImageWidth}
              height={rightImageHeight}
              draggable={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
