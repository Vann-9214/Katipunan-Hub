"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  BookOpen,
  Calendar,
  Mail,
  Hash,
  School,
} from "lucide-react";
import type { User } from "../../../../../supabase/Lib/General/user";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";

interface EditBioDetailsModalProps {
  user: User;
  onClose: () => void;
  onUpdateSuccess: (updatedData: Partial<User>) => void;
}

export default function EditBioDetailsModal({
  user,
  onClose,
  onUpdateSuccess,
}: EditBioDetailsModalProps) {
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      await updateUserAccount(user.id, {
        bio,
        location,
      });

      onUpdateSuccess({ bio, location });
      onClose();
    } catch (error) {
      console.error("Error updating details:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black font-montserrat">
            Edit Bio & Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* --- Editable Fields --- */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Public Details</h3>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 focus:border-[#8B0E0E] transition-all resize-none bg-gray-50 focus:bg-white"
                placeholder="Describe yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {bio.length}/150 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 focus:border-[#8B0E0E] transition-all bg-gray-50 focus:bg-white"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* --- Read Only Fields (Academic) --- */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              Academic Information{" "}
              <span className="text-xs font-normal text-gray-400 ml-2">
                (Read Only)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <BookOpen size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Course
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.course}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Year Level
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Hash size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Student ID
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.studentID}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <School size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Role
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Mail size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    CIT Email
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#8B0E0E] text-white font-bold rounded-xl hover:bg-[#6d0b0b] transition-all shadow-lg shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
