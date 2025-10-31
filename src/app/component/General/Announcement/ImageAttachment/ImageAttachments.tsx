"use client";

import React from "react";
import Image from "next/image"; // --- 1. Import next/image ---
import { ColorBackedImage } from "./colorBackedImage";
import { useImageLightbox } from "./imageLightboxContent";

interface ImageAttachmentsProps {
  images: string[];
}

export default function ImageAttachments({ images }: ImageAttachmentsProps) {
  const count = images.length;
  const { openLightbox } = useImageLightbox();

  const handleClick = (index: number) => {
    openLightbox(images, index);
  };

  if (count === 0) return <></>;

  const gridBase = "w-full h-[450px] overflow-hidden";

  // 1 image
  if (count === 1) {
    return (
      <div onClick={() => handleClick(0)} className="cursor-pointer">
        <ColorBackedImage
          src={images[0]}
          alt="Attachment"
          containerClassName="w-full flex items-center justify-center overflow-hidden min-h-[200px] transition-colors duration-500"
          // --- 2. REVERTED: Added back w-full h-auto to fix the layout ---
          imageClassName="w-full h-auto object-contain max-h-[80vh] block"
        />
      </div>
    );
  }

  // 2 images
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-[1.6px] w-full">
        {images.slice(0, 2).map((src, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="cursor-pointer"
          >
            <ColorBackedImage
              src={src}
              alt={`Attachment ${idx}`}
              containerClassName="relative overflow-hidden flex items-center justify-center min-h-[300px] transition-colors duration-500"
              // --- 2. REVERTED: Added back w-full h-auto to fix the layout ---
              imageClassName="w-full h-auto object-contain block"
              imageStyle={{ maxHeight: "65vh" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3 images
  if (count === 3) {
    return (
      <div
        className={`grid grid-cols-2 grid-rows-2 gap-[1.6px] w-full ${gridBase}`}
      >
        <div
          onClick={() => handleClick(0)}
          className="relative col-span-1 row-span-2 bg-gray-200 overflow-hidden cursor-pointer group"
        >
          {/* --- 3. REPLACED <img> with <Image> --- */}
          <Image
            src={images[0]}
            alt="Attachment 1"
            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
            fill={true}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        <div
          onClick={() => handleClick(1)}
          className="relative bg-gray-200 overflow-hidden cursor-pointer group"
        >
          {/* --- 3. REPLACED <img> with <Image> --- */}
          <Image
            src={images[1]}
            alt="Attachment 2"
            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
            fill={true}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        <div
          onClick={() => handleClick(2)}
          className="relative bg-gray-200 overflow-hidden cursor-pointer group"
        >
          {/* --- 3. REPLACED <img> with <Image> --- */}
          <Image
            src={images[2]}
            alt="Attachment 3"
            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
            fill={true}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }

  // 4 images
  if (count === 4) {
    return (
      <div className={`grid grid-cols-2 gap-[1.6px] w-full ${gridBase}`}>
        {images.slice(0, 4).map((src, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="relative bg-gray-200 overflow-hidden cursor-pointer group"
          >
            {/* --- 3. REPLACED <img> with <Image> --- */}
            <Image
              src={src}
              alt={`Attachment ${idx}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
              fill={true}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5+ images
  const visible = images.slice(0, 5);
  const extra = count - 5;

  return (
    <div className={`grid grid-rows-2 gap-[1.6px] w-full ${gridBase}`}>
      <div className="grid grid-cols-3 gap-1">
        {visible.slice(0, 3).map((src, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="relative bg-gray-200 overflow-hidden cursor-pointer group"
          >
            {/* --- 3. REPLACED <img> with <Image> --- */}
            <Image
              src={src}
              alt={`Attachment ${idx}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
              fill={true}
              sizes="(max-width: 768px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1">
        {visible.slice(3, 5).map((src, idx) => {
          const actualIndex = idx + 3;
          return (
            <div
              key={idx}
              onClick={() => handleClick(actualIndex)}
              className="relative bg-gray-200 overflow-hidden cursor-pointer group"
            >
              {/* --- 3. REPLACED <img> with <Image> --- */}
              <Image
                src={src}
                alt={`Attachment ${actualIndex}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
                fill={true}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {idx === 1 && extra > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    +{extra}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
