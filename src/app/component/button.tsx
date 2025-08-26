import clsx from "clsx";

export default function Button({
  text,
  className = "bg-maroon text-white rounded-[20px] shadow-lg hover:brightness-105 hover:shadow-xl active:brightness-95 active:shadow-md",
}: {
  text: string;
  className?: string;
}) {
  return (
    <button
      className={clsx(
        "px-4 py-2 cursor-pointer inline-flex transition-all hover:scale-103 duration-150 ease-in-out active:scale-97 ",
        className
      )}
    >
      {text}
    </button>
  );
}
