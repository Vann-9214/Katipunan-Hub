"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Use your utility for better class merging

interface TextBoxProps {
  type?: string;
  height?: string;
  width?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  rightImageSrc?: string;
  rightToggleImageSrc?: string;
  rightImageAlt?: string;
  rightImageWidth?: number;
  rightImageHeight?: number;
  onRightClick?: () => void;
  overrideTypeOnToggle?: [string, string];
  autoFocus?: boolean;
  textSize?: string; // NEW: Allow font size customization
}

export default function TextBox({
  type = "text",
  placeholder = "",
  height = "h-[50px]", // Reduced default height slightly
  width = "w-full",
  value,
  onChange,
  className = "",
  rightImageSrc,
  rightToggleImageSrc,
  rightImageAlt = "icon",
  rightImageWidth = 24, // Smaller default icon size
  rightImageHeight = 24,
  onRightClick,
  overrideTypeOnToggle,
  autoFocus = false,
  textSize = "text-[16px]", // Better default font size
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
    <div className={`relative ${width} select-none group`}>
      <input
        autoFocus={autoFocus}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          // Base Layout & Typography
          "w-full px-5 pr-12 rounded-full font-montserrat outline-none transition-all duration-200 ease-in-out",
          // Default Colors (Softer gray border & background)
          "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400",
          // Focus State (White bg, Maroon border, Soft Ring)
          "focus:bg-white focus:border-[#8B0E0E] focus:ring-4 focus:ring-[#8B0E0E]/5",
          // Dynamic Props
          height,
          textSize,
          // Allow overrides
          className
        )}
      />

      {rightImageSrc && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 group-focus-within:text-[#8B0E0E] transition-colors">
          {onRightClick || rightToggleImageSrc ? (
            <button
              type="button"
              onClick={handleRightClick}
              className="cursor-pointer hover:scale-110 active:scale-95 transition-transform p-1"
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
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            </button>
          ) : (
            <Image
              src={rightImageSrc}
              alt={rightImageAlt}
              width={rightImageWidth}
              height={rightImageHeight}
              draggable={false}
              className="opacity-60"
            />
          )}
        </div>
      )}
    </div>
  );
}