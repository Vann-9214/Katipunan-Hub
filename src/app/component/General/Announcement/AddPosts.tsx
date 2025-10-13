"use client";

import UploadButton, { UploadButtonHandle } from "./UploadButton";
import Button from "../../ReusableComponent/Buttons";
import { Combobox } from "../../ReusableComponent/Combobox";
import TagsFilter from "./TagsFilter";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageButton } from "../../ReusableComponent/Buttons";
import { useRouter } from "next/navigation";

interface PostShape {
  id?: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight";
  visibleTo?: "global" | "college";
  visibleCollege?: string | null;
  author_id?: string;
  visibility?: string | null;
}

interface UserSummary {
  id: string;
  fullName?: string | null;
  avatarURL?: string | null;
}

interface AddPostsProps {
  onAddPost?: (post: {
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
    author_id?: string | undefined;
  }) => Promise<void> | void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  initialPost?: PostShape | null;
  onUpdatePost?: (updated: {
    id: string;
    title: string;
    description: string;
    images: string[];
    tags: string[];
    type: "announcement" | "highlight";
    visibility?: string | null;
  }) => Promise<void> | void;
  currentType?: "announcement" | "highlight";
  author?: UserSummary | null;
  authorId?: string | null;
}

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
  const isMountedRef = useRef(true); // guard to prevent setting state after unmount
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<"announcement" | "highlight">(
    currentType ?? "announcement"
  );

  // 🔹 Add ref to UploadButton
  const uploadRef = useRef<UploadButtonHandle>(null);

  const collegeitems = [
    {
      value: "cea",
      label: "Engineering and Architecture (CEA)",
      selectedPlaceholder: "CEA",
    },
    {
      value: "cba",
      label: "Business Administration (CBA)",
      selectedPlaceholder: "CBA",
    },
    {
      value: "cas",
      label: "Arts and Sciences (CAS)",
      selectedPlaceholder: "CAS",
    },
    {
      value: "ccs",
      label: "Computer Studies (CCS)",
      selectedPlaceholder: "CCS",
    },
    { value: "coed", label: "Education (COED)", selectedPlaceholder: "COED" },
    { value: "con", label: "Nursing (CON)", selectedPlaceholder: "CON" },
    {
      value: "chtm",
      label: "Hospitality and Tourism Management (CHTM)",
      selectedPlaceholder: "CHTM",
    },
    { value: "claw", label: "Law (CLAW)", selectedPlaceholder: "CLAW" },
    { value: "cah", label: "Allied Health (CAH)", selectedPlaceholder: "CAH" },
    {
      value: "cit",
      label: "Industrial Technology (CIT)",
      selectedPlaceholder: "CIT",
    },
    { value: "cagr", label: "Agriculture (CAGR)", selectedPlaceholder: "CAGR" },
  ];

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
      setImages(initialPost.images ?? []);
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

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleUpload = (urls: string[]) => {
    if (!Array.isArray(urls)) return;
    setImages(urls);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const clearLocalForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setImages([]);
    setTagInput("");
    setVisibleTo("global");
    setVisibleCollege(null);
  };

  const resetForm = () => {
    setIsOpen(false);
    clearLocalForm();
    if (onExternalClose) onExternalClose();
  };

  // 🔹 Updated handleSubmit to await uploads
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 🔹 Wait for uploads to complete and get real public URLs
      const uploadedImages = uploadRef.current
        ? await uploadRef.current.uploadFiles(null)
        : images;

      const uniqueImages = Array.from(new Set(uploadedImages));

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
      } else if (onAddPost) {
        await onAddPost(createPayload);
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
            <>
              <h2 className="text-[24px] font-montserrat">Visible To</h2>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Button
                  text="Global"
                  bg={visibleTo === "global" ? "bg-maroon" : "bg-gray-200"}
                  textcolor={
                    visibleTo === "global" ? "text-white" : "text-black"
                  }
                  height="h-[45px]"
                  rounded="rounded-[30px]"
                  onClick={() => {
                    setVisibleTo("global");
                    setVisibleCollege(null);
                  }}
                  width="w-full"
                  className="border border-black"
                />
                <Button
                  text="College"
                  bg={visibleTo === "college" ? "bg-maroon" : "bg-gray-200"}
                  textcolor={
                    visibleTo === "college" ? "text-white" : "text-black"
                  }
                  height="h-[45px]"
                  rounded="rounded-[30px]"
                  onClick={() => setVisibleTo("college")}
                  width="w-full"
                  className="border border-black"
                />
                <Combobox
                  items={collegeitems}
                  placeholder="Select College"
                  buttonHeight="h-[45px]"
                  disabled={visibleTo !== "college"}
                  width="w-full"
                  onChange={(val) => setVisibleCollege(val || null)}
                />
              </div>
            </>
          )}

          <div className="flex flex-col">
            <div className="flex mb-2 gap-4">
              <h2 className="text-[24px] font-montserrat text-black">Tags</h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Add tags..."
                  className="w-[300px] h-10 rounded-full border border-gray-300 px-4 text-[16px] placeholder-gray-400 focus:outline-none focus:ring-1"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="h-10 w-10 rounded-full border border-black inline-flex items-center justify-center bg-white text-[20px] font-semibold hover:scale-105 transition"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-3">
              <TagsFilter mode="edit" tags={tags} onTagRemove={removeTag} />
            </div>
          </div>

          {/* Upload control with ref */}
          <UploadButton
            key={initialPost?.id ?? "new"}
            ref={uploadRef} // 🔹 important
            onUpload={handleUpload}
            predefinedImages={images}
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
