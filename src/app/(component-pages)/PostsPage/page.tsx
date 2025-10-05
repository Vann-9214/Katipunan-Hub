"use client";

import { useEffect, useRef, useState } from "react";
import UploadButton from "@/app/component/General/Announcement/UploadButton";
import Posts from "@/app/component/General/Announcement/Posts";
import { image } from "framer-motion/client";

export default function PostsPage() {
  const [images, setImages] = useState<string[]>([]);

  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdUrlsRef.current.clear();
    };
  }, []);

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
