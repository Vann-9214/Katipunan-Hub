export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (year: number, month: number) => {
  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const day = new Date(year, month, 1).getDay();
  // Adjust to make Monday index 0 (M T W T F S S)
  // If Sunday (0) -> return 6. Else return day - 1.
  return day === 0 ? 6 : day - 1;
};
