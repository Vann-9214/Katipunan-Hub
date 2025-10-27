"use client";

import UploadButton, {
  type UploadButtonHandle,
} from "../UploadButton/uploadButton";
import Button from "@/app/component/ReusableComponent/Buttons";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageButton } from "@/app/component/ReusableComponent/Buttons";
import { useRouter } from "next/navigation";

import VisibilitySettings from "./visibilitySettings";
import TagEditor from "./tagEditor";

import { deleteUrlsFromBucket } from "../../../../../../supabase/Lib/Announcement/AddPosts/storage";
import {
  type AddPostsProps,
  type PostShape,
  type UserSummary,
} from "../Utils/types";

export default function AddPosts({
  onAddPost,
  externalOpen,
  onExternalClose,
  initialPost = null,
  onUpdatePost,
  currentType = "announcement",
  author = null,
  authorId = null,
}: AddPostsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [visibleTo, setVisibleTo] = useState<"global" | "college">("global");
  const [visibleCollege, setVisibleCollege] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  // const [tagInput, setTagInput] = useState(""); // <-- MOVED to TagEditor
  const [postType, setPostType] = useState<"announcement" | "highlight">(
    currentType ?? "announcement"
  );

  const [predefinedImages, setPredefinedImages] = useState<string[]>([]);
  const uploadRef = useRef<UploadButtonHandle>(null);

  // const supabase = createClientComponentClient(); // <-- REMOVED (no longer needed)

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

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      setDescription(
        initialPost.description?.replace(/\s*#\S+/g, "").trim() || ""
      );
      setTags(initialPost.tags ?? []);
      setPredefinedImages(initialPost.images ?? []);
      setPostType(initialPost.type ?? currentType ?? "announcement");
      setVisibleTo(initialPost.visibleTo ?? "global");
      setVisibleCollege(initialPost.visibleCollege ?? null);
      setIsOpen(true);
    }
  }, [initialPost, currentType]);

  useEffect(() => {
    if (isOpen && !initialPost) {
      clearLocalForm();
      setPostType(currentType ?? "announcement");
    }
  }, [isOpen]);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  // This function now receives the tag from the child
  const addTag = (t: string) => {
    if (tags.includes(t)) return; // Check for duplicates
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
    // setTagInput(""); // <-- MOVED
    setVisibleTo("global");
    setVisibleCollege(null);
  };

  const resetForm = () => {
    setIsOpen(false);
    clearLocalForm();
    if (onExternalClose) onExternalClose();
  };

  // --- These functions are now GONE ---
  // const getFilePathFromPublicUrl = ...
  // const deleteUrlsFromBucket = ...
  // ------------------------------------

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

      const resolvedAuthorId = authorId ?? author?.id ?? undefined;
      if (!resolvedAuthorId) throw new Error("Author not found");

      const visibilityToStore: string | null =
        postType === "highlight"
          ? "global"
          : postType === "announcement"
          ? visibleTo === "global"
            ? "global"
            : visibleCollege ?? null
          : null;

      const createPayload = {
        title,
        description: combinedDescription,
        images: uniqueImages,
        tags,
        type: postType,
        visibility: visibilityToStore,
        author_id: resolvedAuthorId,
      };

      if (initialPost && onUpdatePost) {
        if (!initialPost.id) throw new Error("Post id missing. Cannot update.");
        await onUpdatePost({ ...createPayload, id: initialPost.id });
        await deleteUrlsFromBucket(removedUrls); // <-- Use imported function
      } else if (onAddPost) {
        await onAddPost(createPayload);
        await deleteUrlsFromBucket(removedUrls); // <-- Use imported function
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

          {/* ===> USE THE NEW COMPONENT <=== */}
          {postType === "announcement" && (
            <VisibilitySettings
              visibleTo={visibleTo}
              visibleCollege={visibleCollege}
              onVisibleToChange={setVisibleTo}
              onVisibleCollegeChange={setVisibleCollege}
            />
          )}

          {/* ===> USE THE NEW COMPONENT <=== */}
          <TagEditor tags={tags} onTagAdd={addTag} onTagRemove={removeTag} />

          <UploadButton
            key={initialPost?.id ?? "new"}
            ref={uploadRef}
            predefinedImages={predefinedImages}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              text="Cancel"
              textSize="text-[18px]"
              type="button"
              rounded="rounded-[20px]"
              width="w-[170px]"
              height="h-[45px]"
              onClick={resetForm}
              className="border border-black"
            />
            <Button
              text={
                loading
                  ? "Publishing..."
                  : initialPost
                  ? "Save changes"
                  : "Publish"
              }
              textSize="text-[18px]"
              type="submit"
              width="w-[170px]"
              rounded="rounded-[20px]"
              height="h-[45px]"
              className="border border-black"
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative h-screen flex flex-col justify-end">
        <div className="sticky ml-110 bottom-0 flex justify-center pb-5">
          <ImageButton
            src="Plus Sign.svg"
            height={90}
            width={90}
            className="hover:scale-105 active:scale-95 transition-transform"
            onClick={() => {
              onExternalClose?.();
              clearLocalForm();
              setPostType(currentType ?? "announcement");
              setIsOpen(true);
            }}
          />
        </div>
      </div>
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
