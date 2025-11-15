"use client";

import { useState } from "react";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import AvatarUploadModal from "./avatarCroppedForm";
import { uploadAvatar } from "../../../../../supabase/Lib/Account/uploadAvatar";

// --- 1. REMOVE THIS IMPORT ---
// import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";

import type { User } from "../../../../../supabase/Lib/General/user";
import { Pen } from "lucide-react";

interface AvatarEditorProps {
  user: User;
  className?: string;
}

export default function AvatarEditor({ user, className }: AvatarEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(
    user.avatarURL || null
  );

  // --- 3. This function is now much simpler! ---
  const handleSaveCrop = async (croppedBlob: Blob) => {
    setIsUploading(true);
    let newUrl = null;

    try {
      // This one function now does BOTH storage and DB update
      const { publicUrl, error: uploadError } = await uploadAvatar(
        user.id,
        croppedBlob
      );
      if (uploadError) throw uploadError;

      newUrl = publicUrl;

      // --- 4. DELETE THIS BLOCK ---
      // const { error: dbError } = await updateUserAccount(user.id, {
      //   avatarURL: newUrl,
      // });
      // if (dbError) throw dbError;

      setLocalAvatarUrl(newUrl);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* (Your JSX remains exactly the same) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={isUploading}
        className={`relative group rounded-full cursor-pointer ${
          isUploading ? "cursor-not-allowed" : ""
        } ${className}`}
      >
        <Avatar
          avatarURL={localAvatarUrl}
          altText={user.fullName || "User"}
          className="w-full h-full"
        />
        {!isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Pen size={20} className="text-white" />
          </div>
        )}
      </button>

      {isModalOpen && (
        <AvatarUploadModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCrop}
        />
      )}
    </>
  );
}
