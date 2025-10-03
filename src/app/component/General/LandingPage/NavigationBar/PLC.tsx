"use client";

import NavBar from "@/app/component/General/LandingPage/NavigationBar/NavBar";

export default function PLC() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar currentTab="PLC" />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">PLC</h1>
        <p className="text-gray-600">
          Welcome to the PLC page! 📘 Here you’ll find resources and learning communities.
        </p>
      </div>
    </div>
  );
}
