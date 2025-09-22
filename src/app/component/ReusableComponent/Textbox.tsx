import React from "react";
import Image from "next/image";

interface TextBoxProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  rightImageSrc?: string; // path to your local image
  rightImageAlt?: string;
  rightImageWidth?: number;
  rightImageHeight?: number;
}

export default function TextBox({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  rightImageSrc,
  rightImageAlt = "icon",
  rightImageWidth = 20,
  rightImageHeight = 20,
}: TextBoxProps) {
  return (
    <div className="relative w-[540px]">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`text-[20px] h-[60px] w-full px-5 pr-12 rounded-[30px] border border-black focus:outline-none focus:ring-1 ${className}`}
      />
      {rightImageSrc && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Image
            draggable={false}
            src={rightImageSrc}
            alt={rightImageAlt}
            width={rightImageWidth}
            height={rightImageHeight}
          />
        </div>
      )}
    </div>
  );
}
