import Image from "next/image";

interface LogoProps {
  href?: string; // where the logo should link to
  unclickable?: boolean; // force it to not be clickable
  width?: number;
  height?: number;
}

export default function Logo({
  href = "/",
  unclickable = false,
  width = 58,
  height = 73,
}: LogoProps) {
  const content = (
    <>
      <Image
        src="Logo.svg"
        alt="My Logo"
        width={width}
        height={height}
        draggable="false"
      />
      <h1
        style={{ fontFamily: "Montserrat, sans-serif" }}
        className="font-bold text-[23px] bg-maroon bg-clip-text text-transparent leading-none select-none"
      >
        KATIPUNAN
        <br />
        HUB
      </h1>
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
