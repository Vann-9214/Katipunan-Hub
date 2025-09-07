import clsx from "clsx";

export default function Button({
  onClick,
  text,
  textcolor = "text-white",
  bg = "bg-maroon",
}: {
  onClick?: () => void;
  text: string;
  textcolor?: string;
  bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "Roboto Slab, serif" }}
      className={clsx(
        "px-4 py-2 cursor-pointer inline-flex transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 font-medium text-[24px] rounded-[30px] shadow-lg hover:brightness-105 hover:shadow-xl active:brightness-95 active:shadow-md",
        bg,
        textcolor
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
      style={{ fontFamily: "Roboto Slab, serif" }}
      className={clsx(
        "px-4 py-2 cursor-pointer inline-flex transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 font-medium text-[24px]",
        className
      )}
    >
      {text}
    </button>
  );
}
