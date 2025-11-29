"use client";

import { forwardRef, useImperativeHandle } from "react";
import { UploadButtonProps, UploadButtonHandle } from "../Utils/types";
import { useImageUploader } from "../../../../../../supabase/Lib/Announcement/UploadButton/useImageUploader";
import { ImagePreview } from "./imagePreviewer";
import { Dropzone } from "./dropzone";

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

    useImperativeHandle(ref, () => ({
      uploadAndGetFinalUrls,
      getRemovedUrls,
      isDirty: () => {
        if (imageSources.length !== predefinedImages.length) return true;
        const hasNewFile = imageSources.some((s) => s instanceof File);
        if (hasNewFile) return true;
        const currentUrls = imageSources as string[];
        return !currentUrls.every(
          (url, index) => url === predefinedImages[index]
        );
      },
    }));

    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="w-full"
      >
        <ImagePreview
          imageSources={imageSources}
          getPreviewUrl={getPreviewUrl}
          onRemove={handleRemove}
        />

        <Dropzone
          isDragging={isDragging}
          onChange={handleChange}
          hasImages={imageSources.length > 0}
        />
      </div>
    );
  }
);

UploadButton.displayName = "UploadButton";
export default UploadButton;
export type { UploadButtonHandle, UploadButtonProps };
