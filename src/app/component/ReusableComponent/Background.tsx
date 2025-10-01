export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4c542]">
      {/* Maroon shape */}
      <div
        className="absolute z-0"
        style={{
          top: "-20vh",       // scale with viewport height
          left: "-5vw",      // scale with viewport width
          width: "80vw",      // responsive size
          height: "80vw",     // keep square ratio
          maxWidth: "1200px", 
          maxHeight: "1200px",
          backgroundImage: "url('/maroon-shape.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}