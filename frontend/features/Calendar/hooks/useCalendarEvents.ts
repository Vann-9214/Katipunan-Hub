"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import {
  getEvents,
  deleteEvent,
  subscribeToEvents,
  DBEvent,
} from "@/database/supabase/Calendar";
import type { PersonalEvent, PostedEvent } from "../types";

export function useCalendarEvents() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [postedEvents, setPostedEvents] = useState<PostedEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const user = await getCurrentUserDetails();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const role = user.role || "";
      const isUserAdmin = role.includes("Platform Administrator");
      setIsAdmin(isUserAdmin);

      const { data, error } = await getEvents();
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
  }, []);

  const handleDeletePostedEvent = useCallback(
    async (eventId: string) => {
      if (!isAdmin) return;

      try {
        const { error } = await deleteEvent(eventId);
        if (error) throw error;
        setPostedEvents((prev) => prev.filter((e) => e.id !== eventId));
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event. Please try again.");
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    fetchEvents();
    const unsubscribe = subscribeToEvents(() => {
      fetchEvents();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchEvents]);

  return {
    isLoading,
    isAdmin,
    personalEvents,
    setPersonalEvents,
    postedEvents,
    setPostedEvents,
    fetchEvents,
    handleDeletePostedEvent,
  };
}
