// src/components/UploadButton/Dropzone.tsx

"use client";

import { ChangeEvent } from "react";

interface DropzoneProps {
  isDragging: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const Dropzone = ({ isDragging, onChange }: DropzoneProps) => {
  return (
    <label
      className={`block w-full text-center border-2 rounded-md cursor-pointer transition py-6 ${
        isDragging
          ? "border-yellow-600 bg-yellow-50"
          : "border-black bg-gray-200"
      }`}
    >
      <span className="text-black font-medium">
        Drag & drop or click to upload images
      </span>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onChange}
      />
    </label>
  );
};
