"use client";
import NavBar from "@/app/component/General/CorePages/NavBar";

export default function Groups() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar currentTab="Groups" />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Groups</h1>
        <p className="text-gray-600">This is the groups page.</p>
      </div>
    </div>
  );
}