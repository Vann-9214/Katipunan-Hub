// src/hooks/useImageUploader.ts

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { uploadFileAndGetPublicUrl } from "./supabaseUpload";

interface UseImageUploaderProps {
  predefinedImages?: string[];
  onUpload?: (files: string[]) => void;
}

export const useImageUploader = ({
  predefinedImages = [],
  onUpload,
}: UseImageUploaderProps) => {
  // store mixed strings (existing URLs) and File objects (new uploads)
  const [imageSources, setImageSources] = useState<(string | File)[]>(
    predefinedImages ?? []
  );
  const [isDragging, setIsDragging] = useState(false);

  // map for blob URLs for previewing File objects
  const fileToUrlMap = useRef<Map<File, string>>(new Map());

  // track which existing URLs the user removed
  const removedUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    setImageSources(predefinedImages ?? []);
    // reset removedUrls when predefined images change
    removedUrlsRef.current = [];
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