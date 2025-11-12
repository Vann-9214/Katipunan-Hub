"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "../../../../../supabase/Lib/Account/getCroppped";
import { X } from "lucide-react";

interface AvatarUploadModalProps {
  onClose: () => void;
  /** Receives the final cropped image as a Blob */
  onSave: (croppedBlob: Blob) => void;
}

export default function AvatarUploadModal({
  onClose,
  onSave,
}: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onSave(croppedBlob); // Pass the blob to the parent
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">
            Update Profile Picture
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
          {!imageSrc ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <label className="px-6 py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-red-800 transition-colors cursor-pointer">
                Choose an image
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-3">
                We recommend a square image.
              </p>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round" // <-- This makes it a circle!
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {imageSrc && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imageSrc || isSaving}
            className="px-6 py-2 bg-maroon text-white font-semibold rounded-lg hover:bg-red-800 transition-colors
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
