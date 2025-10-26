"use client";

import { useEffect, useRef, useState } from "react";
import UploadButton from "@/app/component/General/Announcement/UploadButton/UploadButton";
import Posts from "@/app/component/General/Announcement/General/Posts";
// Warning: 'image' is defined but never used. @typescript-eslint/no-unused-vars - REMOVED

export default function PostsPage() {
  const [images, setImages] = useState<string[]>([]);

  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // FIX: Capture the value of createdUrlsRef.current here
    const urlsToRevoke = createdUrlsRef.current;

    return () => {
      // Use the captured variable in the cleanup function
      urlsToRevoke.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      // You can still clear the ref, or simply rely on garbage collection
      // of the captured Set if you remove the clear().
    };
  }, []); // <--- Dependency array is empty, so it only runs on mount/unmount

  const handleUpload = (urls: string[]) => {
    urls.forEach((u) => createdUrlsRef.current.add(u));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <div>
      <Posts images={images} />
      <UploadButton onUpload={handleUpload} />
    </div>
  );
}
