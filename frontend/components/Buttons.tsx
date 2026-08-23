import clsx from "clsx";

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
  text: React.ReactNode;
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

