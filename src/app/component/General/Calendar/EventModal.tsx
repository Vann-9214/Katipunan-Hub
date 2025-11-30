"use client";

import React, { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { PostedEvent } from "@/app/component/General/Calendar/types";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
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

    // Manually split date string to avoid timezone issues
    const [yearStr, monthStr, dayStr] = selectedDate.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    const newEvent: PostedEvent = {
      title: eventTitle.trim(),
      // Store the raw VALUES comma separated for the pending view
      course: selectedCourses.join(", "),
      audience,
      date: selectedDate,
      year,
      month,
      day,
    };

    // Add to pending events
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
      // Transform pending events to DB format
      const dbPayloads = pendingEvents.map((evt) => {
        // Convert the comma-separated string back to an array of values
        let coursesArray: string[] | null = null;

        if (evt.audience === "Global") {
          // If courses are selected, split the string back to array
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

      // Refresh parent
      onEventAdded();

      // Close modal
      setShowAddEvent(false);

      // Reset form
      setEventTitle("");
      setSelectedCourses([]);
      setSelectedDate("");
      setAudience("Personal");
      setPendingEvents([]);
    } catch (err: unknown) {
      const message = "Unknown error";
      console.error("Error posting events:", message);
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

        {/* AUDIENCE SELECTOR - TWO BUTTONS */}
        <div className="flex gap-4 mb-4">
          {audienceOptions.map((type) => (
            <button
              key={type}
              onClick={() => handleAudienceChange(type)}
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

        {/* EVENT TITLE */}
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
            <p className="text-gray-500 italic">
              No events yet. Add events using the checkmark button above.
            </p>
          ) : (
            pendingEvents.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-100 rounded-lg p-3 mb-2"
              >
                <div>
                  <p className="font-semibold">{evt.title}</p>
                  <p className="text-sm text-gray-600">
                    {evt.audience} | {evt.date}
                    {evt.audience === "Global" && evt.course && (
                      <span className="block text-xs text-gray-500 mt-1 max-w-md truncate">
                        All courses
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPendingEvents((prev) => prev.filter((_, i) => i !== idx))
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
            disabled={isSubmitting}
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </>
  );
}