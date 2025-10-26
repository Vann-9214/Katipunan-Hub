"use client";

import React from "react";

import { ColorBackedImage } from "./colorBackedImage";

interface ImageAttachmentsProps {
  images: string[];
}

export default function ImageAttachments({ images }: ImageAttachmentsProps) {
  const count = images.length;

  // No images: render nothing
  if (count === 0) return <></>;

  const gridBase = "w-full h-[450px] mt-2 overflow-hidden";

  // 1 image -> use ColorBackedImage with styles for a single image
  if (count === 1) {
    return (
      <ColorBackedImage
        src={images[0]}
        alt="Attachment"
        containerClassName="w-full mt-2 flex items-center justify-center overflow-hidden min-h-[200px] transition-colors duration-500"
        imageClassName="w-full h-auto object-contain max-h-[80vh] block"
      />
    );
  }

  // 2 images -> use ColorBackedImage with styles for a grid
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-[1.6px] w-full mt-2">
        {images.slice(0, 2).map((src, idx) => (
          <ColorBackedImage
            key={idx}
            src={src}
            alt={`Attachment ${idx}`}
            containerClassName="relative overflow-hidden flex items-center justify-center min-h-[300px] transition-colors duration-500"
            imageClassName="w-full h-auto object-contain block"
            imageStyle={{ maxHeight: "65vh" }}
          />
        ))}
      </div>
    );
  }

  // 3 images (unchanged)
  if (count === 3) {
    return (
      <div
        className={`grid grid-cols-2 grid-rows-2 gap-[1.6px] w-full ${gridBase}`}
      >
        <div className="relative col-span-1 row-span-2 bg-gray-200 overflow-hidden">
          <img
            src={images[0]}
            alt="Attachment 1"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="relative bg-gray-200 overflow-hidden">
          <img
            src={images[1]}
            alt="Attachment 2"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="relative bg-gray-200 overflow-hidden">
          <img
            src={images[2]}
            alt="Attachment 3"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // 4 images (unchanged)
  if (count === 4) {
    return (
      <div className={`grid grid-cols-2 gap-[1.6px] w-full ${gridBase}`}>
        {images.slice(0, 4).map((src, idx) => (
          <div key={idx} className="relative bg-gray-200 overflow-hidden">
            <img
              src={src}
              alt={`Attachment ${idx}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5+ images (unchanged)
  const visible = images.slice(0, 5);
  const extra = count - 5;

  return (
    <div className={`grid grid-rows-2 gap-[1.6px] w-full ${gridBase}`}>
      <div className="grid grid-cols-3 gap-1">
        {visible.slice(0, 3).map((src, idx) => (
          <div key={idx} className="relative bg-gray-200 overflow-hidden">
            <img
              src={src}
              alt={`Attachment ${idx}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1">
        {visible.slice(3, 5).map((src, idx) => (
          <div key={idx} className="relative bg-gray-200 overflow-hidden">
            <img
              src={src}
              alt={`Attachment ${idx + 3}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {idx === 1 && extra > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">+{extra}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
