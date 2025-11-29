"use client";

import { useState } from "react";
import { X } from "lucide-react";
import FormInput from "./formInput";
import type { User } from "../../../../../supabase/Lib/General/user";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: { fullName: string; bio: string }) => void; // Updated type
  isSaving: boolean;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
  isSaving,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || ""); // New state for bio

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onSave({ fullName, bio }); // Save both
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-black">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <FormInput
                label="Full Name"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {/* Bio Field - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black disabled:bg-gray-100 disabled:text-gray-500 resize-none"
                placeholder="Describe yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {/* Read-Only Fields */}
            <FormInput
              label="Cit Email"
              id="citEmail"
              value={user.email || ""}
              disabled
            />
            <FormInput
              label="Course"
              id="course"
              value={user.course || ""}
              disabled
            />
            <FormInput
              label="Year"
              id="year"
              value={user.year || ""}
              disabled
            />
            <FormInput
              label="Student ID"
              id="studentID"
              value={user.studentID || ""}
              disabled
            />
            <FormInput
              label="Role"
              id="role"
              value={user.role || ""}
              disabled
            />
          </div>

          {/* Modal Footer */}
          <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2 bg-maroon cursor-pointer text-white font-semibold rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
