// Shared types for Calendar components

export type Holiday = {
  name: string;
  month: number;
  day: number;
};

export type PostedEvent = {
  title: string;
  course: string;
  audience: string;
  year: number;
  month: number;
  day: number;
  date?: string;
};

export type PersonalEvent = {
  name: string;
  year: number;
  month: number;
  day: number;
};

export type FilterType = "Global Events" | "Personal Events" | "All";

export type MenuType = "Reminder" | "Schedule" | "Year" | "Month";