// supabase/Lib/Announcement/Filter/supabase-helper.ts

import { DateOption } from "@/app/component/General/Announcement/Utils/types";

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Generates an ISO string date range for Supabase queries
 * based on the filter option.
 *
 * @param option - The selected date filter option.
 * @returns An object with { startDate, endDate } or null.
 */
export function getDateRange(option: DateOption): DateRange | null {
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);

  switch (option) {
    case "Today":
      // Start of today
      startDate.setHours(0, 0, 0, 0);
      // End of today
      endDate.setHours(23, 59, 59, 999);
      break;

    case "This Week":
      // Assumes week starts on Sunday
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      startDate = firstDayOfWeek;
      endDate = lastDayOfWeek;
      break;

    case "This Month":
      // Start of the current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      // End of the current month
      // (Setting day to 0 of next month gives last day of current)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "All Time":
      // No date filter needed
      return null;

    default:
      return null;
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}