"use client";

import { ChangeEvent } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

interface DropzoneProps {
  isDragging: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  hasImages: boolean;
}

export const Dropzone = ({
  isDragging,
  onChange,
  hasImages,
}: DropzoneProps) => {
  return (
    <label
      className={`
        relative flex flex-col items-center justify-center w-full 
        border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group
        ${hasImages ? "py-4 h-32" : "py-10 h-48"}
        ${
          isDragging
            ? "border-[#EFBF04] bg-[#EFBF04]/5"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
        }
      `}
    >
      <div className="flex flex-col items-center justify-center text-center px-4">
        {/* Animated Icon */}
        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className={`mb-3 p-3 rounded-full transition-colors ${
            isDragging
              ? "bg-[#EFBF04]/20 text-[#B48E00]"
              : "bg-gray-200 text-gray-500 group-hover:bg-gray-300 group-hover:text-gray-700"
          }`}
        >
          {hasImages ? <ImagePlus size={24} /> : <UploadCloud size={32} />}
        </motion.div>

        <p
          className={`mb-1 text-sm font-montserrat font-semibold transition-colors ${
            isDragging
              ? "text-[#B48E00]"
              : "text-gray-600 group-hover:text-gray-800"
          }`}
        >
          {isDragging
            ? "Drop images here"
            : hasImages
            ? "Add more images"
            : "Click or drag to upload"}
        </p>

        {!hasImages && (
          <p className="text-xs text-gray-400 font-ptsans group-hover:text-gray-500 transition-colors">
            SVG, PNG, JPG or GIF (max. 5MB)
          </p>
        )}
      </div>
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
