// src/components/UploadButton/ImagePreview.tsx

"use client";

import { X } from "lucide-react";
import Image from "next/image"; // 1. Import Image from next/image

interface ImagePreviewProps {
  imageSources: (string | File)[];
  getPreviewUrl: (source: string | File) => string;
  onRemove: (source: string | File) => void;
}

export const ImagePreview = ({
  imageSources,
  getPreviewUrl,
  onRemove,
}: ImagePreviewProps) => {
  if (imageSources.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-[5px] mb-3">
      {" "}
      {imageSources.map((source, index) => {
        const previewUrl = getPreviewUrl(source);
        return (
          <div
            key={previewUrl + index}
            className="relative group aspect-square" // Parent is already 'relative', which 'fill' needs
          >
            {/* 2. Replaced <img> with <Image> */}{" "}
            <Image
              src={previewUrl}
              alt="upload preview"
              fill
              className="object-cover rounded-md bg-white" // 4. Removed w-full and h-full from className
              sizes="(max-width: 640px) 100vw, 50vw" // 5. Added sizes prop for optimization
            />{" "}
            <button
              type="button"
              onClick={() => onRemove(source)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition z-10"
            >
              <X size={14} />{" "}
            </button>{" "}
          </div>
        );
      })}{" "}
    </div>
  );
};
