"use client";

import NavBar from "@/app/component/General/CorePages/NavBar";

export default function Calendar() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar currentTab="Calendar" />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h1>
        <p className="text-gray-600">
          Welcome to the calendar page! 📅 Keep track of events and schedules here.
        </p>
      </div>
    </div>
  );
}