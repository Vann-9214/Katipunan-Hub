"use client";

import { useState, useEffect } from "react";
import { FastAverageColor } from "fast-average-color";

export function useAverageColor(
  imgRef: React.RefObject<HTMLImageElement | null>,
  src: string,
  defaultColor = "#E5E7EB" // A light gray fallback
) {
  const [bgColor, setBgColor] = useState(defaultColor);

  useEffect(() => {
    let cancelled = false;
    if (!imgRef.current) return;
    const fac = new FastAverageColor();
    const img = imgRef.current;

    const computeColor = async () => {
      // Wait for the image to load
      if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
        await new Promise<void>((resolve) => {
          const onLoad = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
            resolve(); // still resolve, we’ll use fallback color
          };
          img.addEventListener("load", onLoad);
          img.addEventListener("error", onError);
        });
      }

      try {
        // guard against broken or zero-size images
        if (img.naturalWidth && img.naturalHeight) {
          const color = await fac.getColorAsync(img);
          if (!cancelled) setBgColor(color.hex);
        } else if (!cancelled) {
          setBgColor(defaultColor);
        }
      } catch (err) {
        console.warn("FAC failed:", err);
        if (!cancelled) setBgColor(defaultColor);
      } finally {
        if (typeof fac.destroy === "function") fac.destroy();
      }
    };

    computeColor();
    return () => {
      cancelled = true;
      if (typeof fac.destroy === "function") fac.destroy();
    };
  }, [src, imgRef, defaultColor]);

  return bgColor;
}