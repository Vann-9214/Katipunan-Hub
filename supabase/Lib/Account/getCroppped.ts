import { Area } from "react-easy-crop";

/**
 * Creates a new image file (Blob) from a source image and crop data.
 * @param imageSrc - The base64 or URL source of the image.
 * @param crop - The pixel area to crop.
 * @param shape - The shape of the crop ('round' or 'rect'). Defaults to 'round'.
 * @returns {Promise<Blob | null>} A Promise that resolves with the cropped image as a Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area,
  shape: "round" | "rect" = "round" // 1. Added shape parameter with default to 'round'
): Promise<Blob | null> {
  const image = new Image();
  // Allow cross-origin images for canvas
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Set canvas size to the cropped size
  canvas.width = crop.width;
  canvas.height = crop.height;

  // --- Start of Clipping Logic ---

  // 2. Only apply circle clip if the shape is 'round'
  if (shape === "round") {
    ctx.beginPath();
    ctx.arc(
      crop.width / 2,
      crop.height / 2,
      crop.width / 2,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.clip();
  }

  // --- End of Clipping Logic ---

  // 3. Draw the image
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  // Get the new image as a PNG blob (to support transparency)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas is empty");
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/png"); // Force PNG for transparency
  });
}