"use client";

import { useState, useMemo, useCallback } from "react";
import { MenuType } from "../types";
import { getPhilippineHolidays } from "../utils/calendarUtils";

export type PanelType = "Schedule" | "Reminder";

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuType>("Reminder");
  const [activePanel, setActivePanel] = useState<PanelType>("Reminder");
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [maximizedPanel, setMaximizedPanel] = useState<PanelType | null>(null);

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

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const prevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === currentDate.getMonth();
  const todayDate = today.getDate();

  const daysArray = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - firstDay + 1;
      return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
    });
  }, [firstDay, daysInMonth]);

  const holidaysForYear = useMemo(() => getPhilippineHolidays(year), [year]);
  const holidaysForCurrentMonth = useMemo(() => {
    return holidaysForYear.filter(
      (h) => h.month === currentDate.getMonth() + 1
    );
  }, [holidaysForYear, currentDate]);

  const handleMenuSelect = useCallback((name: string) => {
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
  }, []);

  const handleMonthClick = useCallback((monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setViewMode("month");
    setSelectedMenu(activePanel);
  }, [year, activePanel]);

  const renderReminderPanel =
    activePanel === "Reminder" || maximizedPanel === "Reminder";
  const renderSchedulePanel =
    activePanel === "Schedule" || maximizedPanel === "Schedule";

  return {
    currentDate,
    setCurrentDate,
    selectedDay,
    setSelectedDay,
    menuOpen,
    setMenuOpen,
    selectedMenu,
    activePanel,
    viewMode,
    maximizedPanel,
    isScheduleMaximized,
    isReminderMaximized,
    renderReminderPanel,
    renderSchedulePanel,
    monthName,
    year,
    todayDate,
    isCurrentMonth,
    daysArray,
    holidaysForYear,
    holidaysForCurrentMonth,
    prevMonth,
    nextMonth,
    handleMaximizeToggle,
    handlePanelSwitch,
    handleMenuSelect,
    handleMonthClick,
  };
}
