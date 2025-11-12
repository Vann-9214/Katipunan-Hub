"use client";

import { useState } from "react";
import Avatar from "@/app/component/ReusableComponent/Avatar"; // <-- 1. IMPORTS your "dumb" Avatar
import AvatarUploadModal from "./avatarCroppedModal";
import { uploadAvatar } from "../../../../../supabase/Lib/Account/uploadAvatar";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";
import { UserDetails } from "./types";
import { Pen } from "lucide-react";

interface AvatarEditorProps {
  user: UserDetails;
  className?: string; // To pass sizing like "w-16 h-16"
}

export default function AvatarEditor({ user, className }: AvatarEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(
    user.avatarURL || null
  );

  const handleSaveCrop = async (croppedBlob: Blob) => {
    setIsUploading(true);
    let newUrl = null;

    try {
      // 1. Upload to Storage
      const { publicUrl, error: uploadError } = await uploadAvatar(
        user.id,
        croppedBlob
      );
      if (uploadError) throw uploadError;

      newUrl = publicUrl;

      // 2. Update 'Accounts' table in Database
      const { error: dbError } = await updateUserAccount(user.id, {
        avatarURL: newUrl,
      });
      if (dbError) throw dbError;

      // 3. Success! Update local state and close.
      setLocalAvatarUrl(newUrl);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      // TODO: Show an error toast to the user
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 2. WRAPS the Avatar in a button to make it clickable */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={isUploading}
        className={`relative group rounded-full focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${
          isUploading ? "cursor-not-allowed" : ""
        } ${className}`}
      >
        <Avatar
          avatarURL={localAvatarUrl}
          altText={user.fullName || "User"}
          className="w-full h-full" // Ensure Avatar fills the button
        />
        {/* Edit Icon Overlay */}
        {!isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Pen size={20} className="text-white" />
          </div>
        )}
      </button>

      {/* 3. Manages the modal logic */}
      {isModalOpen && (
        <AvatarUploadModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCrop}
        />
      )}
    </>
  );
}
