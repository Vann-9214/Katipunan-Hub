import { Area } from "react-easy-crop";

/**
 * Creates a new image file (Blob) from a source image and crop data.
 * @param imageSrc - The base64 or URL source of the image.
 * @param crop - The pixel area to crop.
 * @returns {Promise<Blob | null>} A Promise that resolves with the cropped image as a Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area
): Promise<Blob | null> {
  const image = new Image();
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

  // Draw the image on the canvas
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

  // Get the new image as a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas is empty");
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/png"); // You can change format here
  });
}