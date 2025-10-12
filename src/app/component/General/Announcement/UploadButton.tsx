"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { X } from "lucide-react";

interface UploadButtonProps {
  onUpload: (files: string[]) => void;
  predefinedImages?: string[]; // server URLs or previously saved image URLs
}

export default function UploadButton({
  onUpload,
  predefinedImages = [],
}: UploadButtonProps) {
  // internal preview list (strings: either server URLs or blob: urls)
  const [images, setImages] = useState<string[]>(predefinedImages);
  const [isDragging, setIsDragging] = useState(false);

  // keep track of created blob URLs so we can revoke them on remove/unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Always sync to predefinedImages when that prop changes.
  // This ensures the preview matches parent form when entering edit mode or when parent updates.
  useEffect(() => {
    setImages(predefinedImages ?? []);
  }, [predefinedImages]);

  // cleanup on unmount: revoke any blob URLs we created
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      blobUrlsRef.current.add(url);
      return url;
    });

    // keep order: existing images first, then newly added
    const newImages = Array.from(new Set([...images, ...urls]));
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
    // reset the input so same file can be selected again if needed
    e.currentTarget.value = "";
  };

  const handleRemove = (url: string) => {
    const filtered = images.filter((img) => img !== url);

    // if it was a blob URL we created, revoke it and remove from the set
    if (url.startsWith("blob:") && blobUrlsRef.current.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      blobUrlsRef.current.delete(url);
    }

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
        ${
          isDragging ? "border-yellow-600 bg-yellow-50" : ""
        } max-h-[330px] overflow-y-auto`}
    >
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
