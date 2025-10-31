"use client";

import { useState } from "react";
import Button, {
  ImageButton,
  TextButton,
} from "@/app/component/ReusableComponent/Buttons";

export default function ButtonPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUpload = (images: string[]) => {
    setUploadedImages(images);
    console.log("Uploaded images:", images);
  };

  return (
    <div className="p-6 flex flex-col items-center gap-6 min-h-screen bg-gray-50">
      <div className="flex gap-4">
        <Button text="Click Me" />
        <TextButton text="Hello" />
        <ImageButton src="Open Eye Icon.svg" />
      </div>

      {/* Display current image data (for debug/confirmation) */}
      {uploadedImages.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="font-medium text-gray-700 mb-2">Current Images:</h3>
          <ul className="list-disc list-inside bg-white p-3 rounded-md shadow-sm">
            {uploadedImages.map((img, index) => (
              <li key={index} className="truncate text-sm text-gray-600">
                {img}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
