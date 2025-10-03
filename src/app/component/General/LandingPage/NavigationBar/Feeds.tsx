"use client";

import NavBar from "@/app/component/General/LandingPage/NavigationBar/NavBar";

export default function Feeds() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar currentTab="Feeds" />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Feeds</h1>
        <p className="text-gray-600">
          Welcome to the feeds page! 📢 Here you’ll see posts and updates from others.
        </p>
      </div>
    </div>
  );
}
