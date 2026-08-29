"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import ImageLightboxModal from "./ImageLightboxModal";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface UploadImageProps {
  images: string[];
  onUpload: (files: FileList | File[]) => void;
  onRemove: (index: number) => void;
  isUploading?: boolean;
}

export default function UploadImage({
  images,
  onUpload,
  onRemove,
  isUploading = false,
}: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      // Reset input so re-selecting the same file works
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Dropzone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#EFBF04] bg-[#FFF9E5]/60 scale-[1.01]"
            : "border-gray-300 hover:border-[#EFBF04] bg-white hover:bg-gray-50"
        } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B0E0E]" />
            <span className={`${ptSans.className} text-xs font-medium`}>
              Uploading image(s)...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1 text-center">
            <div className="p-2.5 rounded-full bg-red-50 text-[#8B0E0E]">
              <ImagePlus size={20} />
            </div>
            <p className={`${montserrat.className} text-xs font-bold text-gray-700`}>
              Click to upload <span className="font-normal text-gray-500">or drag and drop</span>
            </p>
            <p className={`${ptSans.className} text-[11px] text-gray-400`}>
              PNG, JPG, WEBP, GIF (Max 10MB per image)
            </p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              onClick={() => setPreviewIndex(idx)}
              className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm cursor-pointer"
            >
              <Image
                src={url}
                alt={`Uploaded image ${idx + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer z-10"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Uploaded Previews */}
      {images.length > 0 && (
        <ImageLightboxModal
          isOpen={previewIndex !== null}
          initialIndex={previewIndex ?? 0}
          images={images}
          title="Upload Preview"
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}
