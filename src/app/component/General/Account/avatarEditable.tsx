"use client";

// Imports
import { useState } from "react";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import AvatarUploadModal from "./avatarCroppedForm";
import { uploadAvatar } from "../../../../../supabase/Lib/Account/uploadAvatar";
import type { User } from "../../../../../supabase/Lib/General/user";
import { Pen } from "lucide-react";

// Interface
interface AvatarEditorProps {
  user: User;
  className?: string;
}

// Component
export default function AvatarEditor({ user, className }: AvatarEditorProps) {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(
    user.avatarURL || null
  );

  // Handlers
  const handleSaveCrop = async (croppedBlob: Blob) => {
    setIsUploading(true);

    try {
      const { publicUrl, error } = await uploadAvatar(user.id, croppedBlob);

      if (error) {
        throw error;
      }

      if (publicUrl) {
        setLocalAvatarUrl(publicUrl + `?t=${new Date().getTime()}`);
        setIsModalOpen(false);
      } else {
        throw new Error("Upload succeeded but no public URL was returned.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to update avatar:", error.message);
      } else {
        console.error("Failed to update avatar:", error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // JSX
  return (
    <>
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
