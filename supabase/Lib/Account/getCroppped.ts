import { Area } from "react-easy-crop";

/**
 * Creates a new, CIRCULAR image file (Blob) from a source image and crop data.
 * @param imageSrc - The base64 or URL source of the image.
 * @param crop - The pixel area to crop.
 * @returns {Promise<Blob | null>} A Promise that resolves with the cropped image as a Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area
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

  // --- Start of Circle Clip Logic ---

  // 1. Draw a circle in the center
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
  // 2. Use the circle as a clipping mask
  ctx.clip();

  // --- End of Circle Clip Logic ---

  // 3. Draw the image inside the clipping mask
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