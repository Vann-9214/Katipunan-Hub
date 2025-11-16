export interface ReactionInfo {
  id: string;
  label: string; 
  icon: string; 
  colorClass?: string; 
}

export const defaultLikeIcon = "/Like.svg"; 

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
    return defaultLikeIcon; 
  }
  const reaction = reactionsList.find(r => r.id === reactionId);

  return reaction ? reaction.icon : defaultLikeIcon;
};