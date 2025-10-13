"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface UploadButtonProps {
  onUpload: (files: string[]) => void;
  predefinedImages?: string[]; // server URLs or previously saved image URLs
}

export default function UploadButton({
  onUpload,
  predefinedImages = [],
}: UploadButtonProps) {
  const supabase = createClientComponentClient(); // client Supabase instance

  // internal preview list (strings: either server URLs or blob: urls)
  const [images, setImages] = useState<string[]>(predefinedImages);
  const [isDragging, setIsDragging] = useState(false);

  // keep track of created blob URLs so we can revoke them on remove/unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // map blobUrl -> uploadPromise (optional, for dedupe)
  const pendingUploadsRef = useRef<Map<string, Promise<string | null>>>(
    new Map()
  );

  // Always sync to predefinedImages when that prop changes.
  useEffect(() => {
    setImages(predefinedImages ?? []);
  }, [predefinedImages]);

  // cleanup on unmount: revoke any blob URLs we created
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      blobUrlsRef.current.clear();
      pendingUploadsRef.current.clear();
    };
  }, []);

  // Helper: upload a File and return public URL (or null on failure)
  async function uploadFileAndGetPublicUrl(file: File): Promise<string | null> {
    try {
      const ext = (file.name.split(".").pop() || "bin").replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      // try get user id, fallback to "anon"
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id ?? "anon";

      // build a path: uid/uuid.ext
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
      const publicUrl = publicData?.publicUrl ?? null;
      return publicUrl;
    } catch (err) {
      console.error("uploadFileAndGetPublicUrl error", err);
      return null;
    }
  }

  // Called when user selects files (or drops them)
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // For each file: create blob preview immediately, then kick off upload and replace when finished
    Array.from(files).forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);

      // add blob preview if not already present
      setImages((prev) => {
        const next = Array.from(new Set([...prev, blobUrl]));
        onUpload(next);
        return next;
      });

      // if already uploading this blob, skip
      if (pendingUploadsRef.current.has(blobUrl)) return;

      // start upload
      const promise = uploadFileAndGetPublicUrl(file)
        .then((publicUrl) => {
          // if upload succeeded and we have a public URL, replace blobUrl with it
          setImages((prev) => {
            let next = prev.slice();
            const idx = next.indexOf(blobUrl);
            if (publicUrl) {
              if (idx !== -1) {
                next[idx] = publicUrl;
              } else {
                next = Array.from(new Set([...next, publicUrl]));
              }
            } else {
              // upload failed: keep blob preview so user can retry; optionally show alert
              // (you can also remove the preview here if you prefer)
            }
            // After replacement, revoke the blob url to free memory
            if (blobUrlsRef.current.has(blobUrl)) {
              try {
                URL.revokeObjectURL(blobUrl);
              } catch {}
              blobUrlsRef.current.delete(blobUrl);
            }

            // trigger parent with updated list (note: may contain remaining blobs if their uploads haven't finished)
            onUpload(next);
            return next;
          });

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
    // reset the input so same file can be selected again if needed
    e.currentTarget.value = "";
  };

  const handleRemove = (url: string) => {
    const filtered = images.filter((img) => img !== url);

    // if it was a blob URL we created, revoke it and remove from the set
    if (url.startsWith("blob:") && blobUrlsRef.current.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      blobUrlsRef.current.delete(url);
    }

    // Note: we do NOT attempt to delete uploaded file from storage here.
    // If you want delete-from-storage, implement a separate API to remove by path.
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
          Drag & drop or click to upload an image
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
