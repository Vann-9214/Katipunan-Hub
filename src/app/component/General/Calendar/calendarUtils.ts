import { Holiday } from "@/app/component/General/Calendar/types";

// ---------------------
// Easter Calculation
// ---------------------
export function computeEasterSunday(y: number): Date {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

// ---------------------
// Last Monday of Month
// ---------------------
export function lastMondayOfMonth(y: number, month0Based: number) {
  const lastDay = new Date(y, month0Based + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const offset = (dayOfWeek + 6) % 7;
  const lastMonday = new Date(y, month0Based + 1, 0 - offset);
  return lastMonday;
}

// ---------------------
// Philippine Holidays
// ---------------------
export function getPhilippineHolidays(y: number): Holiday[] {
  const base: Holiday[] = [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Araw ng Kagitingan", month: 4, day: 9 },
    { name: "Labor Day", month: 5, day: 1 },
    { name: "Independence Day", month: 6, day: 12 },
    { name: "Ninoy Aquino Day", month: 8, day: 21 },
    { name: "All Saints' Day", month: 11, day: 1 },
    { name: "Bonifacio Day", month: 11, day: 30 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Rizal Day", month: 12, day: 30 },
    { name: "Christmas Eve", month: 12, day: 24 },
    { name: "New Year's Eve", month: 12, day: 31 },
  ];

  const easter = computeEasterSunday(y);
  const maundy = new Date(easter);
  maundy.setDate(easter.getDate() - 3);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  base.push({
    name: "Maundy Thursday",
    month: maundy.getMonth() + 1,
    day: maundy.getDate(),
  });
  base.push({
    name: "Good Friday",
    month: goodFriday.getMonth() + 1,
    day: goodFriday.getDate(),
  });

  const lastMonAug = lastMondayOfMonth(y, 7);
  base.push({
    name: "National Heroes Day",
    month: lastMonAug.getMonth() + 1,
    day: lastMonAug.getDate(),
  });

  base.sort((a, b) => a.month - b.month || a.day - b.day);
  return base;
}

// ---------------------
// Event Helpers
// ---------------------
type CalendarEvent = {
  title?: string;
  name?: string;
} | string | null | undefined;

export const getEventLabel = (ev: CalendarEvent): string => {
  if (!ev || typeof ev === "string") return String(ev ?? "");
  if ("title" in ev && ev.title) return String(ev.title);
  if ("name" in ev && ev.name) return String(ev.name);
  return "";
};

export const getEventColor = (event: CalendarEvent, index: number) => {
  const colors = ["#C4E1A4", "#FAD6A5", "#A0D8EF", "#F6B6B6", "#D9B3FF"];
  const label = getEventLabel(event);
  const hash = label
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[(hash + index) % colors.length];
};