"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PostUI, NewPostPayload, UpdatePostPayload } from "@/app/component/General/Announcement/Utils/types";
import type { UploadButtonHandle } from "@/app/component/General/Announcement/Utils/types";
import { deleteUrlsFromBucket } from "./storage";

// Props Interface
export interface UseAddPostFormProps {
  initialPost?: PostUI | null;
  currentType?: "announcement" | "highlight";
  authorId?: string | null;
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  onClose: () => void;
}

// Helper Function
const isCollegeCode = (vis: string | null | undefined): boolean => {
  if (!vis) return false;
  return vis !== "global";
};

// The Hook
export const useAddPostForm = ({
  initialPost = null,
  currentType = "announcement",
  authorId = null,
  onAddPost,
  onUpdatePost,
  onClose,
}: UseAddPostFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [visibleTo, setVisibleTo] = useState<"global" | "college">("global");
  const [visibleCollege, setVisibleCollege] = useState<string | null>(null);
  const [isAudienceSelectorOpen, setIsAudienceSelectorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [postType, setPostType] =
    useState<"announcement" | "highlight">(currentType);
  const [predefinedImages, setPredefinedImages] = useState<string[]>([]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadRef = useRef<UploadButtonHandle>(null);
  const isMountedRef = useRef(true);

  // Effects
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setPostType(currentType ?? "announcement");
  }, [currentType]);

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
    } else {
      clearLocalForm();
      setPostType(currentType ?? "announcement");
    }
  }, [initialPost, currentType]);

  // Handlers
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  const addTag = (t: string) => {
    const newTag = t.trim().replace(/\s+/g, "-");
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

  const handleAudienceSelect = (
    newVisibleTo: "global" | "college",
    newCollege: string | null
  ) => {
    setVisibleTo(newVisibleTo);
    setVisibleCollege(newCollege);
  };

  // Supabase Submit Logic
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

      onClose();
      router.refresh();
    } catch (err) {
      console.error("Failed to create/update post:", err);
      alert("Failed to create/update post.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  // Derived State
  const modalTitle = initialPost
    ? `Edit ${postType === "announcement" ? "Announcement" : "Highlight"}`
    : `Add ${postType === "announcement" ? "Announcement" : "Highlight"}`;

  // Return values
  return {
    state: {
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
    },
    refs: {
      textareaRef,
      uploadRef,
    },
    handlers: {
      handleSubmit,
      handleAudienceSelect,
      handleInput,
      addTag,
      removeTag,
      openAudienceSelector: () => setIsAudienceSelectorOpen(true),
      closeAudienceSelector: () => setIsAudienceSelectorOpen(false),
      setTitle,
      setDescription,
    },
  };
};