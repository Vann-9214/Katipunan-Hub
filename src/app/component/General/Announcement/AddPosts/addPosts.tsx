"use client";

import Image from "next/image";
import UploadButton, {
  type UploadButtonHandle,
} from "../UploadButton/UploadButton";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import PostAudienceSelector from "./postAudience"; // This is already imported

// Re-importing TagEditor
import TagEditor from "./tagEditor";

import { deleteUrlsFromBucket } from "../../../../../../supabase/Lib/Announcement/AddPosts/storage";

// Import the universal types
import {
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
} from "../Utils/types";

// Define props based on universal types
export interface AddPostsProps {
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostUI | null;
  currentType?: "announcement" | "highlight";
  authorId?: string | null;
}

// Helper to check if a string is a known college code (avoids "global")
const isCollegeCode = (vis: string | null | undefined): boolean => {
  if (!vis) return false;
  return vis !== "global";
};

export default function AddPosts({
  onAddPost,
  externalOpen,
  onExternalClose,
  initialPost = null,
  onUpdatePost,
  currentType = "announcement",
  authorId = null,
}: AddPostsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Visibility state
  const [visibleTo, setVisibleTo] = useState<"global" | "college">("global");
  const [visibleCollege, setVisibleCollege] = useState<string | null>(null);
  const [isAudienceSelectorOpen, setIsAudienceSelectorOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [postType, setPostType] = useState<"announcement" | "highlight">(
    currentType ?? "announcement"
  );

  const [predefinedImages, setPredefinedImages] = useState<string[]>([]);
  const uploadRef = useRef<UploadButtonHandle>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof externalOpen === "boolean") setIsOpen(externalOpen);
  }, [externalOpen]);

  useEffect(() => {
    setPostType(currentType ?? "announcement");
  }, [currentType]);

  // Logic to populate form when editing
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      const descWithoutTags =
        initialPost.description?.replace(/\s*#\S+/g, "").trim() || "";
      setDescription(descWithoutTags);
      setTags(initialPost.tags ?? []);
      setPredefinedImages(initialPost.images ?? []);
      setPostType(initialPost.type ?? currentType ?? "announcement");

      const vis = initialPost.visibility;
      if (isCollegeCode(vis)) {
        setVisibleTo("college");
        setVisibleCollege(vis);
      } else {
        setVisibleTo("global");
        setVisibleCollege(null);
      }
      setIsOpen(true);
    }
  }, [initialPost, currentType]);

  const openAudienceSelector = () => {
    setIsAudienceSelectorOpen(true);
  };

  // Function to handle selection FROM the audience selector
  const handleAudienceSelect = (
    newVisibleTo: "global" | "college",
    newCollege: string | null
  ) => {
    setVisibleTo(newVisibleTo);
    setVisibleCollege(newCollege);
  };

  // Logic to reset form when opening for a new post
  useEffect(() => {
    if (isOpen && !initialPost) {
      clearLocalForm();
      setPostType(currentType ?? "announcement");
    }
  }, [isOpen, initialPost, currentType]);

  // Auto-resize textarea
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210); // Max height 210px
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  // addTag and removeTag are passed as props to TagEditor
  const addTag = (t: string) => {
    const newTag = t.trim().replace(/\s+/g, "-"); // Ensure single-word tags
    if (newTag && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const clearLocalForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setPredefinedImages([]);
    setVisibleTo("global");
    setVisibleCollege(null);
  };

  const resetForm = () => {
    setIsOpen(false);
    setIsAudienceSelectorOpen(false); // Also reset audience selector on close
    clearLocalForm();
    if (onExternalClose) onExternalClose();
  };

  // Main submit logic (unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const uploadedImageUrls = uploadRef.current
        ? await uploadRef.current.uploadAndGetFinalUrls()
        : [];
      const uniqueImages = Array.from(new Set(uploadedImageUrls));
      const removedUrls = uploadRef.current?.getRemovedUrls() ?? [];

      const tagString = tags.length
        ? " " + tags.map((t) => `#${t}`).join(" ")
        : "";
      const combinedDescription = description.trim() + tagString;

      if (!authorId) throw new Error("Author ID not found");

      const visibilityToStore: string | null =
        postType === "highlight"
          ? "global"
          : postType === "announcement"
          ? visibleTo === "global"
            ? "global"
            : visibleCollege ?? null
          : null;

      const payload = {
        title,
        description: combinedDescription,
        images: uniqueImages,
        tags,
        type: postType,
        visibility: visibilityToStore,
      };

      if (initialPost && onUpdatePost) {
        if (!initialPost.id) throw new Error("Post id missing. Cannot update.");

        const updatePayload: UpdatePostPayload = {
          ...payload,
          id: initialPost.id,
        };
        await onUpdatePost(updatePayload);
        await deleteUrlsFromBucket(removedUrls);
      } else if (onAddPost) {
        const createPayload: NewPostPayload = {
          ...payload,
          author_id: authorId,
        };
        await onAddPost(createPayload);
        await deleteUrlsFromBucket(removedUrls);
      }

      resetForm();
      router.refresh();
    } catch (err) {
      console.error("Failed to create/update post:", err);
      alert("Failed to create/update post.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  // Determine modal title
  const modalTitle = initialPost
    ? `Edit ${postType === "announcement" ? "Announcement" : "Highlight"}`
    : `Add ${postType === "announcement" ? "Announcement" : "Highlight"}`;

  // ---
  // --- NEW MODAL UI (WITH CONDITIONAL RENDERING) ---
  // ---
  const modalContent = (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4 modal-root">
      {/* This is the main change. The content of the modal
        is now conditional based on `isAudienceSelectorOpen`
      */}
      <div className="bg-white rounded-2xl w-[700px] shadow-xl max-h-[90vh]">
        {isAudienceSelectorOpen ? (
          // --- STATE 1: SHOW AUDIENCE SELECTOR ---
          <PostAudienceSelector
            currentVisibleTo={visibleTo}
            currentVisibleCollege={visibleCollege}
            onSelectAudience={handleAudienceSelect}
            onClose={() => setIsAudienceSelectorOpen(false)} // For the back arrow
          />
        ) : (
          // --- STATE 2: SHOW POST FORM ---
          <>
            {/* 1. Header */}
            <div className="flex justify-between items-center p-[10px] border-b border-gray-200">
              <h1 className="flex-1 font-montserrat text-[40px] text-center font-semibold text-black">
                {modalTitle}
              </h1>
              <button
                type="button"
                onClick={resetForm}
                className="text-black cursor-pointer"
              >
                <X size={40} />
              </button>
            </div>

            {/* 2. Scrollable Form Area */}
            <form
              id="add-post-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[calc(90vh-160px)]" // 160px = header + footer height
            >
              {/* User Info & Visibility */}
              <div className="flex items-center gap-3">
                <Image
                  src="/Cit Logo.svg" // Make sure this path is correct
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
                      onClick={openAudienceSelector} // This triggers the change
                      className="cursor-pointer flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
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

                  {/* Case 2: Highlight (Disabled, no icon) */}
                  {postType === "highlight" && (
                    <button
                      type="button"
                      disabled
                      className="flex items-center text-sm text-gray-500 cursor-not-allowed" // Disabled styling
                    >
                      {/* Icon removed */}
                      <span>Global</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The old college text input is REMOVED from here,
                as the PostAudienceSelector now handles it.
              */}

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
                  onChange={(e) => setTitle(e.target.value)}
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
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    handleInput();
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
                  onTagAdd={addTag}
                  onTagRemove={removeTag}
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block mb-2 text-[20px] font-medium text-black font-montserrat">
                  Attachment (Optional)
                </label>
                <UploadButton
                  key={initialPost?.id ?? "new"}
                  ref={uploadRef}
                  predefinedImages={predefinedImages}
                />
              </div>
            </form>

            {/* 3. Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                type="submit"
                form="add-post-form"
                disabled={loading}
                className="w-full text-white bg-maroon hover:bg-maroon/90 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:bg-gray-400"
              >
                {loading
                  ? "Publishing..."
                  : initialPost
                  ? "Save Changes"
                  : "Publish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ---
  // --- EXISTING MODAL TRIGGER ---
  // ---
  return (
    <>
      <div className="relative bg-gold w-[590px] h-[80px] rounded-[15px] p-[5px]">
        <div className="bg-darkmaroon w-[580px] h-[70px] rounded-[10px] flex px-[15px] justify-center items-center">
          <Image
            src="/Cit Logo.svg"
            alt="Cit Logo"
            width={55}
            height={55}
            draggable={false}
          />
          <button
            type="button"
            className="w-[490px] h-[45px] rounded-[20px] mx-[10px] bg-[#E0E0E0] cursor-pointer hover:brightness-105"
            onClick={() => {
              onExternalClose?.();
              clearLocalForm();
              setPostType(currentType ?? "announcement");
              setIsOpen(true);
            }}
          >
            <p className="font-montserrat text-[18px] text-black/70 ml-4 text-left font-medium">
              {currentType === "highlight"
                ? "Create highlight..."
                : "Create announcement..."}
            </p>
          </button>
        </div>
      </div>
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
