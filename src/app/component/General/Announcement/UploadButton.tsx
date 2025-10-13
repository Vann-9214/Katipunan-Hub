"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface UploadButtonProps {
  onUpload: (files: string[]) => void;
  predefinedImages?: string[];
}

export default function UploadButton({
  onUpload,
  predefinedImages = [],
}: UploadButtonProps) {
  const supabase = createClientComponentClient();
  const [images, setImages] = useState<string[]>(predefinedImages);
  const [isDragging, setIsDragging] = useState(false);

  const blobUrlsRef = useRef<Set<string>>(new Set());
  const pendingUploadsRef = useRef<Map<string, Promise<string | null>>>(
    new Map()
  );

  useEffect(() => {
    setImages(predefinedImages ?? []);
  }, [predefinedImages]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current.clear();
      pendingUploadsRef.current.clear();
    };
  }, []);

  async function uploadFileAndGetPublicUrl(file: File): Promise<string | null> {
    try {
      const ext = (file.name.split(".").pop() || "bin").replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id ?? "anon";

      const randomId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

      const path = `${uid}/${randomId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, file, { cacheControl: "3600", upsert: false });

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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);
      setImages((prev) => [...prev, blobUrl]);

      // start upload
      const promise = uploadFileAndGetPublicUrl(file)
        .then((publicUrl) => {
          if (!publicUrl) return null;

          setImages((prev) => {
            const next = prev.map((img) => (img === blobUrl ? publicUrl : img));
            onUpload(next);
            return next;
          });

          // cleanup blob
          if (blobUrlsRef.current.has(blobUrl)) {
            URL.revokeObjectURL(blobUrl);
            blobUrlsRef.current.delete(blobUrl);
          }

          return publicUrl;
        })
        .catch((err) => {
          console.error("upload error for file", err);
          return null;
        })
        .finally(() => {
          pendingUploadsRef.current.delete(blobUrl);
        });

      pendingUploadsRef.current.set(blobUrl, promise);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.currentTarget.value = "";
  };

  const handleRemove = (url: string) => {
    const filtered = images.filter((img) => img !== url);
    if (url.startsWith("blob:") && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
    setImages(filtered);
    onUpload(filtered);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`w-full border-2 rounded-md transition-all bg-gray-200 border-[#732626] p-[5px] 
        ${
          isDragging ? "border-yellow-600 bg-yellow-50" : ""
        } max-h-[330px] overflow-y-auto`}
    >
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-[5px] mb-3">
          {images.map((url) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt="uploaded"
                className="w-full h-full object-cover rounded-md bg-white"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`block w-full text-center border-2 border-dashed rounded-md cursor-pointer transition py-6 ${
          isDragging ? "border-yellow-600 bg-yellow-50" : "border-[#732626]"
        }`}
      >
        <span className="text-[#732626] font-medium">
          Drag & drop or click to upload an imagesss
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
