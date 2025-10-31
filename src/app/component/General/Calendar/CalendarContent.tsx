"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Montserrat, PT_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Holiday, PostedEvent, PersonalEvent, MenuType } from "@/app/component/General/Calendar/types";
import EventModal from "@/app/component/General/Calendar/EventModal";
import ReminderPanel from "@/app/component/General/Calendar/ReminderPanel";
import SchedulePanel from "@/app/component/General/Calendar/SchedulePanel";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function CalendarContent() {
  // ---------------------
  // Core UI state
  // ---------------------
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuType>("Reminder");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // ---------------------
  // Data state
  // ---------------------
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [postedEvents, setPostedEvents] = useState<PostedEvent[]>([]);

  // ---------------------
  // Calendar helpers
  // ---------------------
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
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  function lastMondayOfMonth(y: number, month0Based: number) {
    const lastDay = new Date(y, month0Based + 1, 0);
    const dayOfWeek = lastDay.getDay();
    const offset = (dayOfWeek + 6) % 7;
    const lastMonday = new Date(y, month0Based + 1, 0 - offset);
    return lastMonday;
  }

  function getPhilippineHolidays(y: number): Holiday[] {
    const base: Holiday[] = [
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Araw ng Kagitingan", month: 4, day: 9 },
      { name: "Labor Day", month: 5, day: 1 },
      { name: "Independence Day", month: 6, day: 12 },
      { name: "Ninoy Aquino Day", month: 8, day: 21 },
      { name: "All Saints' Day", month: 11, day: 1 },
      { name: "Bonifacio Day", month: 11, day: 30 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "Rizal Day", month: 12, day: 30 },
      { name: "Christmas Eve", month: 12, day: 24 },
      { name: "New Year's Eve", month: 12, day: 31 },
    ];

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

    const lastMonAug = lastMondayOfMonth(y, 7);
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
    else setSelectedMenu(name as MenuType);
    setMenuOpen(false);
  }

  // ---------------------
  // Helpers for calendar day rendering
  // ---------------------
  const getEventLabel = (ev: any): string => {
    if (!ev) return "";
    if (typeof ev === "string") return ev;
    if ("title" in ev && ev.title) return String(ev.title);
    if ("name" in ev && ev.name) return String(ev.name);
    return String(ev.title ?? ev.name ?? "");
  };
const getEventColor = (label: string) => {
  const colors = ["#C4E1A4", "#FAD6A5", "#A0D8EF", "#F6B6B6", "#D9B3FF"];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

  // ---------------------
  // JSX
  // ---------------------
  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      {/* MENU ICON */}
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
            <span>
              {viewMode === "month" ? `${monthName} ${year}` : year}
            </span>
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
                if (!day) {
                  return (
                    <div key={index} className="w-[85px] h-[85px] opacity-30" />
                  );
                }

                const isToday = isCurrentMonth && day === todayDate;

                // Find holidays and events for this day
                const dayHolidays = holidaysForCurrentMonth.filter(
                  (h) => h.day === day
                );
                const dayEvents = [
                  ...personalEvents.filter(
                    (e) =>
                      e.year === year &&
                      e.month === currentDate.getMonth() + 1 &&
                      e.day === day
                  ),
                  ...postedEvents.filter((e) => {
                    const isSameDate =
                      e.year === year &&
                      e.month === currentDate.getMonth() + 1 &&
                      e.day === day;
                    if (!isSameDate) return false;
                    return e.audience === "Global" || e.audience === "Course";
                  }),
                ];

                return (
                  <div
                    key={index}
                    className={`relative w-[85px] h-[85px] flex flex-col items-center p-1 cursor-pointer`}
                    onClick={() => setSelectedDay(day)}
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
                    <span
                      className={`${
                        ptSans.className
                      } text-[14px] font-bold absolute top-[6px] left-1/2 -translate-x-1/2 ${
                        selectedDay === day
                          ? "text-[#FFD700]"
                          : "text-[#800000]"
                      }`}
                    >
                      {day}
                    </span>

                    {/* Events inside box */}
                    <div className="absolute top-[25px] w-[75px] h-[50px] flex flex-col gap-[2px] overflow-hidden">
                      {[...dayHolidays, ...dayEvents].map((event, i) => (
                        <div
                          key={i}
                          className="text-[10px] text-center rounded-md px-[2px] py-[1px] text-black truncate"
                          style={{ backgroundColor: getEventColor(getEventLabel(event)) }}

                        >
                          {getEventLabel(event)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Year view */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-4 p-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="text-center text-gray-500">
                  {new Date(year, i).toLocaleString("default", {
                    month: "long",
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Plus Button */}
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

      {/* Event Modal */}
      <EventModal
        showAddEvent={showAddEvent}
        setShowAddEvent={setShowAddEvent}
        postedEvents={postedEvents}
        setPostedEvents={setPostedEvents}
      />

      {/* Reminder Panel */}
      {selectedMenu === "Reminder" && (
        <ReminderPanel
          reminders={reminders}
          setReminders={setReminders}
          newReminder={newReminder}
          setNewReminder={setNewReminder}
          selectedDay={selectedDay}
          monthName={monthName}
          todayDate={todayDate}
          year={year}
          currentMonth={currentDate.getMonth()}
          postedEvents={postedEvents}
          personalEvents={personalEvents}
          holidays={holidaysForCurrentMonth}
        />
      )}

      {/* Schedule Panel */}
      {selectedMenu === "Schedule" && (
        <SchedulePanel
          holidaysForCurrentMonth={holidaysForCurrentMonth}
          personalEvents={personalEvents}
          setPersonalEvents={setPersonalEvents}
          postedEvents={postedEvents}
          year={year}
          currentMonth={currentDate.getMonth()}
          selectedDay={selectedDay}
          todayDate={todayDate}
          monthName={monthName}
        />
      )}
    </div>
  );
}