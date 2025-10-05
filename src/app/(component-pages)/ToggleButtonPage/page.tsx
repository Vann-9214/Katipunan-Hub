"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";

export default function ToggleButtonPage() {
  return (
    <div className="p-4 justify-center items-center flex min-h-screen">
      <ToggleButton
        leftLabel="Announcement"
        rightLabel="Highlights"
        active="left"
        onToggle={(side) => console.log("Toggled to:", side)}
        leftActiveBg="bg-maroon"
        rightActiveBg="bg-gold"
      />
    </div>
  );
}
