import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
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
        {" "}
        KATIPUNAN
        <br />
        HUB
      </h1>
    </div>
  );
}
