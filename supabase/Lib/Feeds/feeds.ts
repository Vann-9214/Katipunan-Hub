import { FeedPost, PLCHighlight } from "./types";
import { MOCK_FEEDS, MOCK_PLC_HIGHLIGHTS } from "../mockData";

// In-memory feed posts for UI demonstration
let inMemoryFeeds: FeedPost[] = [...MOCK_FEEDS];

// --- 1. Fetch General Feeds (UI Mode with in-memory persistence) ---
export async function getFeeds(
  page = 0,
  limit = 10
): Promise<{ posts: FeedPost[]; count: number | null }> {
  const from = page * limit;
  const to = from + limit;
  const pagedPosts = inMemoryFeeds.slice(from, to);
  return { posts: pagedPosts, count: inMemoryFeeds.length };
}

// --- 2. Create New Feed Post (UI Mode) ---
export async function createFeedPost(content: string, images: string[], authorId: string) {
  const newPost: FeedPost = {
    id: `feed-${Date.now()}`,
    content,
    images: images || [],
    created_at: new Date().toISOString(),
    author: {
      id: authorId,
      fullName: "Teknoy Student",
      avatarURL: "/Cit Logo.svg",
      role: "Student",
    },
  };
  inMemoryFeeds = [newPost, ...inMemoryFeeds];
}

// --- NEW: Update Feed Post (UI Mode) ---
export async function updateFeedPost(id: string, content: string, images: string[]) {
  inMemoryFeeds = inMemoryFeeds.map((p) =>
    p.id === id
      ? {
          ...p,
          content,
          images: images || [],
        }
      : p
  );
}

// --- 3. Fetch PLC "Hall of Fame" (UI Mode) ---
export async function getPLCHighlights(): Promise<PLCHighlight[]> {
  return MOCK_PLC_HIGHLIGHTS;
}