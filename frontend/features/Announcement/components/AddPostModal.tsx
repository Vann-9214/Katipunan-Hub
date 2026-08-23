"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronDown, School } from "lucide-react";
import PostAudienceSelector from "./PostAudience";
import TagEditor from "./TagEditor";
import UploadImage from "./UploadImage";
import { useAddPostForm } from "../hooks/useAddPostForm";
import type { AddPostsProps } from "./AddPosts";
import { collegeitems } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export interface AddPostModalProps
  extends Omit<AddPostsProps, "externalOpen" | "onExternalClose"> {
  onClose: () => void;
}

export function AddPostModal(props: AddPostModalProps) {
  const [mounted, setMounted] = useState(false);
  const { state, refs, handlers } = useAddPostForm(props);
  const {
    loading,
    visibleTo,
    visibleCollege,
    isAudienceSelectorOpen,
    title,
    description,
    images,
    isUploadingImage,
    tags,
    modalTitle,
    suggestedTags,
  } = state;

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = "Cebu Institute of Technology - University";

  const handleClose = () => {
    const initialTitle = props.initialPost?.title || "";
    const isTitleDirty = title.trim() !== initialTitle;

    const getInitialDesc = () => {
      if (!props.initialPost) return "";
      return (
        props.initialPost.description?.replace(/\s*#\S+/g, "").trim() || ""
      );
    };
    const initialDesc = getInitialDesc();
    const isDescDirty = description.trim() !== initialDesc;

    const initialTags = props.initialPost?.tags || [];
    const sortedCurrentTags = [...tags].sort().join(",");
    const sortedInitialTags = [...initialTags].sort().join(",");
    const isTagsDirty = sortedCurrentTags !== sortedInitialTags;

    const initialImages = props.initialPost?.images || [];
    const isImagesDirty = images.join(",") !== initialImages.join(",");

    const hasChanges = isTitleDirty || isDescDirty || isTagsDirty || isImagesDirty;

    if (hasChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmLeave) {
        return;
      }
    }

    props.onClose();
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 modal-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div
        layout
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative w-full max-w-[650px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
          <AnimatePresence mode="wait" initial={false}>
            {isAudienceSelectorOpen ? (
              <motion.div
                key="selector"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col h-full bg-white"
              >
                <PostAudienceSelector
                  currentVisibleTo={visibleTo}
                  currentVisibleCollege={visibleCollege}
                  onSelectAudience={handlers.handleAudienceSelect}
                  onClose={handlers.closeAudienceSelector}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col h-full overflow-hidden bg-white"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 shrink-0 z-10 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />

                  <h1
                    className={`${montserrat.className} flex-1 text-[20px] font-bold text-white tracking-wide text-center`}
                  >
                    {modalTitle}
                  </h1>
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/80 hover:text-white cursor-pointer p-1 transition-colors absolute right-4"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <form
                  id="add-post-form"
                  onSubmit={handlers.handleSubmit}
                  className="flex flex-col gap-5 p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F9FAFB]"
                >
                  {/* Author / Audience */}
                  <div className="flex items-center gap-3">
                    <div className="w-[44px] h-[44px] rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm shrink-0">
                      <Image
                        src="/Cit Logo.svg"
                        alt="Author"
                        width={30}
                        height={30}
                      />
                    </div>

                    <div>
                      <span
                        className={`${montserrat.className} font-bold text-[15px] text-[#1a1a1a] block`}
                      >
                        {displayName}
                      </span>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlers.openAudienceSelector}
                        className="mt-1 cursor-pointer flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-1 transition-colors border border-gray-200"
                      >
                        {visibleTo === "global" ? (
                          <Image
                            src="/Global.svg"
                            alt="Global"
                            width={12}
                            height={12}
                            className="opacity-60"
                          />
                        ) : (
                          React.createElement(
                            collegeitems.find(
                              (c) => c.value === visibleCollege
                            )?.icon || School,
                            { className: "w-3 h-3 text-gray-500" }
                          )
                        )}
                        <span className={ptSans.className}>
                          {visibleTo === "global"
                            ? "Global"
                            : `College (${
                                visibleCollege?.toUpperCase() || "Select"
                              })`}
                        </span>
                        <ChevronDown size={12} className="text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className={`${montserrat.className} block text-sm font-bold text-gray-700`}
                    >
                      Headline / Title{" "}
                      <span className="text-[#8B0E0E] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus={true}
                      id="title"
                      required
                      value={title}
                      onChange={(e) => handlers.setTitle(e.target.value)}
                      placeholder="Enter announcement headline..."
                      className={`${ptSans.className} w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#EFBF04] focus:border-transparent block p-3.5 transition-all placeholder:text-gray-400 shadow-sm`}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className={`${montserrat.className} block text-sm font-bold text-gray-700`}
                    >
                      Announcement Content{" "}
                      <span className="text-[#8B0E0E] font-bold">*</span>
                    </label>
                    <textarea
                      id="description"
                      ref={refs.textareaRef}
                      value={description}
                      onChange={(e) => {
                        handlers.setDescription(e.target.value);
                        handlers.handleInput();
                      }}
                      placeholder="Share the official announcement details here..."
                      className={`${ptSans.className} w-full bg-white border border-gray-200 text-gray-900 text-[14px] rounded-xl focus:ring-2 focus:ring-[#EFBF04] focus:border-transparent block p-3.5 min-h-[140px] max-h-[300px] resize-none overflow-hidden transition-all placeholder:text-gray-400 shadow-sm leading-relaxed`}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label
                      className={`${montserrat.className} block text-sm font-bold text-gray-700`}
                    >
                      Images / Poster{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <UploadImage
                      images={images}
                      onUpload={handlers.handleImageUpload}
                      onRemove={handlers.handleRemoveImage}
                      isUploading={isUploadingImage}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label
                      className={`${montserrat.className} block text-sm font-bold text-gray-700`}
                    >
                      Tags{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <div className="p-1">
                      <TagEditor
                        width="w-full"
                        tags={tags}
                        suggestedTags={suggestedTags}
                        onTagAdd={handlers.addTag}
                        onTagRemove={handlers.removeTag}
                      />
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 shrink-0 bg-white flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`${montserrat.className} px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    form="add-post-form"
                    disabled={loading || isUploadingImage}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${montserrat.className} min-w-[140px] cursor-pointer text-white bg-gradient-to-r from-[#8B0E0E] to-[#600a0a] hover:from-[#a31111] hover:to-[#750c0c] focus:ring-4 focus:ring-red-100 font-bold rounded-xl text-sm px-6 py-2.5 text-center disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-red-900/20 transition-all`}
                  >
                    {loading || isUploadingImage
                      ? isUploadingImage
                        ? "Uploading Images..."
                        : "Publishing..."
                      : props.initialPost
                      ? "Save Changes"
                      : "Publish Announcement"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
