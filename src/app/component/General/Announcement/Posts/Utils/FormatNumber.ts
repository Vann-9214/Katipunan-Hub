// utils/formatNumber.ts

/**
 * Formats a number into a compact, human-readable string.
 * - 999 -> "999"
 * - 1000 -> "1k"
 * - 1500 -> "1.5k"
 * - 1000000 -> "1m"
 * @param num The number to format.
 * @returns A formatted string.
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (!num) {
    return "0";
  }

  // Return the number as is if it's less than 1000
  if (num < 1000) {
    return num.toString();
  }

  // Use the Intl.NumberFormat API for compact notation
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1, // Ensures "1.5k" instead of "1k"
  });

  // Format and convert "1.5K" to "1.5k"
  return formatter.format(num).toLowerCase();
}