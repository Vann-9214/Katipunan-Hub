"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Montserrat, PT_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});
const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type Holiday = { name: string; month: number; day: number };

export default function CalendarContent() {
  // ---------------------
  // Core UI state
  // ---------------------
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<
    "Reminder" | "Schedule" | "Year" | "Month"
  >("Reminder");

  const [newEvent, setNewEvent] = useState("");
  // controls whether New Event modal is visible

  const [selectedFilter, setSelectedFilter] = useState<
    "Global Events" | "Personal Events" | "All"
  >("Global Events");

  // reminders & personal events
  const [newReminder, setNewReminder] = useState("");
  const [reminders, setReminders] = useState<string[]>([]);
  const [personalEvents, setPersonalEvents] = useState<
    { name: string; year: number; month: number; day: number }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [audience, setAudience] = useState("Global"); // or "Course"
  const [courseInput, setCourseInput] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [postedEvents, setPostedEvents] = useState<
    { title: string; course: string; audience: string; date?: string }[]
  >([]);

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

  useEffect(() => {
    if (courseInput.trim() === "") {
      setFilteredCourses([]);
    } else {
      const results = courses.filter((c) =>
        c.toLowerCase().includes(courseInput.toLowerCase())
      );
      setFilteredCourses(results);
    }
  }, [courseInput, courses]);

  // calendar helpers
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const prevMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === currentDate.getMonth();
  const todayDate = today.getDate();

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  // ---------------------
  // Holiday logic
  // ---------------------
  // Easter (Meeus/Jones) -> for Maundy Thursday/Good Friday
  function computeEasterSunday(y: number): Date {
    const a = y % 19;
    const b = Math.floor(y / 100);
    const c = y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = Mar, 4 = Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  function lastMondayOfMonth(y: number, month0Based: number) {
    const lastDay = new Date(y, month0Based + 1, 0);
    const dayOfWeek = lastDay.getDay(); // 0..6
    const offset = (dayOfWeek + 6) % 7; // days since last Monday
    const lastMonday = new Date(y, month0Based + 1, 0 - offset);
    return lastMonday;
  }

  function getPhilippineHolidays(y: number): Holiday[] {
    // Fixed date holidays (examples + common special days)
    const base: Holiday[] = [
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Araw ng Kagitingan (Day of Valor)", month: 4, day: 9 },
      { name: "Labor Day", month: 5, day: 1 },
      { name: "Independence Day", month: 6, day: 12 },
      { name: "Ninoy Aquino Day", month: 8, day: 21 },
      { name: "All Saints' Day (Special)", month: 11, day: 1 },
      { name: "Bonifacio Day", month: 11, day: 30 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "Rizal Day", month: 12, day: 30 },
      { name: "Christmas Eve (Special)", month: 12, day: 24 },
      { name: "New Year's Eve (Special)", month: 12, day: 31 },
    ];

    // Easter-based holidays
    const easter = computeEasterSunday(y);
    const maundy = new Date(easter);
    maundy.setDate(easter.getDate() - 3);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);

    base.push({
      name: "Maundy Thursday",
      month: maundy.getMonth() + 1,
      day: maundy.getDate(),
    });
    base.push({
      name: "Good Friday",
      month: goodFriday.getMonth() + 1,
      day: goodFriday.getDate(),
    });

    // National Heroes Day -> last Monday in August
    const lastMonAug = lastMondayOfMonth(y, 7); // 0-based index (7 => Aug)
    base.push({
      name: "National Heroes Day",
      month: lastMonAug.getMonth() + 1,
      day: lastMonAug.getDate(),
    });

    base.sort((a, b) => a.month - b.month || a.day - b.day);
    return base;
  }

  const holidaysForYear = useMemo(() => getPhilippineHolidays(year), [year]);
  const holidaysForCurrentMonth = holidaysForYear.filter(
    (h) => h.month === currentDate.getMonth() + 1
  );

  // ---------------------
  // Menu handler
  // ---------------------
  function handleMenuSelect(name: string) {
    if (name === "Year") setViewMode("year");
    else if (name === "Month") setViewMode("month");
    else setSelectedMenu(name as "Schedule" | "Reminder");
    setMenuOpen(false);
  }

  // ---------------------
  // View mode state
  // ---------------------
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // ---------------------
  // Helpers
  // ---------------------
  const formattedSelectedDateForPlaceholder = () =>
    selectedDay ? `${selectedDay} ${monthName}` : `${todayDate} ${monthName}`;

  // ---------------------
  // JSX
  // ---------------------
  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      {/* MENU ICON top-right */}
      <button
        className="absolute z-[9999]"
        style={{ left: "1356px", top: "150px" }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Image src="/menu icon.svg" alt="Menu Icon" width={35} height={35} />
      </button>

      {/* POPUP MENU */}
      {menuOpen && (
        <div
          className="absolute z-[9999] flex flex-col p-3 shadow-lg"
          style={{
            left: "1150px",
            top: "250px",
            width: "217px",
            borderRadius: 25,
            backgroundColor: "#D2C8CA",
          }}
        >
          {[
            { name: "Year", icon: "/Calendar.svg" },
            { name: "Month", icon: "/Calendar.svg" },
            { name: "Schedule", icon: "/Schedule.svg" },
            { name: "Reminder", icon: "/Bellplus.svg" },
          ].map((item, index) => (
            <div
              key={item.name}
              onClick={() => handleMenuSelect(item.name)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md cursor-pointer ${
                ptSans.className
              } text-[17px] ${
                selectedMenu === item.name ? "bg-black/20" : "bg-transparent"
              }`}
              style={{ marginBottom: index !== 3 ? 2 : 0 }}
            >
              <Image src={item.icon} alt={item.name} width={40} height={40} />
              <span className="flex-1">{item.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="relative flex flex-col px-[66px] pt-[130px]">
        <h1
          className={`${montserrat.className} text-[#800000] text-[32px] font-extrabold`}
        >
          YOUR EVENT BOARD:
        </h1>

        {/* Calendar Section */}
        <div className="relative mt-[20px] w-[922px]">
          <Image
            src="/Calendar Box.svg"
            alt="Calendar Box"
            width={922}
            height={650}
            className="absolute top-0 left-0 -z-10 select-none"
          />

          {/* Header */}
          <div
            className={`${montserrat.className} flex justify-between items-center px-10 py-3 bg-[#800000] text-white text-[24px] font-semibold rounded-t-md`}
          >
            <button
              onClick={prevMonth}
              className="hover:text-[#FFD700] transition"
            >
              <ChevronLeft size={28} />
            </button>
            <span>{viewMode === "month" ? `${monthName} ${year}` : year}</span>
            <button
              onClick={nextMonth}
              className="hover:text-[#FFD700] transition"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Month weekdays header */}
          {viewMode === "month" && (
            <div
              className={`${ptSans.className} grid grid-cols-7 text-center font-bold text-gray-700 mt-3 text-[15px]`}
            >
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
          )}

          {/* Month grid */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-4 mt-3 px-6">
              {daysArray.map((day, index) => {
                const isToday = isCurrentMonth && day === todayDate;
                return (
                  <div
                    key={index}
                    className={`relative w-[85px] h-[85px] flex items-center justify-center ${
                      day ? "cursor-pointer" : "opacity-30"
                    }`}
                    onClick={() => day && setSelectedDay(day)}
                  >
                    {isToday && (
                      <div className="absolute inset-0 border-4 border-[#FFD700] rounded-md pointer-events-none" />
                    )}
                    <Image
                      src="/Date Box.svg"
                      alt="Date Box"
                      width={85}
                      height={85}
                      className="absolute top-0 left-0 select-none"
                    />
                    {day && (
                      <span
                        className={`${
                          ptSans.className
                        } text-[14px] font-bold absolute top-[8px] left-1/2 -translate-x-1/2 ${
                          selectedDay === day
                            ? "text-[#FFD700]"
                            : "text-[#800000]"
                        }`}
                      >
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Year view */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-4 p-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i}>
                  {/* reuse mini-month if desired */}
                  {/* You can integrate renderMiniMonth here if needed */}
                </div>
              ))}
            </div>
          )}

          {showAddEvent && (
            <>
              {/* Dim background over the calendar */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                onClick={() => setShowAddEvent(false)}
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

                {/* DATE PICKER FIRST */}
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

                {/* EVENT TITLE NEXT */}
                <div className="mb-4">
                  <label className="block text-lg font-semibold mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-yellow-400"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                {/* Audience Buttons */}
                <div className="flex gap-4 mb-4">
                  {["Global", "Course"].map((type) => (
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

                {/* Course Selector (only visible if Course chosen) */}
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

                {/* Event List */}
                <div className="flex-1 overflow-y-auto border-t border-gray-200 mt-4 pt-4">
                  <h3 className="font-semibold mb-2 text-lg">Posted Events</h3>
                  {postedEvents.length === 0 ? (
                    <p className="text-gray-500 italic">No events yet.</p>
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
                            setPostedEvents((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <span className="text-red-500 font-bold text-xl">
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
                    onClick={() => setShowAddEvent(false)}
                    className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!eventTitle.trim())
                        return alert("Please enter an event title");
                      if (audience === "Course" && !courseInput.trim())
                        return alert("Please select a course");
                      const newEvent = {
                        title: eventTitle,
                        course: courseInput,
                        audience,
                        date: selectedDate,
                      };
                      setPostedEvents((prev) => [...prev, newEvent]);
                      setEventTitle("");
                      setCourseInput("");
                    }}
                    className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500"
                  >
                    Post
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Floating Plus Button — outside the modal block */}
      <button
        onClick={() => setShowAddEvent(true)}
        className="fixed bottom-6 right-6 z-[99999] cursor-pointer bg-transparent"
      >
        <Image
          src="/Plus Sign.svg"
          alt="Add Event"
          width={103}
          height={101}
          className="pointer-events-none"
        />
      </button>

      {/* RIGHT-SIDE: Reminder Panel (fixed left: 1000px) */}
      {selectedMenu === "Reminder" && (
        <div
          className={`${ptSans.className} absolute`}
          style={{
            left: "1000px",
            top: "230px",
            width: "350px",
            height: "650px",
            backgroundColor: "#F4F4F4",
            borderRadius: "25px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-[18px] font-bold text-[#800000]">Reminders</h2>
            <div
              className="flex items-center justify-center rounded-full bg-[#800000] cursor-pointer hover:bg-[#A52A2A] transition"
              style={{ width: "43px", height: "40px" }}
              onClick={() => {
                if (newReminder.trim() !== "") {
                  setReminders((prev) => [...prev, newReminder]);
                  setNewReminder("");
                }
              }}
            >
              <Image
                src="/Bellplus.svg"
                alt="Bell Icon"
                width={30}
                height={30}
              />
            </div>
          </div>

          {/* date + all reminders */}
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <span className="text-[15px] text-gray-700 font-semibold">
              {selectedDay
                ? `${selectedDay} ${monthName.slice(0, 3)}`
                : `${todayDate} ${monthName.slice(0, 3)}`}
            </span>
            <div
              className="flex items-center justify-center text-[14px] font-semibold text-black rounded-full"
              style={{
                backgroundColor: "#D9D9D9",
                width: "120px",
                height: "26px",
              }}
            >
              All reminders
            </div>
          </div>

          {/* scrollable reminders list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {reminders.length === 0 ? (
              <div className="text-[14px] text-gray-500 italic">
                No reminders scheduled
              </div>
            ) : (
              reminders.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000]"
                >
                  <span className="truncate">{r}</span>
                  <button
                    onClick={() =>
                      setReminders((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-[#800000] hover:text-red-600 font-bold text-[16px] ml-2"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* add input pinned bottom */}
          <div
            className="flex items-center justify-between bg-[#D9D9D9] rounded-full px-3 mt-3 flex-shrink-0"
            style={{ width: "100%", height: "36px" }}
          >
            <input
              type="text"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              placeholder={`Add reminder on ${formattedSelectedDateForPlaceholder()}`}
              className="flex-1 text-[14px] text-gray-700 outline-none bg-transparent"
            />
            <button
              onClick={() => {
                if (newReminder.trim() !== "") {
                  setReminders((prev) => [...prev, newReminder]);
                  setNewReminder("");
                }
              }}
              className="flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition"
              style={{ width: 32, height: 32 }}
            >
              <Image
                src="/Bellplus.svg"
                alt="Add Reminder"
                width={18}
                height={18}
              />
            </button>
          </div>
        </div>
      )}

      {/* RIGHT-SIDE: Schedule Panel (styled like Reminder) */}
      {selectedMenu === "Schedule" && (
        <div
          className={`${ptSans.className} absolute`}
          style={{
            left: "1000px",
            top: "230px",
            width: "350px",
            height: "650px",
            backgroundColor: "#F4F4F4",
            borderRadius: "25px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-[18px] font-bold text-[#800000]">Schedule</h2>
            <div
              className="flex items-center justify-center rounded-full bg-[#800000] cursor-pointer hover:bg-[#A52A2A] transition"
              style={{ width: "43px", height: "40px" }}
              onClick={() => {
                const ev = prompt("Enter new event:");
                if (ev && ev.trim()) {
                  const dayToAdd = selectedDay || todayDate;
                  setPersonalEvents((prev) => [
                    ...prev,
                    {
                      name: ev.trim(),
                      year,
                      month: currentDate.getMonth() + 1,
                      day: dayToAdd,
                    },
                  ]);
                }
              }}
            >
              <Image
                src="/Bellplus.svg"
                alt="Add Event"
                width={30}
                height={30}
              />
            </div>
          </div>

          {/* Filter Tabs (Global, Personal, All) */}
          <div className="flex justify-evenly mb-4">
            {(["Global Events", "Personal Events", "All"] as const).map(
              (tab: "Global Events" | "Personal Events" | "All") => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`${montserrat.className} text-[13px] font-medium px-3 py-1 rounded-full relative`}
                  style={{
                    color: selectedFilter === tab ? "#000" : "#666",
                    backgroundColor:
                      selectedFilter === tab ? "#FFD700" : "#D9D9D9",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {/* Global Events */}
            {selectedFilter === "Global Events" &&
              (holidaysForCurrentMonth.length === 0 ? (
                <div className="text-[14px] text-gray-500 italic">
                  No global holidays this month.
                </div>
              ) : (
                holidaysForCurrentMonth.map((h, idx) => (
                  <div
                    key={`g-${idx}`}
                    className="flex items-center gap-3 bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000]"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span>
                      {h.day}{" "}
                      {new Date(year, h.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {h.name}
                    </span>
                  </div>
                ))
              ))}

            {/* Personal Events */}
            {selectedFilter === "Personal Events" &&
              (personalEvents.filter(
                (e) => e.year === year && e.month === currentDate.getMonth() + 1
              ).length === 0 ? (
                <div className="text-[14px] text-gray-500 italic">
                  No personal events added yet.
                </div>
              ) : (
                personalEvents
                  .filter(
                    (e) =>
                      e.year === year && e.month === currentDate.getMonth() + 1
                  )
                  .map((e, i) => (
                    <div
                      key={`p-${i}`}
                      className="flex items-center gap-3 bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000]"
                    >
                      <Image
                        src="/Calendar.svg"
                        alt="Calendar"
                        width={20}
                        height={20}
                      />
                      <span>
                        {e.day}{" "}
                        {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                          month: "short",
                        })}
                        : {e.name}
                      </span>
                    </div>
                  ))
              ))}

            {/* All Events */}
            {selectedFilter === "All" && (
              <>
                {holidaysForCurrentMonth.map((h, idx) => (
                  <div
                    key={`all-g-${idx}`}
                    className="flex items-center gap-3 bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000]"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span>
                      {h.day}{" "}
                      {new Date(year, h.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {h.name}
                    </span>
                  </div>
                ))}
                {personalEvents
                  .filter(
                    (e) =>
                      e.year === year && e.month === currentDate.getMonth() + 1
                  )
                  .map((e, i) => (
                    <div
                      key={`all-p-${i}`}
                      className="flex items-center gap-3 bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000]"
                    >
                      <Image
                        src="/Calendar.svg"
                        alt="Calendar"
                        width={20}
                        height={20}
                      />
                      <span>
                        {e.day}{" "}
                        {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                          month: "short",
                        })}
                        : {e.name}
                      </span>
                    </div>
                  ))}
              </>
            )}
          </div>
          {/* Add event row (only for Personal Events and All) */}
          {(selectedFilter === "Personal Events" ||
            selectedFilter === "All") && (
            <div className="mt-4 flex flex-col items-center space-y-2">
              {/* Input area */}
              <div className="flex items-center justify-between w-[90%] bg-gray-100 rounded-full px-4 py-2 text-gray-600 shadow-sm">
                <input
                  type="text"
                  placeholder={`Add event on ${
                    selectedDay
                      ? `${selectedDay} ${monthName.slice(0, 3)}`
                      : `${todayDate} ${monthName.slice(0, 3)}`
                  }`}
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="bg-transparent outline-none w-full text-[14px] text-gray-700"
                />

                <button
                  onClick={() => {
                    if (newEvent.trim() !== "") {
                      const dayToAdd = selectedDay || todayDate;
                      setPersonalEvents((prev) => [
                        ...prev,
                        {
                          name: newEvent.trim(),
                          year,
                          month: currentDate.getMonth() + 1,
                          day: dayToAdd,
                        },
                      ]);
                      setNewEvent("");
                    }
                  }}
                  className="p-1 hover:opacity-80 transition"
                >
                  <Image src="/Bellplus.svg" alt="Add" width={18} height={18} />
                </button>
              </div>

              {/* Display added events */}
              <div className="flex flex-col items-center w-full space-y-2">
                {personalEvents
                  .filter(
                    (ev) =>
                      ev.year === year &&
                      ev.month === currentDate.getMonth() + 1 &&
                      ev.day === (selectedDay || todayDate)
                  )
                  .map((ev, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between w-[90%] bg-gray-100 rounded-full px-4 py-2 text-maroon-800 shadow-sm"
                    >
                      <span className="text-[14px]">{ev.name}</span>
                      <button
                        onClick={() =>
                          setPersonalEvents((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-maroon-700 hover:text-maroon-900 font-bold text-[16px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
