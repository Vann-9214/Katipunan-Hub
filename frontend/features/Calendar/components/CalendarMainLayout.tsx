"use client";

import React from "react";
import CalendarViews from "./CalendarViews";
import ReminderPanel from "./ReminderPanel";
import SchedulePanel from "./SchedulePanel";
import type { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import type { useCalendarEvents } from "../hooks/useCalendarEvents";

interface CalendarMainLayoutProps {
  nav: ReturnType<typeof useCalendarNavigation>;
  events: ReturnType<typeof useCalendarEvents>;
  reminders: string[];
  setReminders: React.Dispatch<React.SetStateAction<string[]>>;
  newReminder: string;
  setNewReminder: React.Dispatch<React.SetStateAction<string>>;
}

export default function CalendarMainLayout({
  nav,
  events,
  reminders,
  setReminders,
  newReminder,
  setNewReminder,
}: CalendarMainLayoutProps) {
  return (
    <div
      className={`flex flex-col gap-12 w-full mx-auto transition-all duration-300 ${
        nav.maximizedPanel
          ? "max-w-[1600px] lg:flex-row"
          : "max-w-[1400px] lg:flex-row"
      }`}
    >
      {/* Calendar View */}
      <div
        className={`w-full transition-all duration-300 ${
          nav.maximizedPanel ? "lg:w-1/2" : "lg:w-2/3"
        }`}
      >
        <CalendarViews
          viewMode={nav.viewMode}
          currentDate={nav.currentDate}
          year={nav.year}
          monthName={nav.monthName}
          daysArray={nav.daysArray}
          holidaysForCurrentMonth={nav.holidaysForCurrentMonth}
          holidaysForYear={nav.holidaysForYear}
          personalEvents={events.personalEvents}
          postedEvents={events.postedEvents}
          selectedDay={nav.selectedDay}
          todayDate={nav.todayDate}
          isCurrentMonth={nav.isCurrentMonth}
          onPrevMonth={nav.prevMonth}
          onNextMonth={nav.nextMonth}
          onDayClick={nav.setSelectedDay}
          onMonthClick={nav.handleMonthClick}
        />
      </div>

      {/* Side Panels (Schedule / Reminders) */}
      <div
        className={`w-full transition-all duration-300 ${
          nav.maximizedPanel ? "lg:w-1/2" : "lg:w-1/3"
        }`}
      >
        {nav.viewMode === "month" &&
          nav.renderReminderPanel &&
          !nav.isScheduleMaximized && (
            <ReminderPanel
              reminders={reminders}
              setReminders={setReminders}
              newReminder={newReminder}
              setNewReminder={setNewReminder}
              selectedDay={nav.selectedDay}
              monthName={nav.monthName}
              todayDate={nav.todayDate}
              year={nav.year}
              currentMonth={nav.currentDate.getMonth()}
              postedEvents={events.postedEvents}
              personalEvents={events.personalEvents}
              holidays={nav.holidaysForCurrentMonth}
              isAdmin={events.isAdmin}
              onDeletePostedEvent={events.handleDeletePostedEvent}
              setPersonalEvents={events.setPersonalEvents}
              isMaximized={nav.isReminderMaximized}
              onMaximizeToggle={nav.handleMaximizeToggle}
              currentMaximizedPanel={nav.maximizedPanel!}
              onPanelSwitch={nav.handlePanelSwitch}
            />
          )}

        {nav.viewMode === "month" &&
          nav.renderSchedulePanel &&
          !nav.isReminderMaximized && (
            <SchedulePanel
              holidaysForCurrentMonth={nav.holidaysForCurrentMonth}
              personalEvents={events.personalEvents}
              setPersonalEvents={events.setPersonalEvents}
              postedEvents={events.postedEvents}
              year={nav.year}
              currentMonth={nav.currentDate.getMonth()}
              selectedDay={nav.selectedDay}
              todayDate={nav.todayDate}
              monthName={nav.monthName}
              isAdmin={events.isAdmin}
              onDeletePostedEvent={events.handleDeletePostedEvent}
              isMaximized={nav.isScheduleMaximized}
              onMaximizeToggle={nav.handleMaximizeToggle}
              currentMaximizedPanel={nav.maximizedPanel!}
              onPanelSwitch={nav.handlePanelSwitch}
            />
          )}
      </div>
    </div>
  );
}
