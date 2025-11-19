"use client";

import Image from "next/image";
import { Post } from "./LostandFoundcontent";
import { motion } from "framer-motion"; // --- 1. IMPORT MOTION ---

type PostCardProps = {
  post: Post;
  onClick: () => void;
};

const PostCard = ({ post, onClick }: PostCardProps) => {
  const { type, imageUrl, title, lostOn, postedBy } = post;
  
  const isLost = type === "Lost";

  const borderColor = isLost ? "border-[#8a0b0b]" : "border-[#eed23a]";
  const bgColor = isLost ? "bg-[#8a0b0b]" : "bg-[#eed23a]";
  const titleColor = isLost ? "text-[#ffd700]" : "text-[#800000]";
  const cardTextColor = isLost ? "text-white" : "text-[#800000]";
  
  const glowStyle = isLost
    ? {}
    : { boxShadow: "0 20px 60px rgba(238,210,58,0.12)" };

  return (
    // --- 2. CHANGE <button> TO <motion.button> AND ADD layoutId ---
    <motion.button
      layoutId={`card-${post.id}`} // This is the magic key
      onClick={onClick}
      className={`w-[270px] min-h-[330px] rounded-[20px] border-4 ${borderColor} box-border overflow-visible flex flex-col shadow-lg text-left transition-all duration-200 hover:scale-105`}
      style={glowStyle}
    >
      <div className="w-full h-[180px] relative rounded-t-[16px] overflow-hidden">
        <Image src={imageUrl} alt={title} fill style={{ objectFit: "cover" }} />

        <div className="absolute top-3 right-3 w-[85px] h-[38px] flex items-center justify-center overflow-hidden rounded-md">
          <Image
            src={isLost ? "/lost.svg" : "/found.svg"}
            alt={isLost ? "Lost item tag" : "Found item tag"}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      <div className={`p-4 pt-6 flex-1 ${bgColor} flex flex-col`}>
        <h3 className={`font-bold text-xl truncate ${titleColor}`}>{title}</h3>
        <p className={`font-medium text-[11px] mt-1 ${cardTextColor}`}>
          Lost on: {lostOn}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className={`font-bold text-[10px] ${cardTextColor}`}>{postedBy}</p>
          <div
            className="w-[35px] h-[35px] bg-white rounded-full shadow-sm"
          />
        </div>
      </div>
    </motion.button>
  );
};

export default PostCard;