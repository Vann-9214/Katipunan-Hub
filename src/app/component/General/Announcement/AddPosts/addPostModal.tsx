"use client";

import React from "react"; // Import React
import Image from "next/image";
import UploadButton from "../UploadButton/UploadButton";
import { createPortal } from "react-dom";
import { X, ChevronDown, School } from "lucide-react"; // Import fallback icon
import PostAudienceSelector from "./postAudience";
import TagEditor from "./tagEditor";
import { useAddPostForm } from "../../../../../../supabase/Lib/Announcement/AddPosts/useAddPostForm";
import { type AddPostsProps } from "./addPosts";
import { collegeitems } from "../Utils/constants"; // Import college items

// Props Interface
export interface AddPostModalProps
  extends Omit<AddPostsProps, "externalOpen" | "onExternalClose"> {
  onClose: () => void;
}

// Component
export function AddPostModal(props: AddPostModalProps) {
  const { state, refs, handlers } = useAddPostForm(props);
  const {
    loading,
    visibleTo,
    visibleCollege,
    isAudienceSelectorOpen,
    title,
    description,
    tags,
    postType,
    predefinedImages,
    modalTitle,
  } = state;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4 modal-root">
      <div className="bg-white rounded-2xl w-[700px] shadow-xl max-h-[90vh]">
        {isAudienceSelectorOpen ? (
          // Audience Selector
          <PostAudienceSelector
            currentVisibleTo={visibleTo}
            currentVisibleCollege={visibleCollege}
            onSelectAudience={handlers.handleAudienceSelect}
            onClose={handlers.closeAudienceSelector}
          />
        ) : (
          // Post Form
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-[10px] border-b border-gray-200">
              <h1 className="flex-1 font-montserrat text-[40px] text-center font-semibold text-black">
                {modalTitle}
              </h1>
              <button
                type="button"
                onClick={props.onClose}
                className="text-black cursor-pointer"
              >
                <X size={40} />
              </button>
            </div>

            {/* Scrollable Form Area */}
            <form
              id="add-post-form"
              onSubmit={handlers.handleSubmit}
              className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
            >
              {/* User Info & Visibility */}
              <div className="flex items-center gap-3">
                <Image
                  src="/Cit Logo.svg"
                  alt="Author"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div>
                  <span className="font-medium text-[20px] text-gray-900">
                    Cebu Institute of Technology - University
                  </span>
                  {postType === "announcement" && (
                    <button
                      type="button"
                      onClick={handlers.openAudienceSelector}
                      className="cursor-pointer flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {/* --- THIS IS THE NEW ICON LOGIC --- */}
                      {visibleTo === "global" ? (
                        <Image
                          src="/Global.svg"
                          alt="Global"
                          width={16}
                          height={16}
                        />
                      ) : (
                        React.createElement(
                          collegeitems.find((c) => c.value === visibleCollege)
                            ?.icon || School,
                          { className: "w-4 h-4" }
                        )
                      )}
                      {/* --- END ICON LOGIC --- */}
                      <span>
                        {visibleTo === "global"
                          ? "Global"
                          : `College (${
                              visibleCollege?.toUpperCase() || "Select"
                            })`}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                  )}
                  {postType === "highlight" && (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1.5 text-sm text-gray-500 cursor-not-allowed"
                    >
                      <Image
                        src="/Global.svg"
                        alt="Global"
                        width={16}
                        height={16}
                      />
                      <span>Global</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 text-[20px] font-medium text-black font-montserrat"
                >
                  Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => handlers.setTitle(e.target.value)}
                  placeholder="Enter posts title..."
                  className="bg-[#E0E0E0] border font-montserrat h-[55px] border-transparent text-black text-[16px] font-medium rounded-[10px]  focus:border-black focus:outline-none block w-full p-5"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-[20px] font-medium text-black font-montserrat"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  ref={refs.textareaRef}
                  value={description}
                  onChange={(e) => {
                    handlers.setDescription(e.target.value);
                    handlers.handleInput();
                  }}
                  placeholder="Enter detailed information to be shared with the community..."
                  className="bg-[#E0E0E0] border text-black font-medium font-montserrat text-[16px] rounded-[10px] focus:border-black focus:outline-none block w-full p-3 min-h-[120px] max-h-[210px] resize-none overflow-hidden border-transparent"
                  required
                />
              </div>

              {/* Tag Editor */}
              <div>
                <TagEditor
                  width="w-full"
                  tags={tags}
                  onTagAdd={handlers.addTag}
                  onTagRemove={handlers.removeTag}
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block mb-2 text-[20px] font-medium text-black font-montserrat">
                  Attachment (Optional)
                </label>
                <UploadButton
                  key={props.initialPost?.id ?? "new"}
                  ref={refs.uploadRef}
                  predefinedImages={predefinedImages}
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                type="submit"
                form="add-post-form"
                disabled={loading}
                className="w-full cursor-pointer text-white bg-maroon hover:bg-maroon/90 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:bg-gray-400"
              >
                {loading
                  ? "Publishing..."
                  : props.initialPost
                  ? "Save Changes"
                  : "Publish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
