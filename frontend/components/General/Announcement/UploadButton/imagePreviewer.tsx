"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="grid grid-cols-2 gap-3 mb-4">
      <AnimatePresence mode="popLayout">
        {imageSources.map((source, index) => {
          const previewUrl = getPreviewUrl(source);
          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              key={previewUrl + index}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100"
            >
              <Image
                src={previewUrl}
                alt="upload preview"
                fill
                className="object-contain" // Changed to object-contain to fit image without zooming/cropping
                sizes="(max-width: 640px) 50vw, 50vw"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />

              <button
                type="button"
                onClick={() => onRemove(source)}
                className="absolute top-1.5 right-1.5 p-1 bg-white/80 hover:bg-red-500 text-gray-600 hover:text-white rounded-full shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-105 cursor-pointer z-10"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
