"use client";

import Image from "next/image";

interface LogoProps {
  href?: string;
  unclickable?: boolean;
  width?: number;
  height?: number;
  showText?: boolean; // New prop to control text visibility
}

export default function Logo({
  href = "/",
  unclickable = false,
  width = 55,
  height = 70,
  showText = true, // Default to true to maintain original behavior
}: LogoProps) {
  const content = (
    <>
      <Image
        src="/Logo.svg"
        alt="My Logo"
        width={width}
        height={height}
        draggable="false"
      />
      {showText && (
        <h1
          style={{ fontFamily: "Montserrat, sans-serif" }}
          className="font-bold text-[23px] bg-maroon bg-clip-text text-transparent leading-none select-none"
        >
          KATIPUNAN
          <br />
          HUB
        </h1>
      )}
    </>
  );

  return unclickable ? (
    <div className="flex items-center gap-1.5 select-none">{content}</div>
  ) : (
    <a
      href={href}
      onDragStart={(e) => e.preventDefault()}
      className="flex items-center gap-1.5 select-none"
    >
      {content}
    </a>
  );
}
