"use client";

import { forwardRef, useImperativeHandle } from "react";
// 1. FIX: Import from your 'types.ts' file (or whatever you named it)
import { UploadButtonProps, UploadButtonHandle } from "../Utils/types";
import { useImageUploader } from "../../../../../../supabase/Lib/Announcement/UploadButton/useImageUploader";
import { ImagePreview } from "./imagePreviewer"; // Using your file name
import { Dropzone } from "./dropzone"; // Using your file name

const UploadButton = forwardRef<UploadButtonHandle, UploadButtonProps>(
  ({ onUpload, predefinedImages = [] }, ref) => {
    const {
      imageSources,
      isDragging,
      getPreviewUrl,
      handleDrop,
      handleChange,
      handleDragOver,
      handleDragLeave,
      handleRemove,
      uploadAndGetFinalUrls,
      getRemovedUrls,
    } = useImageUploader({ predefinedImages, onUpload });

    // Expose methods to the parent component
    useImperativeHandle(ref, () => ({
      uploadAndGetFinalUrls,
      getRemovedUrls,
    }));

    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full border-2 rounded-md transition-all bg-customgray border-black p-[5px] ${
          isDragging ? "border-yellow-600 bg-yellow-50" : ""
        } max-h-[330px] overflow-y-auto`}
      >
        <ImagePreview
          imageSources={imageSources}
          getPreviewUrl={getPreviewUrl}
          onRemove={handleRemove}
        />

        <Dropzone isDragging={isDragging} onChange={handleChange} />
      </div>
    );
  }
);

UploadButton.displayName = "UploadButton";
export default UploadButton;

// 2. ADD THIS LINE: This makes the types available for AddPosts.tsx to import
export type { UploadButtonHandle, UploadButtonProps };
