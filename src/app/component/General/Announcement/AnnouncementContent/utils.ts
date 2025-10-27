// AnnouncementPageContent/utils.ts
import { type DBPostRow, PostUI } from "../Utils/types";

export function formatDateWithAmPm(ts: string | null | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mins} ${ampm}`;
}

// Helper to shape a DB record into the UI post object
export const shapePostForUI = (r: DBPostRow | null): PostUI | null => {
  if (!r) return null;
  return {
    id: r.id,
    title: r.title ?? "",
    description: r.description ?? "",
    date: formatDateWithAmPm(r.created_at ?? r.createdAt ?? null),
    images: Array.isArray(r.images) ? r.images : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    type:
      r.type === "announcement" || r.type === "highlight"
        ? (r.type as "announcement" | "highlight")
        : "announcement",
    visibility: r.visibility ?? null,
    author_id: r.author_id ?? undefined,
    created_at: r.created_at ?? null,
  };
};