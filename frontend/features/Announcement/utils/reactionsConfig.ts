export interface ReactionInfo {
  id: string;
  label: string;
  icon: string;
  colorClass: string;
}

export const defaultLikeIcon = "/Like.svg";

export const reactionsList: ReactionInfo[] = [
  {
    id: "like",
    label: "Like",
    icon: "/Like Fill.svg",
    colorClass: "text-[#EFBF04]",
  },
  {
    id: "love",
    label: "Love",
    icon: "/Heart.svg",
    colorClass: "text-red-500",
  },
  {
    id: "haha",
    label: "Haha",
    icon: "/Laugh.svg",
    colorClass: "text-yellow-500",
  },
  {
    id: "wow",
    label: "Wow",
    icon: "/Wow.svg",
    colorClass: "text-yellow-500",
  },
  {
    id: "sad",
    label: "Sad",
    icon: "/Sad.svg",
    colorClass: "text-yellow-500",
  },
  {
    id: "angry",
    label: "Angry",
    icon: "/Angry.svg",
    colorClass: "text-red-600",
  },
];

export const getReactionIcon = (reactionId: string | null): string => {
  if (!reactionId) {
    return defaultLikeIcon;
  }
  const reaction = reactionsList.find((r) => r.id === reactionId);
  return reaction ? reaction.icon : defaultLikeIcon;
};

export const formatCompactNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || num === 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${(num / 1000000).toFixed(1)}M`;
};

export const formatCommentCount = (count: number): string => {
  if (!count || count === 0) return "0 comments";
  if (count === 1) return "1 comment";
  if (count < 1000) return `${count} comments`;
  return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k comments`;
};
