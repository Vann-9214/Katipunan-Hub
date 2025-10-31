"use client";

import React from "react";
// No next/image import needed here
import { useAverageColor } from "../../../../../../supabase/Lib/Announcement/ImageAttachment/useAverageColor";

interface ColorBackedImageProps {
  src: string;
  alt: string;
  containerClassName: string;
  imageClassName: string;
  imageStyle?: React.CSSProperties;
}

export function ColorBackedImage({
  src,
  alt,
  containerClassName,
  imageClassName,
  imageStyle,
}: ColorBackedImageProps) {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  // Use the hook to get the color
  const bgColor = useAverageColor(imgRef, src);

  return (
    <div className={containerClassName} style={{ backgroundColor: bgColor }}>
      {/* This is the fix. 
        We are disabling the Next.js warning because for this specific
        flexible layout, the <img> tag is the correct tool.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={imageClassName}
        style={imageStyle}
        crossOrigin="anonymous"
      />
    </div>
  );
}
