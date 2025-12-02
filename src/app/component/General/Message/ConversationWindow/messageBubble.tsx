"use client";

import { Message } from "../Utils/types";
import { motion } from "framer-motion";
import { FileText, Download, Reply, Check, CheckCheck } from "lucide-react"; // Added Icons
import Image from "next/image";

export default function MessageBubble({
  message,
  isCurrentUser,
  onReply,
  replyMessage,
}: {
  message: Message;
  isCurrentUser: boolean;
  onReply: (message: Message) => void;
  replyMessage?: Message;
}) {
  const isImage = message.image_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const hasAttachment = !!message.image_url;

  // Logic to hide the sidebar status text in the bubble
  const isSystemText =
    message.content === "Sent a photo" ||
    message.content === "Sent an attachment";
  const shouldShowText = message.content && (!hasAttachment || !isSystemText);

  // --- Seen Status Logic ---
  // If read_at is not null, it's seen.
  const isSeen = !!message.read_at;

  return (
    <div
      className={`flex w-full mb-3 group ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Reply Button (Left side for current user) */}
      {isCurrentUser && (
        <div className="flex items-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reply"
          >
            <Reply size={14} />
          </button>
        </div>
      )}

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
        {/* --- Replied Message Context --- */}
        {replyMessage && (
          <div
            className={`mx-3 mt-3 mb-1 p-2 rounded-lg text-xs flex flex-col gap-1 opacity-90 ${
              isCurrentUser
                ? "bg-black/20 text-white/90 border-l-2 border-white/50"
                : "bg-gray-100 text-gray-600 border-l-2 border-[#8B0E0E]/50"
            }`}
          >
            <span className="font-bold mb-0.5">
              {replyMessage.sender_id === message.sender_id
                ? "Replying to themselves"
                : "Replying to message"}
            </span>
            <p className="truncate opacity-80">
              {replyMessage.content ||
                (replyMessage.image_url ? "Photo" : "Attachment")}
            </p>
          </div>
        )}

        {/* --- Attachment Rendering --- */}
        {hasAttachment && message.image_url && (
          <div className="p-1 pb-0">
            {isImage ? (
              <div className="rounded-xl overflow-hidden mb-1 relative w-full">
                <Image
                  src={message.image_url}
                  alt="Attachment"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto object-cover max-h-[300px]"
                  unoptimized
                />
              </div>
            ) : (
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
        {shouldShowText && (
          <div className="px-4 py-2 whitespace-pre-wrap">{message.content}</div>
        )}

        {/* Timestamp & Read Status */}
        <div
          className={`text-[10px] px-4 pb-2 text-right flex items-center justify-end gap-1 ${
            isCurrentUser ? "text-white/60" : "text-gray-400"
          }`}
        >
          <span>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {/* --- Seen Indicator --- */}
          {isCurrentUser && (
            <span title={isSeen ? "Seen" : "Sent"}>
              {isSeen ? (
                <CheckCheck size={14} className="text-[#EFBF04]" /> // Gold for seen
              ) : (
                <Check size={14} className="text-white/60" /> // Faded for sent
              )}
            </span>
          )}
        </div>
      </motion.div>

      {/* Reply Button (Right side for other user) */}
      {!isCurrentUser && (
        <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reply"
          >
            <Reply size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
