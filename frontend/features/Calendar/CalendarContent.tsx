"use client";

import React, { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";
import CalendarMenu from "./components/CalendarMenu";
import CalendarHeader from "./components/CalendarHeader";
import CalendarMainLayout from "./components/CalendarMainLayout";
import AddEventFloatingButton from "./components/AddEventFloatingButton";
import EventModal from "./components/EventModal";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";

export default function CalendarContent() {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState("");

  const events = useCalendarEvents();
  const nav = useCalendarNavigation();

  if (events.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundGradient />

      <CalendarMenu
        menuOpen={nav.menuOpen}
        setMenuOpen={nav.setMenuOpen}
        selectedMenu={nav.selectedMenu}
        viewMode={nav.viewMode}
        onMenuSelect={nav.handleMenuSelect}
      />

      <main className="relative flex flex-col pt-[130px] w-full mx-auto px-4 md:px-8 pb-24 max-w-[1400px]">
        <CalendarHeader
          viewMode={nav.viewMode}
          onViewModeChange={nav.handleMenuSelect}
        />

        <CalendarMainLayout
          nav={nav}
          events={events}
          reminders={reminders}
          setReminders={setReminders}
          newReminder={newReminder}
          setNewReminder={setNewReminder}
        />
      </main>

      <AddEventFloatingButton onClick={() => setShowAddEvent(true)} />

      <EventModal
        showAddEvent={showAddEvent}
        setShowAddEvent={setShowAddEvent}
        onEventAdded={events.fetchEvents}
      />
    </div>
  );
}
