"use client";

import Image from "next/image";
import UploadButton, {
  type UploadButtonHandle,
} from "../UploadButton/uploadButton";
// import Button from "@/app/component/ReusableComponent/Buttons"; // 1. Removed broken import
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// import { ImageButton } from "@/app/component/ReusableComponent/Buttons"; // 2. Removed broken import
import { useRouter } from "next/navigation";

import VisibilitySettings from "./visibilitySettings";
import TagEditor from "./tagEditor";

import { deleteUrlsFromBucket } from "../../../../../../supabase/Lib/Announcement/AddPosts/storage";

// 3. Import the universal types
import {
  type PostUI,
  type NewPostPayload,
  type UpdatePostPayload,
} from "../Utils/types";

// 4. Define props based on universal types
export interface AddPostsProps {
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostUI | null; // 5. Changed from PostShape to PostUI
  currentType?: "announcement" | "highlight";
  authorId?: string | null;
}

// 6. Helper to check if a string is a known college code (avoids "global")
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

  // 7. Rewritten logic to handle `initialPost` of type `PostUI`
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      // This logic now correctly strips tags from the description for the editor
      const descWithoutTags =
        initialPost.description?.replace(/\s*#\S+/g, "").trim() || "";
      setDescription(descWithoutTags);
      setTags(initialPost.tags ?? []);
      setPredefinedImages(initialPost.images ?? []);
      setPostType(initialPost.type ?? currentType ?? "announcement");

      // Parse the `visibility` string
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

  useEffect(() => {
    if (isOpen && !initialPost) {
      clearLocalForm();
      setPostType(currentType ?? "announcement");
    }
  }, [isOpen, initialPost, currentType]);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  const addTag = (t: string) => {
    if (tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
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
    clearLocalForm();
    if (onExternalClose) onExternalClose();
  };

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
      // Save description with tags appended
      const combinedDescription = description.trim() + tagString;

      if (!authorId) throw new Error("Author ID not found");

      // Determine the final visibility string to save
      const visibilityToStore: string | null =
        postType === "highlight"
          ? "global" // Highlights are always global
          : postType === "announcement"
          ? visibleTo === "global"
            ? "global"
            : visibleCollege ?? null // Save college code or null
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
          author_id: authorId, // Author ID only needed for new posts
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

  const modalTitle = initialPost
    ? `Edit ${postType === "announcement" ? "Announcement" : "Highlight"}`
    : `New ${postType === "announcement" ? "Announcement" : "Highlight"}`;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[30px] w-[90%] max-w-[850px] h-[90%] max-h-[930px] p-8 overflow-y-auto">
        <h1 className="font-montserrat text-[40px] mb-4">{modalTitle}</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 font-montserrat"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter highlight title…"
            className="border border-black placeholder-white/80 px-5 bg-maroon text-white rounded-[20px] h-[55px] w-full p-2 focus:outline-none focus:ring-1"
            required
          />

          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleInput();
            }}
            placeholder="Enter detailed information to be shared with the community..."
            className="border border-black placeholder-white/80 px-5 bg-maroon text-white rounded-[20px] min-h-[100px] max-h-[210px] w-full p-2 focus:outline-none focus:ring-1 resize-none overflow-hidden"
            required
          />

          {postType === "announcement" && (
            <VisibilitySettings
              visibleTo={visibleTo}
              visibleCollege={visibleCollege}
              onVisibleToChange={setVisibleTo}
              onVisibleCollegeChange={setVisibleCollege}
            />
          )}

          <TagEditor
            width="w-full"
            tags={tags}
            onTagAdd={addTag}
            onTagRemove={removeTag}
          />

          <UploadButton
            key={initialPost?.id ?? "new"}
            ref={uploadRef}
            predefinedImages={predefinedImages}
          />

          <div className="flex justify-end gap-3">
            {/* 8. Replaced custom <Button> with standard <button> */}
            <button
              type="button"
              onClick={resetForm}
              className="text-[18px] rounded-[20px] w-[170px] h-[45px] border border-black text-black bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-[18px] rounded-[20px] w-[170px] h-[45px] border border-black bg-maroon text-white hover:bg-maroon/90 transition-colors disabled:bg-gray-400"
            >
              {loading
                ? "Publishing..."
                : initialPost
                ? "Save changes"
                : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
            className="w-[490px] h-[45px] rounded-[20px] mx-[10px] bg-[#E0E0E0] cursor-pointer hover:brightness-105"
            onClick={() => {
              onExternalClose?.();
              clearLocalForm();
              setPostType(currentType ?? "announcement");
              setIsOpen(true);
            }}
          >
            <p className="font-montserrat text-[18px] text-black/70 ml-4 text-left font-medium">
              Create announcement...
            </p>
          </button>
        </div>
      </div>
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
