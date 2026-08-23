"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PostUI, NewPostPayload, UpdatePostPayload } from "../utils/types";
import { getAnnouncementTags } from "@/database/supabase/Announcement/getAnnouncementTags";
import { uploadAnnouncementImage } from "@/database/supabase/Announcement";

export interface UseAddPostFormProps {
  initialPost?: PostUI | null;
  currentType?: "announcement";
  authorId?: string | null;
  onAddPost?: (post: NewPostPayload) => Promise<void> | void;
  onUpdatePost?: (post: UpdatePostPayload) => Promise<void> | void;
  onClose: () => void;
}

const isCollegeCode = (vis: string | null | undefined): boolean => {
  if (!vis) return false;
  return vis !== "global";
};

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
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [postType, setPostType] = useState<"announcement">(currentType);

  // Suggested tags
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setPostType(currentType ?? "announcement");
  }, [currentType]);

  // Fetch previously used tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await getAnnouncementTags();
      if (!error && data) {
        setSuggestedTags(data);
      }
    };

    fetchTags();
  }, [postType]);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      const descWithoutTags =
        initialPost.description?.replace(/\s*#\S+/g, "").trim() || "";
      setDescription(descWithoutTags);
      setImages(initialPost.images ?? []);
      setTags(initialPost.tags ?? []);
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

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 210);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 210 ? "auto" : "hidden";
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    const currentUserId = authorId || initialPost?.author_id;
    if (!currentUserId) {
      alert("Please make sure you are logged in before uploading images.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map((file) =>
        uploadAnnouncementImage(file, currentUserId)
      );
      const results = await Promise.all(uploadPromises);

      const successfulUrls = results
        .filter((r) => !r.error && r.url)
        .map((r) => r.url as string);

      if (successfulUrls.length > 0) {
        setImages((prev) => [...prev, ...successfulUrls]);
      }

      if (successfulUrls.length < fileArray.length) {
        alert("Some images could not be uploaded. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images.");
    } finally {
      if (isMountedRef.current) setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
    setImages([]);
    setTags([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isUploadingImage) return;
    setLoading(true);

    try {
      const tagString = tags.length
        ? " " + tags.map((t) => `#${t}`).join(" ")
        : "";
      const combinedDescription = description.trim() + tagString;

      if (!authorId && !initialPost) throw new Error("Author ID not found");

      const visibilityToStore: string | null =
        visibleTo === "global"
          ? "global"
          : visibleCollege ?? null;

      const payload = {
        title,
        description: combinedDescription,
        images: images.length > 0 ? images : null,
        tags: tags.length > 0 ? tags : null,
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
      } else if (onAddPost && authorId) {
        const createPayload: NewPostPayload = {
          ...payload,
          author_id: authorId,
        };
        await onAddPost(createPayload);
      }

      onClose();
      router.refresh();
    } catch (err) {
      console.error("Failed to create/update announcement:", err);
      alert("Failed to create/update announcement.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const modalTitle = initialPost
    ? "Edit Announcement"
    : "Create Announcement";

  return {
    state: {
      loading,
      visibleTo,
      visibleCollege,
      isAudienceSelectorOpen,
      title,
      description,
      images,
      isUploadingImage,
      tags,
      postType,
      modalTitle,
      suggestedTags,
    },
    refs: {
      textareaRef,
    },
    handlers: {
      handleSubmit,
      handleAudienceSelect,
      handleInput,
      handleImageUpload,
      handleRemoveImage,
      addTag,
      removeTag,
      openAudienceSelector: () => setIsAudienceSelectorOpen(true),
      closeAudienceSelector: () => setIsAudienceSelectorOpen(false),
      setTitle,
      setDescription,
    },
  };
};
