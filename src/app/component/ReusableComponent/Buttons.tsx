import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export default function Button({
  onClick,
  disabled = false,
  text,
  font,
  textSize = "text-[24px]",
  textcolor = "text-white",
  bg = "bg-maroon",
  height = "h-[45px]",
  width = "w-auto",
  rounded = "rounded-[30px]",
  className,
  type = "button",
}: {
  disabled?: boolean;
  onClick?: () => void;
  textSize?: string;
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
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      className={clsx(
        "select-none px-5 cursor-pointer flex items-center justify-center transition-all hover:scale-101 duration-150 ease-in-out active:scale-99 shadow-lg hover:brightness-105 hover:shadow-xl active:brightness-95 active:shadow-md",
        bg,
        textSize,
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
  type = "button",
  textSize = "text-[24px]",
  fontSize,
}: {
  onClick?: () => void;
  text: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  textSize?: string;
  fontSize?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "select-none w-fit px-4 py-1 font-montserrat cursor-pointer inline-flex transition-all hover:scale-101 duration-150 ease-in-out active:scale-99",
        textSize,
        fontSize,
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
        "select-none border-none outline-none focus:outline-none bg-transparent cursor-pointer inline-flex items-center justify-center transition-all hover:scale-101 duration-150 ease-in-out active:scale-99",
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
