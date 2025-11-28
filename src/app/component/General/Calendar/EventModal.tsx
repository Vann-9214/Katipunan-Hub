"use client";

import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { PostedEvent } from "@/app/component/General/Calendar/types";
import type { User } from "../../../../../supabase/Lib/General/user";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const courses = [
  "BS Computer Engineering",
  "BS Computer Science",
  "BS Information Technology",
  "BS Electronics Engineering",
  "BS Electrical Engineering",
  "BS Civil Engineering",
  "BS Architecture",
  "BS Mechanical Engineering",
  "BS Accountancy",
  "BS Psychology",
  "BS Education",
  "BS Nursing",
  "BS Pharmacy",
  "BS Hospitality Management",
  "BS Tourism Management",
];

interface EventModalProps {
  showAddEvent: boolean;
  setShowAddEvent: (show: boolean) => void;
  postedEvents: PostedEvent[];
  setPostedEvents: React.Dispatch<React.SetStateAction<PostedEvent[]>>;
  user: User | null; // Added user prop
}

export default function EventModal({
  showAddEvent,
  setShowAddEvent,
  postedEvents,
  setPostedEvents,
  user,
}: EventModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [audience, setAudience] = useState("Course"); // Default to Course for safety
  const [courseInput, setCourseInput] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);

  // Determine if user is Platform Admin
  const isPlatformAdmin =
    user?.role?.includes("Platform Administrator") ?? false;

  // Available audience types based on role
  const audienceTypes = isPlatformAdmin ? ["Global", "Course"] : ["Course"];

  // Reset audience when modal opens or user changes
  useEffect(() => {
    if (showAddEvent) {
      setAudience(isPlatformAdmin ? "Global" : "Course");
    }
  }, [showAddEvent, isPlatformAdmin]);

  useEffect(() => {
    if (courseInput.trim() === "") {
      setFilteredCourses([]);
    } else {
      const results = courses.filter((c) =>
        c.toLowerCase().includes(courseInput.toLowerCase())
      );
      setFilteredCourses(results);
    }
  }, [courseInput]);

  const createAndAddPostedEvent = () => {
    // Validate event title
    if (!eventTitle.trim()) {
      alert("Please enter an event title");
      return;
    }

    // Validate date
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    // Validate course if audience is Course
    if (audience === "Course" && !courseInput.trim()) {
      alert("Please select a course");
      return;
    }

    const dateObj = new Date(selectedDate);
    const newEvent: PostedEvent = {
      title: eventTitle.trim(),
      course: courseInput,
      audience,
      date: selectedDate,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
    };

    setPostedEvents((prev) => [...prev, newEvent]);

    // Clear only the event title after adding
    setEventTitle("");
  };

  const handlePost = () => {
    // Check if there are events to post
    if (postedEvents.length === 0) {
      alert("Please add at least one event before posting");
      return;
    }

    // Close modal - events are already in the calendar
    setShowAddEvent(false);

    // Reset form
    setEventTitle("");
    setCourseInput("");
    setSelectedDate("");
    // Reset to default based on permission
    setAudience(isPlatformAdmin ? "Global" : "Course");
  };

  const handleClose = () => {
    setShowAddEvent(false);
    setEventTitle("");
    setCourseInput("");
    setSelectedDate("");
    setAudience(isPlatformAdmin ? "Global" : "Course");
  };

  if (!showAddEvent) return null;

  return (
    <>
      {/* Dim background */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      ></div>

      {/* Modal content */}
      <div
        className="fixed z-50 bg-[#f9f9f9] rounded-2xl shadow-2xl p-10 flex flex-col"
        style={{
          width: "800px",
          height: "700px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: montserrat.style.fontFamily,
        }}
      >
        {/* Header */}
        <h2 className="text-3xl font-bold mb-6">Create New Event</h2>

        {/* DATE PICKER */}
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">
            Select Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* AUDIENCE SELECTOR - DYNAMIC BASED ON ROLE */}
        <div className="flex gap-4 mb-4">
          {audienceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setAudience(type)}
              className={`px-6 py-2 rounded-full border font-medium transition-all ${
                audience === type
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-300 text-gray-600 hover:border-yellow-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Course Selector */}
        {audience === "Course" && (
          <div className="mb-4 relative">
            <label className="block text-lg font-semibold mb-2">
              Select Course
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400"
              placeholder="Type to search courses..."
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              onFocus={() => {
                if (courses.length > 0) setFilteredCourses(courses);
              }}
            />
            {/* Dropdown */}
            {filteredCourses.length > 0 && (
              <ul className="absolute bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-40 overflow-y-auto z-[999]">
                {filteredCourses.map((course, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-yellow-100 cursor-pointer"
                    onClick={() => {
                      setCourseInput(course);
                      setFilteredCourses([]);
                    }}
                  >
                    {course}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* EVENT TITLE with checkmark */}
        <div className="mb-4 relative">
          <label className="block text-lg font-semibold mb-2">
            Event Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400 pr-10"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter event title"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                createAndAddPostedEvent();
              }
            }}
          />

          {/* Clickable checkmark - adds to list */}
          {eventTitle.trim() && (
            <button
              onClick={createAndAddPostedEvent}
              className="absolute right-3 top-[42px] text-green-500 hover:text-green-600 text-2xl"
              title="Add to event list"
            >
              ✓
            </button>
          )}
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 mt-4 pt-4">
          <h3 className="font-semibold mb-2 text-lg">Posted Events</h3>
          {postedEvents.length === 0 ? (
            <p className="text-gray-500 italic">
              No events yet. Add events using the checkmark button above.
            </p>
          ) : (
            postedEvents.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-100 rounded-lg p-3 mb-2"
              >
                <div>
                  <p className="font-semibold">EVENT: {evt.title}</p>
                  <p className="text-sm text-gray-600">
                    {evt.audience === "Global"
                      ? "Global Event"
                      : `Course: ${evt.course}`}
                    {evt.date && ` | ${evt.date}`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPostedEvents((prev) => prev.filter((_, i) => i !== idx))
                  }
                  title="Remove event"
                >
                  <span className="text-red-500 font-bold text-xl hover:text-red-700">
                    ×
                  </span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </>
  );
}
