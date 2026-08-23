export default function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/20 
        backdrop-blur-xl 
        border border-white/30 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
        rounded-[24px]
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-50 before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  );
}

