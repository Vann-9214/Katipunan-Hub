// src/components/UploadButton/ImagePreview.tsx

"use client";

import { X } from "lucide-react";

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
    <div className="grid grid-cols-2 gap-[5px] mb-3">
      {imageSources.map((source, index) => {
        const previewUrl = getPreviewUrl(source);
        return (
          <div
            key={previewUrl + index}
            className="relative group aspect-square"
          >
            <img
              src={previewUrl}
              alt="upload preview"
              className="w-full h-full object-cover rounded-md bg-white"
            />
            <button
              type="button"
              onClick={() => onRemove(source)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
