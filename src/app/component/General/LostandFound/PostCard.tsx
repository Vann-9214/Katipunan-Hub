"use client";

import Image from "next/image";
import { Post } from "./LostandFoundcontent";
import { motion } from "framer-motion";
import { CheckCircle2, User, MapPin, Calendar } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
// FIXED: PT Sans only supports 400 and 700
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

type PostCardProps = {
  post: Post;
  onClick: () => void;
};

const PostCard = ({ post, onClick }: PostCardProps) => {
  const { type, imageUrl, title, lostOn, postedBy, status, location } = post;

  const isLost = type === "Lost";
  const isResolved = status === "Resolved";

  // --- THEME COLORS ---
  const theme = isLost
    ? {
        border: "border-red-100",
        badgeBg: "bg-[#8B0E0E]",
        badgeText: "text-white",
        iconColor: "text-[#8B0E0E]",
      }
    : {
        border: "border-yellow-100",
        badgeBg: "bg-[#F59E0B]", // Amber
        badgeText: "text-white",
        iconColor: "text-[#F59E0B]",
      };

  return (
    <motion.button
      layoutId={`post-card-${post.id}`}
      onClick={onClick}
      whileHover={{ y: isResolved ? 0 : -8 }}
      className={`
        group relative w-[280px] min-h-[340px] rounded-3xl border 
        ${theme.border} bg-white flex flex-col shadow-sm text-left 
        transition-all duration-300 overflow-hidden
        ${
          isResolved
            ? "grayscale opacity-80 cursor-default"
            : "cursor-pointer hover:shadow-xl hover:shadow-gray-200"
        }
      `}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[180px] relative overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Tag (Lost/Found) */}
        {!isResolved && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${theme.badgeBg} ${theme.badgeText} ${montserrat.className}`}
          >
            {type}
          </div>
        )}

        {/* --- RESOLVED OVERLAY --- */}
        {isResolved && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="bg-green-600 text-white px-4 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-lg">
              <CheckCircle2 size={16} strokeWidth={3} />
              <span className={`text-xs tracking-wide ${montserrat.className}`}>
                RESOLVED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex-1 flex flex-col p-5">
        {/* Title */}
        <h3
          className={`font-bold text-lg leading-tight mb-2 truncate text-[#1a1a1a] ${montserrat.className}`}
        >
          {title}
        </h3>

        {/* Location & Date */}
        <div className={`space-y-2 mb-4 text-gray-500 ${ptSans.className}`}>
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={14} className={theme.iconColor} />
            <p className="truncate font-medium">{location}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar size={14} className={theme.iconColor} />
            <p className="font-medium">{lostOn}</p>
          </div>
        </div>

        {/* Footer: User Info */}
        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-100">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
            <User size={12} />
          </div>
          <p
            className={`text-xs font-semibold text-gray-400 uppercase tracking-wide truncate ${montserrat.className}`}
          >
            {postedBy}
          </p>
        </div>
      </div>

      {/* Bottom accent stripe */}
      <div
        className={`h-1.5 w-full ${isLost ? "bg-[#8B0E0E]" : "bg-[#F59E0B]"}`}
      />
    </motion.button>
  );
};

export default PostCard;
