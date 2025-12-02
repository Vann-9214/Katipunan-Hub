// CalendarContent.tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import {
  Holiday,
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

type PanelType = "Schedule" | "Reminder"; // Define this type consistently

export default function CalendarContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---------------------
  // Core UI state
  // ---------------------
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuType>("Reminder");
  const [activePanel, setActivePanel] = useState<PanelType>("Reminder");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // --- NEW STATE FOR MAXIMIZED VIEW ---
  // Tracks which panel is currently taking up the full maximized screen
  const [maximizedPanel, setMaximizedPanel] = useState<PanelType | null>(null);
  // ------------------------------------

  // ---------------------
  // Data state
  // ---------------------
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState("");
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [postedEvents, setPostedEvents] = useState<PostedEvent[]>([]);

  // ---------------------
  // Maximization Handlers
  // ---------------------

  // Handler for the maximize/minimize buttons within the panels
  const handleMaximizeToggle = useCallback((panel: PanelType | null) => {
    setMaximizedPanel(panel);
    // If maximizing, ensure the calendar view switches to the corresponding panel
    if (panel) {
      setActivePanel(panel);
    }
  }, []);

  // Handler for the internal toggle switch (only used when a panel is maximized)
  const handlePanelSwitch = useCallback((panel: PanelType) => {
    setMaximizedPanel(panel);
  }, []);
  
  // Logic to determine if a panel is currently maximized
  const isScheduleMaximized = maximizedPanel === "Schedule";
  const isReminderMaximized = maximizedPanel === "Reminder";

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
      const isUserAdmin = role.includes("Platform Administrator");
      setIsAdmin(isUserAdmin);

      const userCourse = user.course || "";

      let query = supabase.from("Events").select("*");

      if (!isUserAdmin) {
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
            if (isUserAdmin) return true;
            if (!e.courses || e.courses.length === 0) return true;
            return e.courses.includes(userCourse);
          })
          .map((e) => ({
            id: e.id, // Include ID for deletion
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

  // Handle delete posted event (admin only)
  const handleDeletePostedEvent = async (eventId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from("Events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      // Optimistically update UI
      setPostedEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
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
      setViewMode("year");
      setSelectedMenu("Year");
      setMaximizedPanel(null); // Minimize any maximized panel
    } else if (name === "Month") {
      setViewMode("month");
      setSelectedMenu("Month");
      setMaximizedPanel(null); // Minimize any maximized panel
    } else if (name === "Schedule" || name === "Reminder") {
      setViewMode("month");
      setSelectedMenu(name as MenuType);
      setActivePanel(name as PanelType);
      setMaximizedPanel(null); // Minimize any maximized panel
    }
  }

  function handleMonthClick(monthIndex: number) {
    setCurrentDate(new Date(year, monthIndex, 1));
    setViewMode("month");
    setSelectedMenu(activePanel);
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  // --- CONDITIONAL RENDERING LOGIC ---
  const renderReminderPanel =
    activePanel === "Reminder" || maximizedPanel === "Reminder";
  const renderSchedulePanel =
    activePanel === "Schedule" || maximizedPanel === "Schedule";
    
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

      <CalendarMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        selectedMenu={selectedMenu}
        viewMode={viewMode}
        onMenuSelect={handleMenuSelect}
      />

      <div className="relative flex flex-col px-[66px] pt-[130px]">
        {/* Header content... */}
        <div className="flex items-center gap-4 mb-6">
          <div className="shadow-lg rounded-2xl">
            <Image
              src="/calendar icon.svg"
              alt="Calendar"
              width={65}
              height={65}
            />
          </div>
          
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

      <EventModal
        showAddEvent={showAddEvent}
        setShowAddEvent={setShowAddEvent}
        onEventAdded={fetchEvents}
      />

      {/* --- Conditional Panel Rendering --- */}

      {/* Only render ReminderPanel if it is the active panel AND NOT the Schedule maximized panel */}
      {renderReminderPanel && !isScheduleMaximized && (
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
          isAdmin={isAdmin}
          onDeletePostedEvent={handleDeletePostedEvent}
          setPersonalEvents={setPersonalEvents}
          
          // CRITICAL: Maximization Props
          isMaximized={isReminderMaximized}
          onMaximizeToggle={handleMaximizeToggle}
          currentMaximizedPanel={maximizedPanel as PanelType}
          onPanelSwitch={handlePanelSwitch}
        />
      )}

      {/* Only render SchedulePanel if it is the active panel AND NOT the Reminder maximized panel */}
      {renderSchedulePanel && !isReminderMaximized && (
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
          isAdmin={isAdmin}
          onDeletePostedEvent={handleDeletePostedEvent}
          
          // CRITICAL: Maximization Props
          isMaximized={isScheduleMaximized}
          onMaximizeToggle={handleMaximizeToggle}
          currentMaximizedPanel={maximizedPanel as PanelType}
          onPanelSwitch={handlePanelSwitch}
        />
      )}
    </div>
  );
}