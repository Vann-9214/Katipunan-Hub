import clsx from "clsx";

export default function Button({
  onClick,
  text,
  textcolor = "text-white",
  bg = "bg-maroon",
  height = "h-[45px]",
  width = "w-[130px]",
  rounded = "rounded-[30px]",
  className,
}: {
  onClick?: () => void;
  text: string;
  textcolor?: string;
  bg?: string;
  height?: string;
  width?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      className={clsx(
        "cursor-pointer flex items-center justify-center transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 font-medium text-[24px] shadow-lg hover:brightness-105 hover:shadow-xl active:brightness-95 active:shadow-md",
        bg,
        textcolor,
        height,
        width,
        rounded,
        className
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
}: {
  onClick?: () => void;
  text: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "Montserrat, sans-serif" }}
      className={clsx(
        "px-4 py-2 cursor-pointer inline-flex transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 font-medium text-[24px]",
        className
      )}
    >
      {text}
    </button>
  );
}
