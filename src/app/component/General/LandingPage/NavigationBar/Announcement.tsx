"use client";

import NavBar from "@/app/component/General/LandingPage/NavigationBar/NavBar";

export default function Announcement() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar always at the top */}
      <NavBar currentTab="Announcement" />

      {/* Page Content */}
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Announcements</h1>
        <p className="text-gray-600">
          Welcome to the announcement page! 🎉  
          Here you’ll see updates, news, and important info.
        </p>
      </div>
    </div>
  );
}