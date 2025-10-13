"use client";

import {
  useState,
  useEffect,
  useRef,
  DragEvent,
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
} from "react";
import { X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface UploadButtonProps {
  onUpload?: (files: string[]) => void; // This prop is now less critical but kept for flexibility
  predefinedImages?: string[];
}

// 🔄 CHANGED: The handle interface is simplified.
export interface UploadButtonHandle {
  uploadAndGetFinalUrls: () => Promise<string[]>;
}

const UploadButton = forwardRef<UploadButtonHandle, UploadButtonProps>(
  ({ onUpload, predefinedImages = [] }, ref) => {
    const supabase = createClientComponentClient();
    // ✨ NEW: We now store a mix of existing URL strings and new File objects.
    const [imageSources, setImageSources] = useState<(string | File)[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // ✨ NEW: A map to hold temporary blob URLs for previewing File objects.
    const fileToUrlMap = useRef<Map<File, string>>(new Map());

    useEffect(() => {
      // Initialize with predefined images when the component loads or props change.
      setImageSources(predefinedImages ?? []);
    }, [predefinedImages]);

    // Effect for cleaning up blob URLs to prevent memory leaks.
    useEffect(() => {
      return () => {
        fileToUrlMap.current.forEach((url) => URL.revokeObjectURL(url));
        fileToUrlMap.current.clear();
      };
    }, []);

    // 🔄 RENAMED & REFACTORED: This function just handles file selection now, no uploading.
    const handleFileSelection = (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files);
      setImageSources((prev) => [...prev, ...newFiles]);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelection(e.dataTransfer.files);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelection(e.target.files);
      e.currentTarget.value = ""; // Reset file input
    };

    const handleRemove = (source: string | File) => {
      // If it's a file, revoke its blob URL before removing.
      if (source instanceof File && fileToUrlMap.current.has(source)) {
        const blobUrl = fileToUrlMap.current.get(source)!;
        URL.revokeObjectURL(blobUrl);
        fileToUrlMap.current.delete(source);
      }
      const filtered = imageSources.filter((s) => s !== source);
      setImageSources(filtered);
      onUpload?.(filtered.filter((s): s is string => typeof s === "string"));
    };

    // ✨ NEW HELPER: Generates a preview URL for rendering.
    const getPreviewUrl = (source: string | File) => {
      if (typeof source === "string") {
        return source; // It's already a URL.
      }
      // It's a File object, let's get or create a blob URL for it.
      if (!fileToUrlMap.current.has(source)) {
        const url = URL.createObjectURL(source);
        fileToUrlMap.current.set(source, url);
      }
      return fileToUrlMap.current.get(source)!;
    };

    async function uploadFileAndGetPublicUrl(
      file: File
    ): Promise<string | null> {
      try {
        const ext = (file.name.split(".").pop() || "bin").replace(
          /[^a-zA-Z0-9]/g,
          ""
        );
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id ?? "anon";
        const randomId = crypto.randomUUID();
        const path = `${uid}/${randomId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(path, file);

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return null;
        }

        const { data: publicData } = supabase.storage
          .from("posts")
          .getPublicUrl(path);
        return publicData?.publicUrl ?? null;
      } catch (err) {
        console.error("uploadFileAndGetPublicUrl error", err);
        return null;
      }
    }

    // 🔄 REFACTORED: The main logic is now here. This is called by the parent on submit.
    useImperativeHandle(ref, () => ({
      uploadAndGetFinalUrls: async (): Promise<string[]> => {
        const uploadPromises: Promise<string | null>[] = [];
        const finalUrls: string[] = [];

        imageSources.forEach((source) => {
          if (typeof source === "string") {
            // It's a pre-existing URL, just add it to our final list.
            finalUrls.push(source);
          } else {
            // It's a new File object that needs to be uploaded.
            uploadPromises.push(uploadFileAndGetPublicUrl(source));
          }
        });

        // Wait for all new uploads to complete.
        const newUrls = await Promise.all(uploadPromises);

        // Combine pre-existing URLs with newly uploaded URLs.
        const allUrls = [
          ...finalUrls,
          ...newUrls.filter((url): url is string => !!url),
        ];

        // Notify parent if needed.
        onUpload?.(allUrls);

        return allUrls;
      },
    }));

    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`w-full border-2 rounded-md transition-all bg-gray-200 border-[#732626] p-[5px] ${
          isDragging ? "border-yellow-600 bg-yellow-50" : ""
        } max-h-[330px] overflow-y-auto`}
      >
        {imageSources.length > 0 && (
          <div className="grid grid-cols-2 gap-[5px] mb-3">
            {imageSources.map((source, index) => {
              const previewUrl = getPreviewUrl(source);
              return (
                <div
                  key={previewUrl + index}
                  className="relative group aspect-square"
                >
                  <img
                    src={previewUrl}
                    alt="upload preview"
                    className="w-full h-full object-cover rounded-md bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(source)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <label
          className={`block w-full text-center border-2 border-dashed rounded-md cursor-pointer transition py-6 ${
            isDragging ? "border-yellow-600 bg-yellow-50" : "border-[#732626]"
          }`}
        >
          <span className="text-[#732626] font-medium">
            Drag & drop or click to upload imageses
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
          />
        </label>
      </div>
    );
  }
);

UploadButton.displayName = "UploadButton";
export default UploadButton;
