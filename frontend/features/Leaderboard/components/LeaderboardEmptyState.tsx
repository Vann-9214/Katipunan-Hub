import { Award } from "lucide-react";

export default function LeaderboardEmptyState() {
  return (
    <div className="w-full max-w-[500px] bg-white rounded-[20px] border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm">
      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
        <Award size={28} />
      </div>
      <h3 className="text-base font-bold text-gray-700 font-montserrat">
        Hall of Fame Empty
      </h3>
      <p className="text-gray-500 text-xs font-ptsans mt-1">
        No tutor ratings or reviews recorded yet.
      </p>
    </div>
  );
}
