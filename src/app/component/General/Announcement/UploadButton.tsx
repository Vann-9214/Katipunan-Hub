// app/component/Post/UploadButton.tsx
"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import { X } from "lucide-react";

interface UploadButtonProps {
  onUpload: (files: string[]) => void;
  predefinedImages?: string[];
}

export default function UploadButton({
  onUpload,
  predefinedImages = [],
}: UploadButtonProps) {
  const [images, setImages] = useState<string[]>(predefinedImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    const newImages = [...images, ...urls];
    setImages(newImages);
    onUpload(newImages);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = (url: string) => {
    const filtered = images.filter((img) => img !== url);
    setImages(filtered);
    onUpload(filtered);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`w-full border-2 rounded-md transition-all bg-gray-200 border-[#732626] p-[5px] 
        ${isDragging ? "border-yellow-600 bg-yellow-50" : ""}
        max-h-[330px] overflow-y-auto`}
    >
      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-[5px] mb-3">
          {images.map((url) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt="uploaded"
                className="w-full h-full object-cover rounded-md bg-white"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Zone */}
      <label
        className={`block w-full text-center border-2 border-dashed rounded-md cursor-pointer transition py-6 ${
          isDragging ? "border-yellow-600 bg-yellow-50" : "border-[#732626]"
        }`}
      >
        <span className="text-[#732626] font-medium">
          Drag & drop or click to upload an image
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
