// src/utils/reactionsConfig.ts (or adjust path as needed)

// Define the structure for reaction information
export interface ReactionInfo {
  id: string; // Unique identifier (e.g., 'like', 'love')
  label: string; // Text label (e.g., 'Like', 'Love')
  icon: string; // Path to the SVG icon shown in the button/picker
  colorClass?: string; // Optional: Tailwind CSS class for text color
}

// Define the path for the default (unselected) Like icon
export const defaultLikeIcon = "/Like.svg"; // Your outline/black Like icon path

// Define the list of available reactions with their details
export const reactionsList: ReactionInfo[] = [
  { id: "like", label: "Like", icon: "/Like Fill.svg", colorClass: "text-blue-600" },
  { id: "love", label: "Love", icon: "/Heart.svg", colorClass: "text-red-600" },
  { id: "haha", label: "Haha", icon: "/Laugh.svg", colorClass: "text-black" },
  { id: "wow", label: "Wow", icon: "/Wow.svg", colorClass: "text-black" },
  { id: "sad", label: "Sad", icon: "/Sad.svg", colorClass: "text-black" },
  { id: "angry", label: "Angry", icon: "/Angry.svg", colorClass: "text-black" },
];

/**
 * Helper function to get the correct icon path for a given reaction ID.
 * Returns the specific reaction icon if found, otherwise defaults to the
 * outline Like icon.
 * @param reactionId - The ID of the reaction ('like', 'love', etc.) or null.
 * @returns The path string for the corresponding icon SVG.
 */
export const getReactionIcon = (reactionId: string | null): string => {
  if (!reactionId) {
    return defaultLikeIcon; // Return default if no reaction ID
  }
  const reaction = reactionsList.find(r => r.id === reactionId);
  // Return the found reaction's icon, or fallback to default if ID is invalid
  return reaction ? reaction.icon : defaultLikeIcon;
};