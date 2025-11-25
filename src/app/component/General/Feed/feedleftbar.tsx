"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";

interface FeedsLeftBarProps {
  activeTab: "feed" | "plc";
  onTabToggle: (tab: "feed" | "plc") => void;
}

export default function FeedsLeftBar({
  activeTab,
  onTabToggle,
}: FeedsLeftBarProps) {
  return (
    <div className="bg-white w-[350px] left-0 top-0 fixed h-full pt-28 flex flex-col items-center overflow-y-auto border-r border-gray-100">
      <div className="mb-8">
        <ToggleButton
          width="w-[320px]"
          height="h-[45px]"
          textSize="text-[16px]"
          leftLabel="Feed"
          rightLabel="PLC"
          leftActiveBg="bg-maroon" // Red for general feed
          rightActiveBg="bg-gold" // Gold for PLC Hall of Fame
          active={activeTab === "feed" ? "left" : "right"}
          onToggle={(side) => onTabToggle(side === "left" ? "feed" : "plc")}
        />
      </div>

      {/* Simple Info Text */}
      <div className="px-8 text-center">
        {activeTab === "feed" ? (
          <p className="text-gray-500 font-montserrat text-sm">
            Connect with the community. Share your thoughts, photos, and updates
            with everyone at CIT-U.
          </p>
        ) : (
          <p className="text-gray-500 font-montserrat text-sm">
            <span className="text-[#8B0E0E] font-bold">PLC Hall of Fame</span>
            <br />
            Celebrating our top-rated tutors and successful learning sessions.
          </p>
        )}
      </div>
    </div>
  );
}
