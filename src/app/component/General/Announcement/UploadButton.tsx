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
  onUpload?: (files: string[]) => void; // optional callback
  predefinedImages?: string[]; // existing server URLs to show initially
}

// exports both methods for parent to call
export interface UploadButtonHandle {
  uploadAndGetFinalUrls: () => Promise<string[]>;
  getRemovedUrls: () => string[];
}

const UploadButton = forwardRef<UploadButtonHandle, UploadButtonProps>(
  ({ onUpload, predefinedImages = [] }, ref) => {
    const supabase = createClientComponentClient();
    // store mixed strings (existing URLs) and File objects (new uploads)
    const [imageSources, setImageSources] = useState<(string | File)[]>(
      predefinedImages ?? []
    );
    const [isDragging, setIsDragging] = useState(false);

    // map for blob URLs for previewing File objects
    const fileToUrlMap = useRef<Map<File, string>>(new Map());

    // track which existing URLs the user removed (so parent can delete from bucket on save)
    const removedUrlsRef = useRef<string[]>([]);

    useEffect(() => {
      setImageSources(predefinedImages ?? []);
      // reset removedUrls when predefined images change (editing a different post)
      removedUrlsRef.current = [];
    }, [predefinedImages]);

    useEffect(() => {
      return () => {
        // cleanup blob URLs when unmounting
        fileToUrlMap.current.forEach((url) => URL.revokeObjectURL(url));
        fileToUrlMap.current.clear();
      };
    }, []);

    const handleFileSelection = (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files);
      setImageSources((prev) => [...prev, ...newFiles]);
      // we don't upload here; parent will call uploadAndGetFinalUrls when saving
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelection(e.dataTransfer.files);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelection(e.target.files);
      e.currentTarget.value = ""; // reset input so same file can be reselected if needed
    };

    const handleRemove = (source: string | File) => {
      // if removing an existing URL, record it for deletion later
      if (typeof source === "string") {
        removedUrlsRef.current.push(source);
      }
      // if removing a File, revoke its blob URL if present
      if (source instanceof File && fileToUrlMap.current.has(source)) {
        const blobUrl = fileToUrlMap.current.get(source)!;
        URL.revokeObjectURL(blobUrl);
        fileToUrlMap.current.delete(source);
      }
      const filtered = imageSources.filter((s) => s !== source);
      setImageSources(filtered);
      // notify parent with current string-URLs (useful for live-preview in parent)
      onUpload?.(filtered.filter((s): s is string => typeof s === "string"));
    };

    const getPreviewUrl = (source: string | File) => {
      if (typeof source === "string") return source;
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

    useImperativeHandle(ref, () => ({
      // uploads any File objects and returns combined final URLs (existing + new)
      uploadAndGetFinalUrls: async (): Promise<string[]> => {
        const uploadPromises: Promise<string | null>[] = [];
        const finalUrls: string[] = [];

        imageSources.forEach((source) => {
          if (typeof source === "string") {
            finalUrls.push(source);
          } else {
            uploadPromises.push(uploadFileAndGetPublicUrl(source));
          }
        });

        const newUrls = await Promise.all(uploadPromises);
        const allUrls = [
          ...finalUrls,
          ...newUrls.filter((url): url is string => !!url),
        ];
        onUpload?.(allUrls);
        return allUrls;
      },
      // return the list of existing URLs the user removed during editing
      getRemovedUrls: () => removedUrlsRef.current.slice(),
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
            Drag & drop or click to upload images
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
