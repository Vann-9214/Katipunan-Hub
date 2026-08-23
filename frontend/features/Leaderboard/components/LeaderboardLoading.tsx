import { Loader2 } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="py-12 flex flex-col items-center justify-center w-full gap-2">
      <Loader2 className="animate-spin text-[#8B0E0E]" size={28} />
      <span className="text-xs font-montserrat text-gray-500 font-semibold">
        Loading Hall of Fame...
      </span>
    </div>
  );
}
