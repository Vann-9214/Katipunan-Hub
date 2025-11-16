"use client";

import React from "react";
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

  // 1 image (Unchanged)
  if (count === 1) {
    return (
      <div onClick={() => handleClick(0)} className="cursor-pointer">
        <ColorBackedImage
          src={images[0]}
          alt="Attachment"
          containerClassName="w-full flex items-center justify-center overflow-hidden min-h-[200px] transition-colors duration-500"
          imageClassName="w-full h-auto object-contain max-h-[80vh] block"
        />
      </div>
    );
  }

  // 2 images (Unchanged)
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
              imageClassName="w-full h-auto object-contain block"
              imageStyle={{ maxHeight: "65vh" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3 images (Updated)
  if (count === 3) {
    return (
      <div
        className={`grid grid-cols-2 grid-rows-2 gap-[1.6px] w-full ${gridBase}`}
      >
        <div
          onClick={() => handleClick(0)}
          className="relative col-span-1 row-span-2 overflow-hidden cursor-pointer group"
        >
          {/* --- REPLACED Image with ColorBackedImage --- */}
          <ColorBackedImage
            src={images[0]}
            alt="Attachment 1"
            containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
            imageClassName="w-full h-full object-contain block"
          />
        </div>
        <div
          onClick={() => handleClick(1)}
          className="relative overflow-hidden cursor-pointer group"
        >
          {/* --- REPLACED Image with ColorBackedImage --- */}
          <ColorBackedImage
            src={images[1]}
            alt="Attachment 2"
            containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
            imageClassName="w-full h-full object-contain block"
          />
        </div>
        <div
          onClick={() => handleClick(2)}
          className="relative overflow-hidden cursor-pointer group"
        >
          {/* --- REPLACED Image with ColorBackedImage --- */}
          <ColorBackedImage
            src={images[2]}
            alt="Attachment 3"
            containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
            imageClassName="w-full h-full object-contain block"
          />
        </div>
      </div>
    );
  }

  // 4 images (Updated)
  if (count === 4) {
    return (
      <div className={`grid grid-cols-2 gap-[1.6px] w-full ${gridBase}`}>
        {images.slice(0, 4).map((src, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="relative overflow-hidden cursor-pointer group"
          >
            {/* --- REPLACED Image with ColorBackedImage --- */}
            <ColorBackedImage
              src={src}
              alt={`Attachment ${idx}`}
              containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
              imageClassName="w-full h-full object-contain block"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5+ images (Updated)
  const visible = images.slice(0, 5);
  const extra = count - 5;

  return (
    <div className={`grid grid-rows-2 gap-[1.6px] w-full ${gridBase}`}>
      <div className="grid grid-cols-3 gap-1">
        {visible.slice(0, 3).map((src, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="relative overflow-hidden cursor-pointer group"
          >
            {/* --- REPLACED Image with ColorBackedImage --- */}
            <ColorBackedImage
              src={src}
              alt={`Attachment ${idx}`}
              containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
              imageClassName="w-full h-full object-contain block"
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
              className="relative overflow-hidden cursor-pointer group"
            >
              {/* --- REPLACED Image with ColorBackedImage --- */}
              <ColorBackedImage
                src={src}
                alt={`Attachment ${actualIndex}`}
                containerClassName="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-500"
                imageClassName="w-full h-full object-contain block"
              />
              {/* This overlay logic is kept */}
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
