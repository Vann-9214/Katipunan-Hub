"use client";

import NavBar from "@/app/component/General/LandingPage/NavigationBar/NavBar";

export default function LostAndFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar currentTab="Lost & Found" />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Lost & Found</h1>
        <p className="text-gray-600">
          Welcome to the Lost & Found page! 🧳 Report or find lost items here.
        </p>
      </div>
    </div>
  );
}
