"use client";

import { Message } from "../Utils/types";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import Image from "next/image"; // 1. Import Image

export default function MessageBubble({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) {
  // Check if the attachment is an image based on typical extensions
  const isImage = message.image_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const hasAttachment = !!message.image_url;

  return (
    <div
      className={`flex w-full mb-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`max-w-[75%] md:max-w-[60%] shadow-sm relative text-[15px] font-medium leading-relaxed font-ptsans flex flex-col
          ${
            isCurrentUser
              ? "bg-gradient-to-br from-[#8B0E0E] to-[#600a0a] text-white rounded-[18px] rounded-br-[4px]"
              : "bg-white border border-gray-100 text-gray-800 rounded-[18px] rounded-bl-[4px]"
          }`}
      >
        {/* --- Attachment Rendering --- */}
        {hasAttachment && message.image_url && (
          <div className="p-1 pb-0">
            {isImage ? (
              // Image Display (Updated)
              <div className="rounded-xl overflow-hidden mb-1 relative w-full">
                <Image
                  src={message.image_url}
                  alt="Attachment"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto object-cover max-h-[300px]"
                  unoptimized // Disables server-side optimization to avoid config errors
                />
              </div>
            ) : (
              // Generic File Display
              <a
                href={message.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors ${
                  isCurrentUser
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isCurrentUser
                      ? "bg-white/20"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {message.file_name || "Attachment"}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isCurrentUser ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    Click to download
                  </p>
                </div>
                <Download size={16} />
              </a>
            )}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <div className="px-4 py-2 whitespace-pre-wrap">{message.content}</div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] px-4 pb-2 text-right ${
            isCurrentUser ? "text-white/60" : "text-gray-400"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </motion.div>
    </div>
  );
}
