"use client";

import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { PostedEvent } from "@/app/component/General/Calendar/types";
import { supabase } from "@/../supabase/Lib/General/supabaseClient";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const courses = [
  "BS Accountancy",
  "BS Architecture",
  "BS Civil Engineering",
  "BS Computer Engineering",
  "BS Computer Science",
  "BS Education",
  "BS Electrical Engineering",
  "BS Electronics Engineering",
  "BS Hospitality Management",
  "BS Information Technology",
  "BS Mechanical Engineering",
  "BS Nursing",
  "BS Pharmacy",
  "BS Psychology",
  "BS Tourism Management",
];

interface EventModalProps {
  showAddEvent: boolean;
  setShowAddEvent: (show: boolean) => void;
  postedEvents: PostedEvent[];
  setPostedEvents: React.Dispatch<React.SetStateAction<PostedEvent[]>>;
}

export default function EventModal({
  showAddEvent,
  setShowAddEvent,
  postedEvents,
  setPostedEvents,
}: EventModalProps) {
  const [userRole, setUserRole] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [audience, setAudience] = useState("Personal");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  // Local state for events being created in this modal session
  const [pendingEvents, setPendingEvents] = useState<PostedEvent[]>([]);

  // Fetch current user role on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("No user found or not logged in.");
          return;
        }

        const { data: account, error: accountError } = await supabase
          .from("Accounts")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted && account?.role) {
          setUserRole(account.role);
          setAudience("Personal");
        }
      } catch (err) {
        console.error("Error getting user role:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check if user is admin
  const isAdmin = 
    userRole.includes("Platform Administrator") || 
    userRole.includes("Announcements Moderator");

  // Define audience options based on admin status
  const audienceOptions = isAdmin 
    ? ["Personal", "Global"] 
    : ["Personal"];

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(course)) {
        return prev.filter((c) => c !== course);
      } else {
        return [...prev, course];
      }
    });
  };

  const selectAllCourses = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses([...courses]);
    }
  };

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

    // Validate courses if audience is Global
    if (audience === "Global" && selectedCourses.length === 0) {
      alert("Please select at least one course");
      return;
    }

    const dateObj = new Date(selectedDate);
    const newEvent: PostedEvent = {
      title: eventTitle.trim(),
      course: selectedCourses.join(", "),
      audience,
      date: selectedDate,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
    };

    // Add to pending events (local to this modal session)
    setPendingEvents((prev) => [...prev, newEvent]);
    
    // Clear only the event title after adding
    setEventTitle("");
  };

  const handlePost = () => {
    // Check if there are events to post
    if (pendingEvents.length === 0) {
      alert("Please add at least one event before posting");
      return;
    }

    // Add all pending events to the calendar (parent state)
    setPostedEvents((prev) => [...prev, ...pendingEvents]);
    
    // Close modal
    setShowAddEvent(false);
    
    // Reset form and clear pending events
    setEventTitle("");
    setSelectedCourses([]);
    setSelectedDate("");
    setAudience("Personal");
    setPendingEvents([]);
  };

  const handleClose = () => {
    setShowAddEvent(false);
    setEventTitle("");
    setSelectedCourses([]);
    setSelectedDate("");
    setAudience("Personal");
    setPendingEvents([]);
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
          <label className="block text-lg font-semibold mb-2">Select Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* AUDIENCE SELECTOR */}
        <div className="flex gap-4 mb-4">
          {audienceOptions.map((type) => (
            <button
              key={type}
              onClick={() => setAudience(type)}
              className={`px-6 py-2 rounded-full border font-medium transition-all ${
                audience === type
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-300 text-gray-600 hover:border-yellow-400 cursor-pointer"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Course Selector - Multi-select with checkboxes */}
        {isAdmin && (
          <div className="mb-4 relative">
            <label className="block text-lg font-semibold mb-2">
              Select Courses
            </label>
            <div
              onClick={() => audience === "Global" && setShowCourseDropdown(!showCourseDropdown)}
              className={`w-full border rounded-lg p-3 text-base min-h-[48px] flex items-center justify-between cursor-pointer ${
                audience !== "Global"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                  : "border-gray-300 hover:border-yellow-400"
              }`}
            >
              <span className={selectedCourses.length === 0 ? "text-gray-400" : ""}>
                {audience !== "Global" 
                  ? "Select Global audience first" 
                  : selectedCourses.length === 0 
                    ? "Click to select courses..." 
                    : selectedCourses.length === courses.length
                      ? "All Courses Selected"
                      : `${selectedCourses.length} course(s) selected`}
              </span>
              {audience === "Global" && (
                <span className="text-gray-500">▼</span>
              )}
            </div>

            {/* Dropdown with checkboxes */}
            {audience === "Global" && showCourseDropdown && (
              <div className="absolute bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-60 overflow-y-auto z-[999] shadow-lg">
                {/* Select All option */}
                <div
                  className="p-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-200 font-semibold flex items-center gap-2"
                  onClick={selectAllCourses}
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === courses.length}
                    onChange={() => {}}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span>Select All</span>
                </div>

                {/* Individual courses */}
                {courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="p-3 hover:bg-yellow-50 cursor-pointer flex items-center gap-2"
                    onClick={() => toggleCourse(course)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course)}
                      onChange={() => {}}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVENT TITLE with checkmark */}
        <div className="mb-4 relative">
          <label className="block text-lg font-semibold mb-2">Event Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400 pr-10"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter event title"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
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
          <h3 className="font-semibold mb-2 text-lg">Pending Events</h3>
          {pendingEvents.length === 0 ? (
            <p className="text-gray-500 italic">No events yet. Add events using the checkmark button above.</p>
          ) : (
            pendingEvents.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-100 rounded-lg p-3 mb-2"
              >
                <div>
                  <p className="font-semibold">EVENT: {evt.title}</p>
                  <p className="text-sm text-gray-600">
                    {evt.audience === "Global"
                      ? `Global Event - Courses: ${evt.course}`
                      : "Personal Event"}
                    {evt.date && ` | ${evt.date}`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPendingEvents((prev) => prev.filter((_, i) => i !== idx))
                  }
                  title="Remove event"
                >
                  <span className="text-red-500 font-bold text-xl hover:text-red-700">×</span>
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