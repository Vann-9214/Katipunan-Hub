"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PostUI, NewPostPayload, UpdatePostPayload } from "../utils/types";
import { getAnnouncementTags } from "@/database/supabase/Announcement/getAnnouncementTags";

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
    if (loading) return;
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
        images: null,
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
      addTag,
      removeTag,
      openAudienceSelector: () => setIsAudienceSelectorOpen(true),
      closeAudienceSelector: () => setIsAudienceSelectorOpen(false),
      setTitle,
      setDescription,
    },
  };
};
