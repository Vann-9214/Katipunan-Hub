"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

// Fonts
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400"] });

interface PLCTutorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PLCTutorApplicationModal({
  isOpen,
  onClose,
}: PLCTutorApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Placeholder state for form fields
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    subject: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Placeholder Logic: Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Placeholder Action
    console.log("Submitting Tutor Application:", formData);
    alert("Application submitted! We will review your request shortly.");

    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2
            className={`${montserrat.className} text-[24px] font-bold text-black`}
          >
            Apply to be a PLC Tutor
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <p className={`${ptSans.className} text-gray-700`}>
            Fill out this brief application to join the Peer Learning Center.
          </p>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20"
              placeholder="Your Full Name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Course & Year</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20"
              placeholder="e.g., BSIT - 3rd Year"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">
              Subject Expertise
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20"
              placeholder="e.g., Calculus, Python, Thermodynamics"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-[#8B0E0E] text-white font-bold hover:bg-[#6d0b0b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
