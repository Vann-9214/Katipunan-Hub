// app/component/General/LostandFound/PostViewModal.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { X, MoreHorizontal, User } from "lucide-react";
import { Post } from "./LostandFoundcontent";
import ChatModal from "./ChatModal"; 
import { motion } from "framer-motion";

interface PostViewModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostViewModal({ post, onClose }: PostViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const moreOptionsRef = useRef<HTMLButtonElement>(null);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showReportDropdown &&
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.report-dropdown')
      ) {
        setShowReportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReportDropdown]);

  const isLost = post.type === "Lost";
  const detailLabelColor = isLost ? "text-[#800000]" : "text-[#eed23a]";

  const handleReport = () => {
    alert("Reporting post: " + post.title);
    setShowReportDropdown(false);
  };

  const uploaderAvatar = (
    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
      <User size={24} className="text-gray-600" />
    </div>
  );

  return (
    <>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onClick={onClose} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }} // Fade in
        // --- 1. FAST BACKDROP EXIT ---
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <motion.div
          layoutId={`card-${post.id}`}
          
          // --- 2. FAST AND BOUNCY SPRING (LIKE THE STAR) ---
          transition={{
            type: "spring",
            stiffness: 400, // Faster, stiffer spring
            damping: 25,     // Controlled bounce
          }}
          
          className="relative rounded-3xl p-8 w-full max-w-4xl min-h-[500px] flex items-stretch"
          ref={modalRef}
          onClick={(e) => e.stopPropagation()} 
          style={{
            backgroundColor: "rgba(255, 250, 245, 0.75)", 
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 60px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
          }}
        >
          <motion.div 
            className="w-full flex items-stretch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
            // --- 3. INSTANT CONTENT EXIT ---
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
          >
            {/* Close Button - Top-left */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 text-gray-800 z-10"
            >
              <X size={20} />
            </button>

            {/* More Options/Report Button & Dropdown - Top-right */}
            <div className="absolute top-4 right-4 z-10">
              <button
                ref={moreOptionsRef}
                onClick={() => setShowReportDropdown(!showReportDropdown)}
                className="p-2 text-gray-500 hover:bg-gray-100/50 rounded-full"
              >
                <MoreHorizontal size={24} />
              </button>
              {showReportDropdown && (
                <div className="report-dropdown absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1">
                  <button
                    onClick={handleReport}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Report Post
                  </button>
                </div>
              )}
            </div>

            {/* --- Left Section (Item Name, Image, Posted By, Chat Button) --- */}
            <div className="w-1/2 flex flex-col items-center justify-between py-12 px-6">
              
              {/* Title and Tag Group */}
              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-5xl font-extrabold text-black capitalize">
                  {post.title}
                </h2>
                <div className="relative w-[85px] h-[38px] flex-shrink-0">
                  <Image
                    src={isLost ? "/lost.svg" : "/found.svg"}
                    alt={isLost ? "Lost item tag" : "Found item tag"}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>

              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg mb-4">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              
              <div className="mb-6 flex items-center justify-center space-x-3 w-full max-w-xs">
                {uploaderAvatar}
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-600">Posted By</p>
                  <p className="font-bold text-lg text-black truncate">{post.postedBy}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowChatModal(true)}
                className="w-full bg-[#800000] text-white py-3 rounded-full font-semibold hover:bg-red-900 transition-all"
              >
                Chat with the Uploader
              </button>
            </div>

            {/* --- Right Section (Tag and Details) --- */}
            <div className="w-1/2 p-8 border-l border-gray-200 flex flex-col justify-center">
              <div className="space-y-4 text-xl">
                <div>
                  <p className={`font-semibold ${detailLabelColor}`}>Category:</p>
                  <p className="text-black">{post.category}</p>
                </div>
                <div>
                  <p className={`font-semibold ${detailLabelColor}`}>Location:</p>
                  <p className="text-black">{post.location}</p>
                </div>
                <div>
                  <p className={`font-semibold ${detailLabelColor}`}>Lost on:</p>
                  <p className="text-black">{post.lostOn}</p>
                </div>
                <div>
                  <p className={`font-semibold ${detailLabelColor}`}>Description:</p>
                  <p className="text-black">{post.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* --- Render Chat Modal --- */}
      {showChatModal && (
        <ChatModal
          post={post}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </>
  );
}