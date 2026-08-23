"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import EditPostsButton from "./EditPostsButton";
import { collegeitems } from "../utils/constants";

// Component Interface
export interface PostsProps {
  postId: string;
  userId?: string;
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  type: "announcement";
  mode?: "card" | "modal";
  visibility?: string | null;
  tags?: string[];
}

export default function Posts(props: PostsProps) {
  const {
    postId,
    title = "Title",
    description = "Description",
    date = "Date",
    onEdit,
    onDelete,
    canEdit = false,
    mode = "card",
    visibility,
  } = props;

  // Description Expansion Logic
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeMoreVisible, setIsSeeMoreVisible] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = descriptionRef.current;
    if (element && mode === "card") {
      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsSeeMoreVisible(hasOverflow);
    }
  }, [description, mode]);

  // Visibility / College Icon Logic
  const college = visibility
    ? collegeitems.find((c) => c.value === visibility)
    : null;
  const IconComponent = college?.icon;

  return (
    <div id={`post-${postId}`} className="mb-6 relative w-full max-w-[590px]">
      {/* Shadow Element */}
      <div className="absolute inset-0 bg-black/10 rounded-[24px] blur-md -z-10 translate-y-3" />

      {/* Main Card Container - Gold Accent Border */}
      <div className="w-full p-[2px] rounded-[22px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
        {/* Inner Content Wrapper */}
        <div className="w-full rounded-[20px] overflow-hidden flex flex-col bg-white">
          {/* Header & Body Section */}
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] text-white p-6 pb-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="select-none shrink-0">
                  <Image
                    src="/Cit Logo.svg"
                    alt="CIT Logo"
                    width={50}
                    height={50}
                    draggable={false}
                    className="drop-shadow-md"
                  />
                </div>
                <div className="flex flex-col select-text justify-center">
                  <h1 className="font-montserrat font-bold text-[16px] leading-tight text-white">
                    Cebu Institute of Technology - University
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-ptsans text-[13px] text-white/80">
                      {date}
                    </p>
                    <span className="text-white/40">·</span>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-xs text-white/90">
                      {IconComponent ? (
                        <IconComponent className="w-3.5 h-3.5 text-[#EFBF04]" />
                      ) : (
                        <Image
                          src="/Global.svg"
                          alt="Global"
                          width={13}
                          height={13}
                          draggable={false}
                          className="invert brightness-0 opacity-80"
                        />
                      )}
                      <span className="capitalize text-[11px] font-medium font-ptsans">
                        {college ? college.label : "Global"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {canEdit && (
                <div className="select-none">
                  <EditPostsButton
                    onEdit={() => onEdit?.()}
                    onRemove={() => onDelete?.()}
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border-white/10 mb-4" />

            {/* Announcement Title */}
            {title && (
              <div className="font-montserrat font-bold text-[20px] mb-3 select-text tracking-tight text-[#EFBF04] leading-snug">
                {title}
              </div>
            )}

            {/* Announcement Description */}
            <div
              ref={descriptionRef}
              className={`font-ptsans text-[15px] leading-relaxed text-white/90 select-text break-words whitespace-pre-wrap ${
                mode === "card" && !isExpanded ? "line-clamp-4" : ""
              }`}
            >
              {description}
            </div>

            {/* See More Button */}
            {mode === "card" && isSeeMoreVisible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-montserrat text-[13px] font-semibold mt-2 text-[#EFBF04] hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {isExpanded ? "See less" : "See more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
