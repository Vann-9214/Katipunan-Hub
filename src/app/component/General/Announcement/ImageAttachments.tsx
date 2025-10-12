"use client";

import React from "react";
import { FastAverageColor } from "fast-average-color";

interface ImageAttachmentsProps {
  images: string[];
}

export default function ImageAttachments({ images }: ImageAttachmentsProps) {
  const count = images.length;

  // No images: render nothing
  if (count === 0) return <></>;

  const gridBase = "w-full h-[450px] mt-2 overflow-hidden";

  // 1 image -> use SingleColorImage (hooks inside that component)
  if (count === 1) {
    return <SingleColorImage src={images[0]} />;
  }

  // 2 images -> use ColorMatchedImage for each tile
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-[1.6px] w-full mt-2">
        {images.slice(0, 2).map((src, idx) => (
          <ColorMatchedImage
            key={idx}
            src={src}
            minHeightClass="min-h-[300px]"
            maxHeight="65vh"
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

/* ---------------------------
   SingleColorImage
   - Handles the 1-image case
   - Uses FastAverageColor inside useEffect (hooks are local here)
   --------------------------- */
function SingleColorImage({ src }: { src: string }) {
  const [bgColor, setBgColor] = React.useState("#000");
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
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
            resolve(); // still resolve, we’ll fallback color
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
          setBgColor("#000");
        }
      } catch (err) {
        console.warn("FAC failed:", err);
        if (!cancelled) setBgColor("#000");
      } finally {
        if (typeof fac.destroy === "function") fac.destroy();
      }
    };

    computeColor();
    return () => {
      cancelled = true;
      if (typeof fac.destroy === "function") fac.destroy();
    };
  }, [src]);

  return (
    <div
      className="w-full mt-2 flex items-center justify-center overflow-hidden min-h-[200px] transition-colors duration-500"
      style={{ backgroundColor: bgColor }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Attachment"
        className="w-full h-auto object-contain max-h-[80vh] block"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function ColorMatchedImage({
  src,
  minHeightClass = "min-h-[300px]",
  maxHeight = "65vh",
}: {
  src: string;
  minHeightClass?: string;
  maxHeight?: string;
}) {
  const [bgColor, setBgColor] = React.useState("#000");
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!imgRef.current) return;
    const fac = new FastAverageColor();
    const img = imgRef.current;

    const computeColor = async () => {
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
            resolve();
          };
          img.addEventListener("load", onLoad);
          img.addEventListener("error", onError);
        });
      }

      try {
        if (img.naturalWidth && img.naturalHeight) {
          const color = await fac.getColorAsync(img);
          if (!cancelled) setBgColor(color.hex);
        } else if (!cancelled) {
          setBgColor("#000");
        }
      } catch (err) {
        console.warn("FAC failed:", err);
        if (!cancelled) setBgColor("#000");
      } finally {
        if (typeof fac.destroy === "function") fac.destroy();
      }
    };

    computeColor();
    return () => {
      cancelled = true;
      if (typeof fac.destroy === "function") fac.destroy();
    };
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${minHeightClass} transition-colors duration-500`}
      style={{ backgroundColor: bgColor }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Attachment"
        className="w-full h-auto object-contain block"
        style={{ maxHeight }}
        crossOrigin="anonymous"
      />
    </div>
  );
}
