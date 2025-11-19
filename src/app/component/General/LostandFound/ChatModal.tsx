// app/component/General/LostandFound/ChatModal.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, User, Plus } from "lucide-react";
import { Post } from "./LostandFoundcontent"; // Import Post type

interface ChatModalProps {
  post: Post;
  onClose: () => void;
}

export default function ChatModal({ post, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage(""); // Clear the input
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSayHi = () => {
    setMessage("Hi!");
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      {/* Modal Panel (Wide, matches Figma) */}
      <div
        className="relative bg-white w-full max-w-3xl h-[674px] rounded-3xl border-2 border-[#800000] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex flex-col items-center justify-center p-4 border-b border-gray-200">
          <button onClick={onClose} className="absolute top-4 left-4 p-2 text-[#800000] hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h3 className="font-bold text-2xl">Chat with Uploader</h3>
            <div className="flex items-center text-sm text-gray-500">
              <User size={14} className="mr-1" />
              <span>{post.postedBy}</span> {/* Dynamic name */}
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto bg-white">
          {/* Item Context Card (Outer Red Border) */}
          <div className="relative w-full max-w-2xl p-1 bg-[#800000] rounded-2xl my-8">
            {/* Tag (Grey, as per Figma) */}
            <span className="absolute -top-3 left-8 bg-gray-200 text-[#800000] px-3 py-1 rounded-md text-sm font-semibold border border-gray-300">
              Item Context
            </span>
            
            {/* Inner Grey Card */}
            <div className="bg-gray-200 rounded-xl p-4 flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                  <Image src={post.imageUrl} alt={post.title} fill style={{ objectFit: "cover" }} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-black">{post.type === "Lost" ? "Lost" : "Found"} {post.title}</h4>
                  <p className="text-gray-700 text-sm">{post.location}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-[#800000] rounded-full text-sm font-semibold shadow-sm border border-gray-300 hover:bg-gray-50 flex-shrink-0">
                View Item Details
              </button>
            </div>
          </div>

          {/* "Say Hi!" Button */}
          <button onClick={handleSayHi} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold my-4">
            Say Hi!
          </button>
        </div>

        {/* Footer (Message Input) */}
        <div className="flex items-center p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#800000]"
          />
          <button onClick={handleSendMessage} className="ml-3 bg-[#800000] text-white rounded-full p-3 w-12 h-12 flex items-center justify-center hover:bg-red-900 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}