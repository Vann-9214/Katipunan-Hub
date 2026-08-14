function formatPostDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // ---- Cases ----
  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24 && isToday)
    return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (isYesterday)
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;

  // ---- Default: Show full date ----
  return date.toLocaleString("en-US", {
    month: "long", // October
    day: "numeric", // 24
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default formatPostDate;