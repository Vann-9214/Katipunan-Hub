"use client";

import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { PostedEvent } from "@/app/component/General/Calendar/types";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// --- CORRECTED PROGRAMS LIST ---
const programs = [
  { value: "bs-accountancy", label: "Bachelor of Science in Accountancy" },
  { value: "bsba", label: "Bachelor of Science in Business Administration" },
  { value: "bsoa", label: "Bachelor of Science in Office Administration" },
  { value: "ba-english", label: "Bachelor of Arts in English" },
  {
    value: "ba-political-science",
    label: "Bachelor of Arts in Political Science",
  },
  { value: "bs-psychology", label: "Bachelor of Science in Psychology" },
  { value: "bs-biology", label: "Bachelor of Science in Biology" },
  { value: "bs-mathematics", label: "Bachelor of Science in Mathematics" },
  {
    value: "bs-computer-science",
    label: "Bachelor of Science in Computer Science",
  },
  {
    value: "bs-information-technology",
    label: "Bachelor of Science in Information Technology",
  },
  {
    value: "bs-computer-engineering",
    label: "Bachelor of Science in Computer Engineering",
  },
  { value: "beed", label: "Bachelor of Elementary Education" },
  { value: "bsed", label: "Bachelor of Secondary Education" },
  { value: "bsee", label: "Bachelor of Science in Electrical Engineering" },
  { value: "bsie", label: "Bachelor of Science in Industrial Engineering" },
  { value: "bsce", label: "Bachelor of Science in Civil Engineering" },
  { value: "bsme", label: "Bachelor of Science in Mechanical Engineering" },
  { value: "bsmining", label: "Bachelor of Science in Mining Engineering" },
  { value: "bs-chemeng", label: "Bachelor of Science in Chemical Engineering" },
  { value: "bsece", label: "Bachelor of Science in Electronics Engineering" },
  { value: "bsn", label: "Bachelor of Science in Nursing" },
  { value: "midwifery", label: "Diploma in Midwifery" },
  { value: "bs-architecture", label: "Bachelor of Science in Architecture" },
  {
    value: "bs-hrm",
    label: "Bachelor of Science in Hotel and Restaurant Management",
  },
  { value: "bstm", label: "Bachelor of Science in Tourism Management" },
];

interface EventModalProps {
  showAddEvent: boolean;
  setShowAddEvent: (show: boolean) => void;
  onEventAdded: () => void;
}

export default function EventModal({
  showAddEvent,
  setShowAddEvent,
  onEventAdded,
}: EventModalProps) {
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [audience, setAudience] = useState("Personal");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Local state for events being created in this modal session
  const [pendingEvents, setPendingEvents] = useState<PostedEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: Automatically set default date to Today when modal opens ---
  useEffect(() => {
    if (showAddEvent) {
      const today = new Date();
      // Format: YYYY-MM-DD
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      setSelectedDate(`${y}-${m}-${d}`);
    }
  }, [showAddEvent]);

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

        if (isMounted) setUserId(user.id);

        const { data: account } = await supabase
          .from("Accounts")
          .select("role, fullName")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted && account) {
          setUserRole(account.role || "");
          setUserName(account.fullName || "");
          setAudience("Personal");
        }
      } catch (err) {
        console.error("Error getting user role:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [showAddEvent]);

  // Check if user is admin based on "contains" logic
  const isAdmin = userRole.includes("Platform Administrator");

  // Define audience options - now only two options for admins
  const audienceOptions = isAdmin ? ["Personal", "Global"] : ["Personal"];

  // Handle audience change - automatically set courses based on selection
  const handleAudienceChange = (type: string) => {
    setAudience(type);

    // If Global is selected, automatically select all courses
    if (type === "Global") {
      setSelectedCourses(programs.map((p) => p.value));
    }
    // If Personal is selected, clear courses
    else if (type === "Personal") {
      setSelectedCourses([]);
    }
  };

  const createAndAddPostedEvent = () => {
    if (!eventTitle.trim()) {
      alert("Please enter an event title");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    const [yearStr, monthStr, dayStr] = selectedDate.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    const newEvent: PostedEvent = {
      title: eventTitle.trim(),
      course: selectedCourses.join(", "),
      audience,
      date: selectedDate,
      year,
      month,
      day,
    };

    setPendingEvents((prev) => [...prev, newEvent]);
    setEventTitle("");
  };

  const handlePost = async () => {
    if (pendingEvents.length === 0) {
      alert("Please add at least one event before posting");
      return;
    }
    setIsSubmitting(true);

    try {
      const dbPayloads = pendingEvents.map((evt) => {
        let coursesArray: string[] | null = null;
        if (evt.audience === "Global") {
          if (evt.course) {
            coursesArray = evt.course.split(", ");
          } else {
            coursesArray = [];
          }
        }
        return {
          user_id: userId,
          title: evt.title,
          date: evt.date!,
          year: evt.year,
          month: evt.month,
          day: evt.day,
          audience: evt.audience,
          courses: coursesArray,
          created_by_name: userName,
          created_by_role: userRole,
        };
      });

      const { error } = await supabase.from("Events").insert(dbPayloads);
      if (error) throw error;
      onEventAdded();
      handleClose();
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to save events. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleClose}
      />

      <div
        className={`fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col ${montserrat.className}`}
        style={{ height: "700px" }}
      >
        {/* Maroon Gradient Header */}
        <div className="bg-gradient-to-r from-[#8B0E0E] to-[#4e0505] p-6 flex justify-between items-center text-white shadow-md">
          <h2 className="text-2xl font-bold tracking-wide">Create New Event</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/90 hover:text-white"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Audience Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
            {audienceOptions.map((type) => (
              <button
                key={type}
                onClick={() => handleAudienceChange(type)}
                className={`py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                  audience === type
                    ? "bg-white text-[#8B0E0E] shadow-sm scale-[1.02] border border-gray-100"
                    : "text-gray-500 hover:bg-white/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Date Picker */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">
                Date
              </label>
              <input
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium focus:ring-2 focus:ring-[#8B0E0E] focus:border-transparent outline-none transition-all"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Title Input */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">
                Event Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium focus:ring-2 focus:ring-[#8B0E0E] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      createAndAddPostedEvent();
                    }
                  }}
                />
                {/* Add Button */}
                <button
                  onClick={createAndAddPostedEvent}
                  className="bg-[#8B0E0E] hover:bg-[#a01212] text-white px-6 rounded-xl shadow-lg transition-all flex items-center justify-center font-bold text-xl"
                  title="Add to pending list"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pending Events List */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Pending Events ({pendingEvents.length})
            </h3>

            <div className="space-y-3 min-h-[100px]">
              {pendingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[100px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-sm font-medium">No events added yet</p>
                </div>
              ) : (
                pendingEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-bold text-[#1a1a1a]">{evt.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            evt.audience === "Global"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {evt.audience}
                        </span>
                        <span>{evt.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setPendingEvents((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all text-xl font-bold"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isSubmitting || pendingEvents.length === 0}
            className="px-8 py-3 bg-[#8B0E0E] text-white rounded-xl font-bold hover:bg-[#700b0b] shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? "Saving..." : "Save Events"}
          </button>
        </div>
      </div>
    </>
  );
}
