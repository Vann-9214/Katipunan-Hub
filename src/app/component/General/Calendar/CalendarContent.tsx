"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Montserrat, PT_Sans } from "next/font/google";
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
import BackgroundGradient from "@/app/component/ReusableComponent/BackgroundGradient";
import { Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type PanelType = "Schedule" | "Reminder";

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

  // --- STATE FOR MAXIMIZED VIEW ---
  const [maximizedPanel, setMaximizedPanel] = useState<PanelType | null>(null);

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
  const handleMaximizeToggle = useCallback((panel: PanelType | null) => {
    setMaximizedPanel(panel);
    if (panel) {
      setActivePanel(panel);
    }
  }, []);

  const handlePanelSwitch = useCallback((panel: PanelType) => {
    setMaximizedPanel(panel);
  }, []);

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

      const { data, error } = await supabase.from("Events").select("*");

      if (error) throw error;

      if (data) {
        const dbEvents = data as DBEvent[];

        // Filter Personal Events: Must match user ID
        const pEvents: PersonalEvent[] = dbEvents
          .filter((e) => e.audience === "Personal" && e.user_id === user.id)
          .map((e) => ({
            name: e.title,
            year: e.year,
            month: e.month,
            day: e.day,
          }));

        // Global events - show to everyone
        const gEvents: PostedEvent[] = dbEvents
          .filter((e) => e.audience === "Global")
          .map((e) => ({
            id: e.id,
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

  const handleDeletePostedEvent = async (eventId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from("Events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
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
      setMaximizedPanel(null);
    } else if (name === "Month") {
      setViewMode("month");
      setSelectedMenu("Month");
      setMaximizedPanel(null);
    } else if (name === "Schedule" || name === "Reminder") {
      setViewMode("month");
      setSelectedMenu(name as MenuType);
      setActivePanel(name as PanelType);
      setMaximizedPanel(null);
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

  const renderReminderPanel =
    activePanel === "Reminder" || maximizedPanel === "Reminder";
  const renderSchedulePanel =
    activePanel === "Schedule" || maximizedPanel === "Schedule";

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundGradient />

      <CalendarMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        selectedMenu={selectedMenu}
        viewMode={viewMode}
        onMenuSelect={handleMenuSelect}
      />

      {/* --- Main Content Area --- */}
      <div className="relative flex flex-col pt-[130px] w-full mx-auto px-4 md:px-8 pb-24 max-w-[1400px]">
        {/* --- Header & Controls --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          {/* Title Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-gradient-to-br from-[#8B0E0E] to-[#5e0a0a] rounded-2xl shadow-lg shadow-red-900/20 text-white">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h1
                className={`${montserrat.className} text-[28px] md:text-[32px] font-extrabold text-[#1a1a1a] leading-tight`}
              >
                Event Board
              </h1>
              <p
                className={`${ptSans.className} text-gray-500 font-medium text-sm md:text-base`}
              >
                Manage your academic schedule and reminders.
              </p>
            </div>
          </motion.div>

          {/* Controls Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-200/60"
          >
            {/* View Switcher Container */}
            <div className="relative flex items-center bg-gray-100/50 rounded-xl p-1 h-[44px]">
              {/* Sliding Background */}
              <motion.div
                className="absolute top-1 bottom-1 w-[50px] bg-white rounded-lg shadow-sm border border-black/5 z-0"
                initial={false}
                animate={{
                  x: viewMode === "month" ? 0 : 50,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />

              {/* Month Button */}
              <button
                onClick={() => handleMenuSelect("Month")}
                className={`relative z-10 w-[50px] h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
                  viewMode === "month"
                    ? "text-[#8B0E0E]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Month View"
              >
                <CalendarIcon size={18} />
              </button>

              {/* Year Button */}
              <button
                onClick={() => handleMenuSelect("Year")}
                className={`relative z-10 w-[50px] h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
                  viewMode === "year"
                    ? "text-[#8B0E0E]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Year View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* --- Content Flex Layout --- */}
        <div
          // UPDATED: Changed gap-8 to gap-12 for more separation
          className={`flex flex-col gap-12 w-full mx-auto transition-all duration-300 ${
            maximizedPanel
              ? "max-w-[1600px] lg:flex-row"
              : "max-w-[1400px] lg:flex-row"
          }`}
        >
          {/* Calendar View */}
          <div
            className={`w-full transition-all duration-300 ${
              maximizedPanel ? "lg:w-1/2" : "lg:w-2/3"
            }`}
          >
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

          {/* Side Panels (Schedule / Reminders) */}
          <div
            className={`w-full transition-all duration-300 ${
              maximizedPanel ? "lg:w-1/2" : "lg:w-1/3"
            }`}
          >
            {viewMode === "month" &&
              renderReminderPanel &&
              !isScheduleMaximized && (
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
                  isMaximized={isReminderMaximized}
                  onMaximizeToggle={handleMaximizeToggle}
                  currentMaximizedPanel={maximizedPanel as PanelType}
                  onPanelSwitch={handlePanelSwitch}
                />
              )}

            {viewMode === "month" &&
              renderSchedulePanel &&
              !isReminderMaximized && (
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
                  isMaximized={isScheduleMaximized}
                  onMaximizeToggle={handleMaximizeToggle}
                  currentMaximizedPanel={maximizedPanel as PanelType}
                  onPanelSwitch={handlePanelSwitch}
                />
              )}
          </div>
        </div>
      </div>

      {/* Add Event Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddEvent(true)}
        className="fixed bottom-8 right-8 z-[50]"
      >
        <div className="relative w-[80px] h-[80px] drop-shadow-2xl">
          <Image
            src="/Plus Sign.svg"
            alt="Add Event"
            fill
            className="object-contain"
          />
        </div>
      </motion.button>

      <EventModal
        showAddEvent={showAddEvent}
        setShowAddEvent={setShowAddEvent}
        onEventAdded={fetchEvents}
      />
    </div>
  );
}
