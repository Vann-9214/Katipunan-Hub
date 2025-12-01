//
"use client";

import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "../../../../../supabase/Lib/Account/getCroppped";
import { X } from "lucide-react";

interface AvatarUploadModalProps {
  onClose: () => void;
  onSave: (croppedBlob: Blob) => void;
  isCoverPhoto?: boolean; // Default is false
}

export default function AvatarUploadModal({
  onClose,
  onSave,
  isCoverPhoto = false,
}: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onSave(croppedBlob);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const modalTitle = isCoverPhoto
    ? "Change Cover Photo"
    : "Change Profile Picture";
  const recommendText = isCoverPhoto
    ? "We recommend a landscape image."
    : "We recommend a square image.";

  const cropShape = isCoverPhoto ? "rect" : "round";
  const aspect = isCoverPhoto ? 16 / 9 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[25px] font-montserrat font-bold text-black">
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-500 cursor-pointer hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        {/* Cropper/Upload Area */}
        {/* UPDATED: Explicitly control styling based on isCoverPhoto.
            If isCoverPhoto is true, we remove ALL rounded classes from this container.
        */}
        <div
          className={`relative w-full h-80 bg-gray-100 overflow-hidden ${
            isCoverPhoto ? "" : "rounded-lg"
          }`}
          style={{
            borderRadius: isCoverPhoto ? "0px" : undefined,
            // Ensure mask doesn't get clipped by parent if needed
            clipPath: isCoverPhoto ? "none" : undefined,
          }}
        >
          {!imageSrc ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <button
                type="button"
                onClick={handleChangeClick}
                className="px-4 py-2 text-[18px] bg-maroon text-white font-semibold rounded-lg hover:bg-red-800 transition-colors cursor-pointer"
              >
                Choose an image
              </button>
              <p className="text-gray-500 text-[15px] mt-3">{recommendText}</p>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              // OPTIONAL: You can customize the style of the container/media directly if needed
              // style={{ containerStyle: { borderRadius: 0 } }}
            />
          )}
        </div>

        {/* Zoom Slider */}
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

        {/* Modal Footer */}
        <div className="mt-8 flex justify-end gap-3">
          {imageSrc && (
            <button
              type="button"
              onClick={handleChangeClick}
              disabled={isSaving}
              className="px-6 py-2 bg-black/50 text-white font-medium cursor-pointer rounded-lg hover:brightness-110 transition-colors"
            >
              Change Image
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!imageSrc || isSaving}
            className="px-6 py-2 bg-maroon text-white cursor-pointer font-medium rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
