"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  X,
  MessageCircle,
  CheckCircle2,
  RefreshCcw,
  Lock,
  ChevronLeft,
  User as UserIcon,
} from "lucide-react";
import { Post } from "./LostandFoundcontent";

interface PostViewModalProps {
  post: Post;
  isOwner: boolean;
  onClose: () => void;
  // CHANGED: postId type from number to string to match Supabase UUIDs
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
  const [view, setView] = useState<"details" | "inquiries">("details");

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[9000]"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div
        layoutId={`post-card-${post.id}`}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
        className="w-full max-w-4xl h-[600px] rounded-[32px] shadow-2xl overflow-hidden flex relative"
        style={{
          backgroundColor: "rgba(255, 251, 242, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Only show in Details view */}
        {view === "details" && (
          <button
            onClick={onClose}
            className="absolute top-6 left-6 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors z-20"
          >
            <X size={20} className="text-gray-700" />
          </button>
        )}

        {/* --- VIEW 1: DETAILS --- */}
        {view === "details" && (
          <div className="flex w-full h-full">
            <div className="w-1/2 h-full bg-gray-100 relative overflow-hidden">
              <div className="absolute top-6 right-6 z-10">
                {post.status === "Resolved" ? (
                  <span className="px-4 py-2 rounded-full bg-green-600 text-yellow-200 font-bold text-sm shadow-md flex items-center gap-2">
                    <CheckCircle2 size={16} /> Resolved
                  </span>
                ) : (
                  <span
                    className={`px-4 py-2 rounded-full font-bold text-sm shadow-md ${
                      post.type === "Found"
                        ? "bg-[#E6C200] text-black"
                        : "bg-[#800000] text-white"
                    }`}
                  >
                    {post.type}
                  </span>
                )}
              </div>

              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="w-1/2 h-full p-10 flex flex-col relative">
              <div className="mb-8 mt-4">
                <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl shadow-inner">
                    👤
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      Posted By
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {post.postedBy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <p className="text-[#800000] font-bold text-sm mb-1">
                    Category:
                  </p>
                  <p className="text-gray-700 text-lg">{post.category}</p>
                </div>
                <div>
                  <p className="text-[#800000] font-bold text-sm mb-1">
                    Location:
                  </p>
                  <p className="text-gray-700 text-lg">{post.location}</p>
                </div>
                <div>
                  <p className="text-[#800000] font-bold text-sm mb-1">
                    {post.type === "Lost" ? "Lost on:" : "Found on:"}
                  </p>
                  <p className="text-gray-700 text-lg">{post.lostOn}</p>
                </div>
                <div>
                  <p className="text-[#800000] font-bold text-sm mb-1">
                    Description:
                  </p>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/60">
                {isOwner ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setView("inquiries")}
                      className="w-full py-3 bg-white border-2 border-[#800000] text-[#800000] rounded-xl font-bold transition-all hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      View Inquiries ({post.inquiries?.length || 0})
                    </button>

                    {post.status === "Open" ? (
                      <button
                        onClick={() => onStatusChange(post.id, "Resolved")}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        Mark as Found / Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatusChange(post.id, "Open")}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCcw size={20} />
                        Re-open Post
                      </button>
                    )}
                  </div>
                ) : post.status === "Resolved" ? (
                  <div className="w-full py-4 bg-gray-300 text-gray-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock size={24} />
                    <span>Already Resolved / Found</span>
                  </div>
                ) : (
                  <button
                    onClick={onChat}
                    className="w-full py-4 bg-[#800000] hover:bg-[#660000] text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={24} />
                    Chat with the Uploader
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: INQUIRIES LIST --- */}
        {view === "inquiries" && (
          <div className="w-full h-full p-8 flex flex-col bg-white">
            <div className="flex items-center gap-4 mb-6 border-b pb-4 pt-2">
              <button
                onClick={() => setView("details")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <ChevronLeft size={28} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#800000]">Inquiries</h2>
                <p className="text-sm text-gray-500">
                  Messages for {post.title}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {post.inquiries && post.inquiries.length > 0 ? (
                post.inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#800000]/10 rounded-full flex items-center justify-center text-[#800000]">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {inquiry.userName}
                        </h4>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {inquiry.messagePreview}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">
                        {inquiry.time}
                      </span>
                      <button
                        onClick={onChat}
                        className="px-4 py-2 bg-[#800000] text-white text-xs font-bold rounded-lg hover:bg-red-900 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={48} className="mb-2 opacity-20" />
                  <p>No inquiries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
