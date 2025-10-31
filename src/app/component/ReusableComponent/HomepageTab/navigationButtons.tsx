"use client";

import type { ElementType } from "react";

interface NavigationButtonProps {
  label: string;
  icon: ElementType;
  href: string;
  isActive?: boolean;
}

export default function NavigationButton({
  label,
  icon: Icon,
  href,
  isActive = false,
}: NavigationButtonProps) {
  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`
        group
        relative
        flex
        flex-col
        items-center
        justify-center
        min-w-[125px]
        h-[70px]
        px-4
        py-2
        rounded-[10px]
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        cursor-pointer
        ${isActive ? "text-[#8B0E0E]" : "text-black hover:bg-black/5"}
      `}
    >
      {/* ICON (stays perfectly centered) */}
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isActive ? "translate-y-0" : "group-hover:-translate-y-2"
        }`}
      >
        <Icon className="w-[26px] h-[26px]" />
      </div>

      <span
        className={`
          absolute
          bottom-2
          text-[14px]
          font-medium
          font-montserrat
          whitespace-nowrap
          transition-all
          duration-300
          ease-in-out
          ${
            isActive
              ? "opacity-0 translate-y-2"
              : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
          }
        `}
      >
        {label}
      </span>

      {/* UNDERLINE (only active) */}
      {isActive && (
        <span
          className="
                absolute
                bottom-0
                left-4      
                right-4     
                h-[3px]
                bg-[#8B0E0E]          
                rounded-full
              "
        />
      )}
    </a>
  );
}
