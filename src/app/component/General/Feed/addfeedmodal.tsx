"use client";

import React, { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import UploadButton, {
  UploadButtonHandle,
} from "../Announcement/UploadButton/UploadButton";
import { createFeedPost } from "../../../../../supabase/Lib/Feeds/feeds";
import { createPortal } from "react-dom";

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  onSuccess: () => void;
}

export default function AddFeedModal({
  isOpen,
  onClose,
  authorId,
  onSuccess,
}: AddFeedModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadRef = useRef<UploadButtonHandle>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      // 1. Upload Images
      let imageUrls: string[] = [];
      if (uploadRef.current) {
        imageUrls = await uploadRef.current.uploadAndGetFinalUrls();
      }

      // 2. Save to DB
      await createFeedPost(content, imageUrls, authorId);

      onSuccess();
      onClose();
      setContent("");
    } catch (e) {
      console.error(e);
      alert("Failed to post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-maroon text-white">
          <h2 className="font-montserrat font-bold text-lg">Create Post</h2>
          <button onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <textarea
            className="w-full min-h-[150px] resize-none outline-none text-lg font-montserrat placeholder-gray-400"
            placeholder="What's on your mind, Teknoy?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="mt-4">
            <UploadButton ref={uploadRef} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="px-8 py-2 bg-gold text-black font-bold rounded-full hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            Post
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}
