import Image from "next/image";

interface LogoProps {
  href?: string; // where the logo should link to
  unclickable?: boolean; // force it to not be clickable
}

export default function Logo({ href = "/", unclickable = false }: LogoProps) {
  const content = (
    <>
      <Image
        src="logo.svg"
        alt="My Logo"
        width={65}
        height={80}
        draggable="false"
      />
      <h1
        style={{ fontFamily: "Montserrat, sans-serif" }}
        className="font-bold text-[25px] bg-maroon bg-clip-text text-transparent leading-none select-none"
      >
        KATIPUNAN
        <br />
        HUB
      </h1>
    </>
  );

  return unclickable ? (
    <div className="flex items-center gap-3 select-none">{content}</div>
  ) : (
    <a
      href={href}
      onDragStart={(e) => e.preventDefault()}
      className="flex items-center gap-3 select-none"
    >
      {content}
    </a>
  );
}