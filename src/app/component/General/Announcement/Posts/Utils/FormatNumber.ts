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

  if (num < 1000) {
    return num.toString();
  }

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1, 
  });

  return formatter.format(num).toLowerCase();
}