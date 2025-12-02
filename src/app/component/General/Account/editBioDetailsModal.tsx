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
  Loader2,
} from "lucide-react";
import type { User } from "../../../../../supabase/Lib/General/user";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";
import { motion } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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
      {/* Gold Border Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-2xl p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl"
      >
        {/* Inner Content */}
        <div className="bg-white w-full h-full rounded-[22px] overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header: Maroon Gradient */}
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30">
            <h2
              className={`${montserrat.className} text-[22px] font-bold text-white tracking-wide`}
            >
              Edit Bio & Details
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          >
            {/* --- Editable Fields --- */}
            <section className="space-y-4">
              <h3
                className={`${montserrat.className} text-lg font-bold text-gray-800`}
              >
                Public Details
              </h3>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 font-montserrat">
                  Bio
                </label>
                <textarea
                  rows={3}
                  className={`${ptSans.className} w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EFBF04] focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white text-[15px] leading-relaxed`}
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
                <label className="block text-sm font-bold text-gray-700 mb-2 font-montserrat">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EFBF04]"
                    size={20}
                  />
                  <input
                    type="text"
                    className={`${ptSans.className} w-full pl-10 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EFBF04] focus:border-transparent transition-all bg-gray-50 focus:bg-white`}
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* --- Read Only Fields (Academic) --- */}
            <section className="space-y-4">
              <h3
                className={`${montserrat.className} text-lg font-bold text-gray-800`}
              >
                Academic Information{" "}
                <span className="text-xs font-normal text-gray-400 ml-2 font-ptsans">
                  (Read Only)
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <BookOpen size={20} className="text-[#8B0E0E]" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Course
                    </p>
                    <p className="font-bold text-gray-800 text-sm font-montserrat">
                      {user.course}
                    </p>
                  </div>
                </div>

                {/* Year Level */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Calendar size={20} className="text-[#8B0E0E]" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Year Level
                    </p>
                    <p className="font-bold text-gray-800 text-sm font-montserrat">
                      {user.year}
                    </p>
                  </div>
                </div>

                {/* Student ID */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Hash size={20} className="text-[#8B0E0E]" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Student ID
                    </p>
                    <p className="font-bold text-gray-800 text-sm font-montserrat">
                      {user.studentID}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <School size={20} className="text-[#8B0E0E]" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Role
                    </p>
                    <p className="font-bold text-gray-800 text-sm font-montserrat">
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Mail size={20} className="text-[#8B0E0E]" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      CIT Email
                    </p>
                    <p className="font-bold text-gray-800 text-sm font-montserrat">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </section>
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
              Save Details
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
