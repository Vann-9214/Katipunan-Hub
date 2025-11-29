"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import type { User } from "../../../../../supabase/Lib/General/user";
import FormInput from "./formInput";
import { uploadAvatar } from "../../../../../supabase/Lib/Account/uploadAvatar";
import { uploadCover } from "../../../../../supabase/Lib/Account/coverPhoto";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";
import { removeUserImage } from "../../../../../supabase/Lib/Account/removeImage";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "../../../../../supabase/Lib/Account/getCroppped";
import { motion } from "framer-motion"; // Added for smooth entry
import { Montserrat } from "next/font/google"; // Font

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

interface EditMainProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateSuccess: (updatedData: Partial<User>) => void;
}

type CropMode = "avatar" | "cover" | null;

export default function EditMainProfileModal({
  user,
  onClose,
  onUpdateSuccess,
}: EditMainProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarURL || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    user.coverURL || null
  );

  const [finalAvatarFile, setFinalAvatarFile] = useState<Blob | null>(null);
  const [finalCoverFile, setFinalCoverFile] = useState<Blob | null>(null);

  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [isCoverRemoved, setIsCoverRemoved] = useState(false);

  const [cropMode, setCropMode] = useState<CropMode>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const hasCustomAvatar =
    avatarPreview &&
    avatarPreview !== "/DefaultAvatar.svg" &&
    avatarPreview !== "";
  const hasCustomCover = coverPreview && coverPreview !== "";

  const onFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "avatar" | "cover"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          setTempImageSrc(reader.result as string);
          setCropMode(mode);
          setZoom(1);
          setCrop({ x: 0, y: 0 });
        }
      };
    }
    e.target.value = "";
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = async () => {
    if (!tempImageSrc || !croppedAreaPixels || !cropMode) return;

    try {
      const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      if (!croppedBlob) return;

      const previewUrl = URL.createObjectURL(croppedBlob);

      if (cropMode === "avatar") {
        setFinalAvatarFile(croppedBlob);
        setAvatarPreview(previewUrl);
        setIsAvatarRemoved(false);
      } else {
        setFinalCoverFile(croppedBlob);
        setCoverPreview(previewUrl);
        setIsCoverRemoved(false);
      }

      setCropMode(null);
      setTempImageSrc(null);
    } catch (e) {
      console.error("Crop failed", e);
    }
  };

  const handleCancelCrop = () => {
    setCropMode(null);
    setTempImageSrc(null);
  };

  const handleRemoveAvatar = () => {
    setFinalAvatarFile(null);
    setAvatarPreview(null);
    setIsAvatarRemoved(true);
  };

  const handleRemoveCover = () => {
    setFinalCoverFile(null);
    setCoverPreview(null);
    setIsCoverRemoved(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      let finalAvatarUrl: string | null = user.avatarURL || null;
      let finalCoverUrl: string | null = user.coverURL || null;

      if (isAvatarRemoved) {
        await removeUserImage(user.id, "avatar");
        finalAvatarUrl = null;
      } else if (finalAvatarFile) {
        const { publicUrl } = await uploadAvatar(user.id, finalAvatarFile);
        if (publicUrl) finalAvatarUrl = publicUrl;
      }

      if (isCoverRemoved) {
        await removeUserImage(user.id, "cover");
        finalCoverUrl = null;
      } else if (finalCoverFile) {
        const file = new File([finalCoverFile], "cover.png", {
          type: "image/png",
        });
        const { publicUrl } = await uploadCover(user.id, file);
        if (publicUrl) finalCoverUrl = publicUrl;
      }

      await updateUserAccount(user.id, {
        fullName,
        avatarURL: finalAvatarUrl,
        coverURL: finalCoverUrl,
      });

      onUpdateSuccess({
        fullName,
        avatarURL: finalAvatarUrl || "",
        coverURL: finalCoverUrl || "",
      });

      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- CROPPER VIEW (Dark Theme Preserved) ---
  if (cropMode && tempImageSrc) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl bg-[#18191A] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[600px]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-[#242526] z-20">
            <button
              onClick={handleCancelCrop}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <h3 className="font-bold text-lg text-white font-montserrat">
              {cropMode === "avatar"
                ? "Crop Profile Picture"
                : "Crop Cover Photo"}
            </h3>
            <div className="w-10" />
          </div>

          <div className="relative flex-1 w-full bg-black">
            <Cropper
              image={tempImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={cropMode === "avatar" ? 1 : 2.7}
              cropShape={cropMode === "avatar" ? "round" : "rect"}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          </div>

          <div className="bg-[#242526] p-4 border-t border-gray-700 flex flex-col gap-4 z-20">
            <div className="flex items-center gap-4 px-4 max-w-md mx-auto w-full">
              <ZoomOut size={20} className="text-gray-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#EFBF04]"
              />
              <ZoomIn size={20} className="text-gray-400" />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelCrop}
                className="px-6 py-2 font-bold text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-8 py-2 bg-[#EFBF04] text-[#8B0E0E] font-bold rounded-lg hover:bg-[#d4a903] transition-all shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM (Themed) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Gold Border Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-lg p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl"
      >
        {/* Inner Content */}
        <div className="bg-white w-full h-full rounded-[22px] overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header: Maroon Gradient */}
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30">
            <h2
              className={`${montserrat.className} text-[22px] font-bold text-white tracking-wide`}
            >
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
          >
            {/* Cover Photo */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 font-montserrat">
                  Cover Photo
                </h3>
                <div className="flex items-center gap-3">
                  {hasCustomCover && (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-red-600 text-sm font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="text-[#8B0E0E] text-sm font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group shadow-inner">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon size={32} />
                    <span className="text-xs">No Cover Photo</span>
                  </div>
                )}
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <Camera className="text-white drop-shadow-md" />
                </div>
              </div>
              <input
                type="file"
                ref={coverInputRef}
                onChange={(e) => onFileSelect(e, "cover")}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Picture */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 font-montserrat">
                  Profile Picture
                </h3>
                <div className="flex items-center gap-3">
                  {hasCustomAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-red-600 text-sm font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-[#8B0E0E] text-sm font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 group cursor-pointer">
                  <Image
                    src={avatarPreview || "/DefaultAvatar.svg"}
                    alt="Avatar Preview"
                    fill
                    className="object-cover"
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => onFileSelect(e, "avatar")}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-3">
              <FormInput
                label="Full Name"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8B0E0E] to-[#600a0a] text-white font-bold rounded-xl hover:from-[#a31111] hover:to-[#750c0c] transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving && <Loader2 className="animate-spin" size={18} />}
              Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
