"use client";

import { useState } from "react";
import { X } from "lucide-react";
import FormInput from "./formInput";
import type { User } from "../../../../../supabase/Lib/General/user";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: { fullName: string }) => void;
  isSaving: boolean;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
  isSaving,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onSave({ fullName });
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm transition-opacity">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            Edit Personal Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name (Editable) */}
            <FormInput
              label="Full Name"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSaving}
            />
            {/* Cit Email (Disabled) */}
            <FormInput
              label="Cit Email"
              id="citEmail"
              value={user.email || ""}
              disabled
            />
            {/* Course (Disabled) */}
            <FormInput
              label="Course"
              id="course"
              value={user.course || ""}
              disabled
            />
            {/* Year (Disabled) */}
            <FormInput
              label="Year"
              id="year"
              value={user.year || ""}
              disabled
            />
            {/* Student ID (Disabled) */}
            <FormInput
              label="Student ID"
              id="studentID"
              value={user.studentID || ""}
              disabled
            />
            {/* Role (Disabled) */}
            <FormInput
              label="Role"
              id="role"
              value={user.role || ""}
              disabled
            />
          </div>

          {/* Modal Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-maroon cursor-pointer text-white font-semibold rounded-lg hover:bg-red-800 transition-colors
                         disabled:bg-gray-400 disabled:cursor-not-allowed" // --- Add disabled styles
              disabled={isSaving} // --- Add disabled attribute
            >
              {isSaving ? "Saving..." : "Save Changes"}{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
