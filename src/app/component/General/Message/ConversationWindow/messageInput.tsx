"use client";

import { Send, Paperclip, X, FileText, Reply } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react"; // Added useEffect
import Image from "next/image";
import { Message } from "../Utils/types";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  onSubmit,
  selectedFile,
  setSelectedFile,
  isUploading,
  replyingTo,
  setReplyingTo,
}: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Added Ref

  // --- ADDED: Auto-focus when replying ---
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="z-20 relative bg-white">
      {/* --- Reply Preview Area --- */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-[#8B0E0E]/5 px-5 overflow-hidden"
          >
            <div className="py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <Reply size={16} className="text-[#8B0E0E] shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-[#8B0E0E] uppercase">
                    Replying to message
                  </span>
                  <p className="text-xs text-gray-600 truncate max-w-[300px]">
                    {replyingTo.content ||
                      (replyingTo.image_url ? "Sent a photo" : "Attachment")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-[#8B0E0E]/10 rounded-full transition-colors text-gray-500"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- File Preview Area --- */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50 px-5 overflow-hidden"
          >
            <div className="py-3 flex items-center gap-3">
              <div className="relative group">
                {isImage ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm text-[#8B0E0E]">
                    <FileText size={24} />
                  </div>
                )}
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 bg-gray-500 hover:bg-[#8B0E0E] text-white rounded-full p-1 shadow-md transition-colors z-10"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-700 truncate font-montserrat">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400 font-ptsans">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Input Area --- */}
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        onSubmit={onSubmit}
        className="p-5 border-t border-gray-100"
      >
        <div className="flex items-center gap-3">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-full transition-colors shrink-0 ${
              selectedFile
                ? "bg-[#8B0E0E]/10 text-[#8B0E0E]"
                : "text-gray-400 hover:text-[#8B0E0E] bg-gray-50 hover:bg-[#8B0E0E]/5"
            }`}
          >
            <Paperclip size={20} />
          </button>

          <div className="relative flex-1">
            <motion.textarea
              ref={textareaRef} // Attached Ref
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                selectedFile ? "Add a caption..." : "Type your message..."
              }
              rows={1}
              className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-gray-50 border text-[15px] font-ptsans resize-none focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
              animate={{
                borderColor: isFocused ? "#EFBF04" : "#E5E7EB",
                boxShadow: isFocused
                  ? "0 4px 15px rgba(239, 191, 4, 0.15)"
                  : "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />

            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || isUploading}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: newMessage.trim() || selectedFile ? 1 : 0.8,
                opacity: newMessage.trim() || selectedFile ? 1 : 0.5,
              }}
              whileHover={
                newMessage.trim() || selectedFile ? { scale: 1.1 } : {}
              }
              whileTap={newMessage.trim() || selectedFile ? { scale: 0.9 } : {}}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl flex items-center justify-center shadow-md transition-colors
                ${
                  newMessage.trim() || selectedFile
                    ? "bg-gradient-to-r from-[#8B0E0E] to-[#600a0a] text-white cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-default"
                }`}
              aria-label="Send"
            >
              {isUploading ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
