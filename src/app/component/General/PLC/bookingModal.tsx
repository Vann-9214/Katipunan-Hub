"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";

/* --- FIX: Import the pre-configured client from your project --- */
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";

/* Fonts */
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

/* Types */
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSuccess?: () => void;
}

/* Main Component */
export default function BookingModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: BookingModalProps) {
  /* State */
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    startTime: "",
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !selectedDate) return null;

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* Handlers */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await getCurrentUserDetails();
      if (!user) throw new Error("You must be logged in to book a session.");

      // Adjust for timezone offset to ensure correct date is saved (YYYY-MM-DD)
      const offset = selectedDate.getTimezoneOffset();
      const dateForDB = new Date(selectedDate.getTime() - offset * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { error: insertError } = await supabase.from("PLCBookings").insert({
        studentId: user.id,
        bookingDate: dateForDB,
        startTime: formData.startTime,
        subject: formData.subject,
        description: formData.description,
        status: "Pending",
      });

      if (insertError) throw insertError;

      setFormData({ subject: "", description: "", startTime: "" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Booking Error:", err);
      setError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* Render */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2
            className={`${montserrat.className} text-[20px] font-bold text-[#8B0E0E]`}
          >
            Book a Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Date Display */}
          <div className="flex flex-col gap-2">
            <label
              className={`${montserrat.className} text-[14px] font-bold text-black`}
            >
              Date
            </label>
            <div
              className={`${ptSans.className} w-full p-3 bg-gray-100 rounded-lg text-gray-600 border border-gray-300`}
            >
              {formattedDate}
            </div>
          </div>

          {/* Time Input */}
          <div className="flex flex-col gap-2">
            <label
              className={`${montserrat.className} text-[14px] font-bold text-black`}
            >
              Preferred Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20`}
            />
          </div>

          {/* Subject Input */}
          <div className="flex flex-col gap-2">
            <label
              className={`${montserrat.className} text-[14px] font-bold text-black`}
            >
              Subject Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Math Review, Thesis Consultation"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20`}
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label
              className={`${montserrat.className} text-[14px] font-bold text-black`}
            >
              Description{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add specific details about what you need help with..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 resize-none`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`${montserrat.className} flex-1 py-3 rounded-lg border border-black text-black font-bold hover:bg-gray-50 transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`${montserrat.className} flex-1 py-3 rounded-lg bg-[#8B0E0E] text-white font-bold hover:bg-[#6d0b0b] transition-colors flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
