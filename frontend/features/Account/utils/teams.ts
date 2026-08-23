/**
 * Helper utilities for Microsoft Teams integration in the Account feature
 */

export function getTeamsEmail(email?: string, fullName?: string): string {
  if (email) return email;
  if (!fullName) return "";
  return `${fullName.toLowerCase().replace(/\s+/g, ".")}@cit.edu`;
}

export function getTeamsChatUrl(email: string): string {
  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`;
}
