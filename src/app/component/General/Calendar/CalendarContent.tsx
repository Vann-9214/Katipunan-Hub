"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import {
  PostedEvent,
  PersonalEvent,
  MenuType,
  DBEvent,
} from "@/app/component/General/Calendar/types";
import EventModal from "@/app/component/General/Calendar/EventModal";
import ReminderPanel from "@/app/component/General/Calendar/ReminderPanel";
import SchedulePanel from "@/app/component/General/Calendar/SchedulePanel";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import CalendarMenu from "@/app/component/General/Calendar/CalendarMenu";
import CalendarViews from "@/app/component/General/Calendar/CalendarViews";
import { getPhilippineHolidays } from "@/app/component/General/Calendar/calendarUtils";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export default function CalendarContent() {
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------
  // Core UI state
  // ---------------------
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // selectedMenu can be "Reminder", "Schedule", "Year", or "Month"
  // But we track the panel separately to keep it visible
  const [selectedMenu, setSelectedMenu] = useState<MenuType>("Reminder");
  // Track which panel should be displayed (Reminder or Schedule)
  const [activePanel, setActivePanel] = useState<"Reminder" | "Schedule">(
    "Reminder"
  );
  const [showAddEvent, setShowAddEvent] = useState(false);
  // This controls the calendar view (month/year)
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // ---------------------
  // Data state
  // ---------------------
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [postedEvents, setPostedEvents] = useState<PostedEvent[]>([]);

  // ---------------------
  // Fetching Logic
  // ---------------------
  const fetchEvents = async () => {
    try {
      const user = await getCurrentUserDetails();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const role = user.role || "";
      const isAdmin = role.includes("Platform Administrator");
      const userCourse = user.course || "";

      let query = supabase.from("Events").select("*");

      if (!isAdmin) {
        query = query.or(`user_id.eq.${user.id},audience.eq.Global`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const dbEvents = data as DBEvent[];

        const pEvents: PersonalEvent[] = dbEvents
          .filter((e) => e.audience === "Personal" && e.user_id === user.id)
          .map((e) => ({
            name: e.title,
            year: e.year,
            month: e.month,
            day: e.day,
          }));

        const gEvents: PostedEvent[] = dbEvents
          .filter((e) => {
            if (e.audience !== "Global") return false;
            if (isAdmin) return true;
            if (!e.courses || e.courses.length === 0) return true;
            return e.courses.includes(userCourse);
          })
          .map((e) => ({
            title: e.title,
            course:
              e.courses && e.courses.length > 0
                ? e.courses.join(", ")
                : "All Courses",
            audience: "Global",
            year: e.year,
            month: e.month,
            day: e.day,
            date: e.date,
          }));

        setPersonalEvents(pEvents);
        setPostedEvents(gEvents);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("events-calendar-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Events" },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const holidaysForYear = useMemo(() => getPhilippineHolidays(year), [year]);
  const holidaysForCurrentMonth = holidaysForYear.filter(
    (h) => h.month === currentDate.getMonth() + 1
  );

  function handleMenuSelect(name: string) {
    if (name === "Year") {
      // Change view mode to year, keep the current panel
      setViewMode("year");
      setSelectedMenu("Year");
    } else if (name === "Month") {
      // Change view mode to month, keep the current panel
      setViewMode("month");
      setSelectedMenu("Month");
    } else if (name === "Schedule" || name === "Reminder") {
      // Change the active panel and switch to month view
      setViewMode("month");
      setSelectedMenu(name as MenuType);
      setActivePanel(name as "Reminder" | "Schedule");
    }
  }

  function handleMonthClick(monthIndex: number) {
    setCurrentDate(new Date(year, monthIndex, 1));
    setViewMode("month");
    setSelectedMenu(activePanel); // Set menu back to the active panel
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/backgroundimage.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Menu Component */}
      <CalendarMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        selectedMenu={selectedMenu}
        viewMode={viewMode}
        onMenuSelect={handleMenuSelect}
      />

      <div className="relative flex flex-col px-[66px] pt-[130px]">
        {/* Header Section with Icon */}
        <div className="flex items-center gap-4 mb-6">
          {/* Calendar Icon with Shadow - No Background */}
          <div className="shadow-lg rounded-2xl">
            <Image
              src="/calendar icon.svg"
              alt="Calendar"
              width={65}
              height={65}
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <h1
              className={`${montserrat.className} text-[#800000] text-[32px] font-extrabold leading-tight`}
            >
              Event Board
            </h1>
            <p className="text-gray-600 text-[16px] mt-1">
              Everything you need to stay on top of your schedule.
            </p>
          </div>
        </div>

        {/* Calendar Views Component */}
        <CalendarViews
          viewMode={viewMode}
          currentDate={currentDate}
          year={year}
          monthName={monthName}
          daysArray={daysArray}
          holidaysForCurrentMonth={holidaysForCurrentMonth}
          holidaysForYear={holidaysForYear}
          personalEvents={personalEvents}
          postedEvents={postedEvents}
          selectedDay={selectedDay}
          todayDate={todayDate}
          isCurrentMonth={isCurrentMonth}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onDayClick={setSelectedDay}
          onMonthClick={handleMonthClick}
        />
      </div>

      {/* Add Event Button */}
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
        onEventAdded={fetchEvents}
      />

      {/* Reminder Panel - Only visible in month view when Reminder is the active panel */}
      {viewMode === "month" && activePanel === "Reminder" && (
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

      {/* Schedule Panel - Only visible in month view when Schedule is the active panel */}
      {viewMode === "month" && activePanel === "Schedule" && (
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
