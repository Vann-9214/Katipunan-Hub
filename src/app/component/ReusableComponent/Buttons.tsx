import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export default function Button({
  onClick,
  text,
  font,
  textcolor = "text-white",
  bg = "bg-maroon",
  height = "h-[45px]",
  width = "w-auto",
  rounded = "rounded-[30px]",
  className,
  type = "button",
}: {
  onClick?: () => void;
  text: string;
  font?: string;
  textcolor?: string;
  bg?: string;
  height?: string;
  width?: string;
  rounded?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      className={clsx(
        "select-none px-10 cursor-pointer flex items-center justify-center transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 text-[24px] shadow-lg hover:brightness-105 hover:shadow-xl active:brightness-95 active:shadow-md",
        bg,
        textcolor,
        height,
        width,
        rounded,
        className,
        font
      )}
    >
      {text}
    </button>
  );
}

export function TextButton({
  onClick,
  text,
  className,
  type,
}: {
  onClick?: () => void;
  text: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      className={clsx(
        "select-none px-4 py-2 cursor-pointer inline-flex transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 font-medium text-[24px]",
        className
      )}
    >
      {text}
    </button>
  );
}

export function ImageButton({
  onClick,
  src,
  alt = "button image",
  width = 30,
  height = 30,
  className,
  toggleSrc,
}: {
  onClick?: () => void;
  src: string;
  toggleSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [toggled, setToggled] = useState(false);

  const handleClick = () => {
    if (toggleSrc) {
      setToggled((prev) => !prev);
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "select-none p-2 cursor-pointer inline-flex items-center justify-center transition-all hover:scale-105 duration-150 ease-in-out active:scale-95",
        className
      )}
    >
      <Image
        src={toggled && toggleSrc ? toggleSrc : src}
        alt={alt}
        width={width}
        height={height}
        draggable={false}
      />
    </button>
  );
}
