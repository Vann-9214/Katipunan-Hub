"use client";

import Image from "next/image";
import { Post } from "./LostandFoundcontent";
import { motion } from "framer-motion";
import { CheckCircle2, User, MapPin, Calendar } from "lucide-react";

type PostCardProps = {
  post: Post;
  onClick: () => void;
};

const PostCard = ({ post, onClick }: PostCardProps) => {
  const { type, imageUrl, title, lostOn, postedBy, status, location } = post;
  
  const isLost = type === "Lost";
  const isResolved = status === "Resolved";

  // --- THEME COLORS ---
  // Using variables makes it easier to manage
  const theme = isLost
    ? {
        border: "border-[#8a0b0b]",
        bg: "bg-[#8a0b0b]",
        title: "text-[#ffd700]", // Gold for Lost title
        text: "text-red-50",
        badge: "/lost.svg",
      }
    : {
        border: "border-[#eed23a]",
        bg: "bg-[#eed23a]",
        title: "text-[#5c0000]", // Dark Maroon for Found title (Better Contrast)
        text: "text-yellow-900",
        badge: "/found.svg",
      };

  return (
    <motion.button
      layoutId={`post-card-${post.id}`}
      onClick={onClick}
      // Hover Effect: Lift up slightly if active
      whileHover={{ y: isResolved ? 0 : -8 }}
      className={`
        group relative w-[280px] min-h-[340px] rounded-[24px] border-[3px] 
        ${theme.border} box-border flex flex-col shadow-xl text-left 
        transition-all duration-300 overflow-hidden
        ${isResolved ? "grayscale opacity-80 cursor-default" : "cursor-pointer hover:shadow-2xl"}
      `}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="w-full h-[180px] relative overflow-hidden bg-gray-200">
        
        {/* Image with Zoom Effect on Hover */}
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Tag (Lost/Found) */}
        {!isResolved && (
          <div className="absolute top-3 right-3 w-[80px] h-[36px] z-10 drop-shadow-md">
            <Image
              src={theme.badge}
              alt={`${type} tag`}
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* --- RESOLVED OVERLAY (Glass Effect) --- */}
        {isResolved && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-green-600/90 text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 shadow-2xl transform -rotate-3 border border-white/20">
              <CheckCircle2 size={18} strokeWidth={3} />
              <span className="tracking-wide">RESOLVED</span>
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className={`flex-1 flex flex-col p-5 ${theme.bg}`}>
        
        {/* Title */}
        <h3 className={`font-extrabold text-xl truncate mb-1 ${theme.title} drop-shadow-sm`}>
          {title}
        </h3>

        {/* Location & Date */}
        <div className={`space-y-1 mb-4 ${theme.text} opacity-90`}>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <MapPin size={14} />
            <p className="truncate">{location}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Calendar size={14} />
            <p>{lostOn}</p>
          </div>
        </div>

        {/* Footer: User Info */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-black/10">
          <p className={`font-bold text-[11px] uppercase tracking-wide ${theme.text} opacity-80 truncate max-w-[170px]`}>
            {postedBy}
          </p>
          
          {/* Avatar with Initials */}
          <div className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-[#800000] font-bold text-xs shrink-0 border-2 border-white/30">
            <User size={16} />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default PostCard;