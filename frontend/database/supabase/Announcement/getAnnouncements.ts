import { supabase } from "../General/supabaseClient";
import type { DBPostRow, FilterState } from "@/features/Announcement/utils/types";
import { getDateRange } from "./getDateRange";

const VISIBILITY = {
  GLOBAL: "global",
};

/**
 * Fetches announcements from the Posts table based on applied filters and user college code.
 */
export async function getAnnouncements(
  currentFilters: FilterState,
  userCollegeCode: string | null
): Promise<{ data: DBPostRow[] | null; error: any }> {
  try {
    let query = supabase
      .from("Posts")
      .select("*")
      .eq("type", "announcement");

    // Apply Date Range Filter
    const dateRange = getDateRange(currentFilters.date);
    if (dateRange) {
      query = query.gte("created_at", dateRange.startDate);
      query = query.lte("created_at", dateRange.endDate);
    }

    // Apply Visibility Filter
    if (currentFilters.visibility === "Global") {
      query = query.eq("visibility", VISIBILITY.GLOBAL);
    } else if (currentFilters.visibility === "Course" && userCollegeCode) {
      query = query.eq("visibility", userCollegeCode);
    }

    if (userCollegeCode) {
      query = query.or(
        `visibility.eq.${VISIBILITY.GLOBAL},visibility.eq.${userCollegeCode},visibility.is.null`
      );
    } else {
      query = query.or(
        `visibility.eq.${VISIBILITY.GLOBAL},visibility.is.null`
      );
    }

    const isAscending = currentFilters.sort === "Oldest First";
    query = query.order("created_at", { ascending: isAscending });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching announcements:", error);
      return { data: null, error };
    }

    return { data: (data as DBPostRow[]) || [], error: null };
  } catch (err) {
    console.error("Unexpected error fetching announcements:", err);
    return { data: null, error: err };
  }
}
