"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  X,
  MessageCircle,
  CheckCircle2,
  RefreshCcw,
  Lock,
  MapPin,
  Calendar,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { Post } from "./LostandFoundcontent";

// --- Font Configuration ---
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PostViewModalProps {
  post: Post;
  isOwner: boolean;
  onClose: () => void;
  onStatusChange: (postId: string, newStatus: "Open" | "Resolved") => void;
  onChat: () => void;
}

export default function PostViewModal({
  post,
  isOwner,
  onClose,
  onStatusChange,
  onChat,
}: PostViewModalProps) {
  // Helper for status badges
  const isResolved = post.status === "Resolved";
  const isFoundType = post.type === "Found";

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[9000] p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div
        layoutId={`post-card-${post.id}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-4xl h-[650px] md:h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white md:text-gray-800 md:bg-black/5 md:hover:bg-black/10 transition-all z-30 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* --- LEFT SIDE: IMAGE --- */}
        <div className="w-full md:w-[45%] h-64 md:h-full relative bg-gray-100">
          {/* Status Badge */}
          <div className="absolute top-6 right-6 z-20">
            {isResolved ? (
              <div
                className={`px-4 py-1.5 rounded-full bg-green-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 ${montserrat.className}`}
              >
                <CheckCircle2 size={14} strokeWidth={3} />
                <span className="tracking-wide uppercase">Resolved</span>
              </div>
            ) : (
              <div
                className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wide text-white ${
                  isFoundType ? "bg-[#F59E0B]" : "bg-[#8B0E0E]"
                } ${montserrat.className}`}
              >
                {post.type}
              </div>
            )}
          </div>

          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />

          {/* Gradient Overlay for visual depth on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
        </div>

        {/* --- RIGHT SIDE: DETAILS --- */}
        <div className="flex-1 h-full flex flex-col p-6 md:p-8 overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 mb-6">
            <h2
              className={`${montserrat.className} text-2xl md:text-3xl font-extrabold text-[#1a1a1a] leading-tight mb-3`}
            >
              {post.title}
            </h2>

            {/* User Info Row */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                <UserIcon size={14} />
              </div>
              <div className="flex flex-col">
                <p
                  className={`${ptSans.className} text-[10px] text-gray-400 font-bold uppercase tracking-wider`}
                >
                  Posted By
                </p>
                <p
                  className={`${montserrat.className} text-sm font-bold text-gray-700`}
                >
                  {post.postedBy}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content Wrapper */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-[#8B0E0E] mb-1">
                  <Tag size={14} />
                  <span
                    className={`${ptSans.className} text-xs font-bold uppercase`}
                  >
                    Category
                  </span>
                </div>
                <p
                  className={`${montserrat.className} text-sm font-semibold text-gray-800 truncate`}
                >
                  {post.category}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-[#8B0E0E] mb-1">
                  <Calendar size={14} />
                  <span
                    className={`${ptSans.className} text-xs font-bold uppercase`}
                  >
                    Date
                  </span>
                </div>
                <p
                  className={`${montserrat.className} text-sm font-semibold text-gray-800 truncate`}
                >
                  {post.lostOn}
                </p>
              </div>

              <div className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-[#8B0E0E] mb-1">
                  <MapPin size={14} />
                  <span
                    className={`${ptSans.className} text-xs font-bold uppercase`}
                  >
                    Location
                  </span>
                </div>
                <p
                  className={`${montserrat.className} text-sm font-semibold text-gray-800`}
                >
                  {post.location}
                </p>
              </div>
            </div>

            {/* Description Box (Now with Scroll) */}
            <div>
              <h3
                className={`${montserrat.className} text-sm font-bold text-gray-900 mb-2`}
              >
                Description
              </h3>
              {/* Added max-h-[200px] and overflow-y-auto here */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-[200px] overflow-y-auto custom-scrollbar">
                <p className={ptSans.className}>{post.description}</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-100">
            {isOwner ? (
              <div className="w-full">
                {post.status === "Open" ? (
                  <button
                    onClick={() => onStatusChange(post.id, "Resolved")}
                    className={`${montserrat.className} w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2`}
                  >
                    <CheckCircle2 size={18} />
                    Mark as Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusChange(post.id, "Open")}
                    className={`${montserrat.className} w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2`}
                  >
                    <RefreshCcw size={18} />
                    Re-open Post
                  </button>
                )}
              </div>
            ) : isResolved ? (
              <div
                className={`${montserrat.className} w-full py-3.5 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200`}
              >
                <Lock size={16} />
                <span>This post has been resolved</span>
              </div>
            ) : (
              <button
                onClick={onChat}
                className={`${montserrat.className} w-full py-3.5 bg-[#8B0E0E] hover:bg-[#720b0b] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transform active:scale-[0.98]`}
              >
                <MessageCircle size={20} />
                Chat with Uploader
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
