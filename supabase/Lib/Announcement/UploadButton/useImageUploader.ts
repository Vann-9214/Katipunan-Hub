// supabase/Lib/Announcement/UploadButton/useImageUploader.ts

"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
// Make sure this path is correct for your project
import { uploadFileAndGetPublicUrl } from "./supabaseUpload"; 

interface UseImageUploaderProps {
  predefinedImages?: string[];
  onUpload?: (files: string[]) => void;
}

// 1. Create a stable, empty array OUTSIDE the hook.
//    This is the most important part of the fix.
const EMPTY_ARRAY: string[] = [];

export const useImageUploader = ({
  predefinedImages = EMPTY_ARRAY, // 2. Use the stable constant as the default
  onUpload,
}: UseImageUploaderProps) => {
  // 3. This initializer will now be stable when no prop is passed
  const [imageSources, setImageSources] = useState<(string | File)[]>(
    predefinedImages ?? [],
  );
  const [isDragging, setIsDragging] = useState(false);

  const fileToUrlMap = useRef<Map<File, string>>(new Map());
  const removedUrlsRef = useRef<string[]>([]);

  // 4. This effect is now safe. It will only run when the
  //    predefinedImages prop *actually* changes from the parent,
  //    not from the default value re-creating itself.
  useEffect(() => {
  // Avoid resetting state if nothing actually changed
  setImageSources((prev) => {
    const newImages = predefinedImages ?? [];
    const same =
      prev.length === newImages.length &&
      prev.every((p, i) => p === newImages[i]);
    if (same) return prev;
    removedUrlsRef.current = [];
    return newImages;
  });
}, [predefinedImages]);

  useEffect(() => {
    return () => {
      // cleanup blob URLs when unmounting
      fileToUrlMap.current.forEach((url) => URL.revokeObjectURL(url));
      fileToUrlMap.current.clear();
    };
  }, []);

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageSources((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
    e.currentTarget.value = ""; // reset input
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (source: string | File) => {
    if (typeof source === "string") {
      removedUrlsRef.current.push(source);
    }
    if (source instanceof File && fileToUrlMap.current.has(source)) {
      const blobUrl = fileToUrlMap.current.get(source)!;
      URL.revokeObjectURL(blobUrl);
      fileToUrlMap.current.delete(source);
    }
    const filtered = imageSources.filter((s) => s !== source);
    setImageSources(filtered);
    onUpload?.(filtered.filter((s): s is string => typeof s === "string"));
  };

  const getPreviewUrl = (source: string | File) => {
    if (typeof source === "string") return source;
    if (!fileToUrlMap.current.has(source)) {
      const url = URL.createObjectURL(source);
      fileToUrlMap.current.set(source, url);
    }
    return fileToUrlMap.current.get(source)!;
  };

  // Function for the imperative handle
  const uploadAndGetFinalUrls = async (): Promise<string[]> => {
    const uploadPromises: Promise<string | null>[] = [];
    const finalUrls: string[] = [];

    imageSources.forEach((source) => {
      if (typeof source === "string") {
        finalUrls.push(source);
      } else {
        // Assuming uploadFileAndGetPublicUrl exists and works
        uploadPromises.push(uploadFileAndGetPublicUrl(source));
      }
    });

    const newUrls = await Promise.all(uploadPromises);
    const allUrls = [
      ...finalUrls,
      ...newUrls.filter((url): url is string => !!url),
    ];
    onUpload?.(allUrls);
    return allUrls;
  };

  // Function for the imperative handle
  const getRemovedUrls = () => removedUrlsRef.current.slice();

  return {
    imageSources,
    isDragging,
    getPreviewUrl,
    handleDrop,
    handleChange,
    handleDragOver,
    handleDragLeave,
    handleRemove,
    uploadAndGetFinalUrls,
    getRemovedUrls,
  };
};