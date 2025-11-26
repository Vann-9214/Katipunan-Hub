"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
// 1. Import Framer Motion
import { motion, AnimatePresence, Variants } from "framer-motion";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSuccess?: () => void;
}

// --- Animation Variants ---
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function BookingModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState<string | null>(null);

  // --- Set Default Start Time to Now when Modal Opens ---
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      setFormData((prev) => ({
        ...prev,
        subject: "",
        description: "",
        startTime: `${hours}:${minutes}`,
        endTime: "",
      }));
      setError(null);
    }
  }, [isOpen]);

  const formattedDate = selectedDate?.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* Time Validation Helpers */
  const validateTime = (startStr: string, endStr: string, date: Date) => {
    if (!startStr || !endStr) {
      throw new Error("Please provide both start and end times.");
    }

    const getMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const startTotal = getMinutes(startStr);
    const endTotal = getMinutes(endStr);

    // 1. Check order
    if (endTotal <= startTotal) {
      throw new Error("End time must be after start time.");
    }

    // 2. Constraint: 7:30 AM to 9:00 PM
    const minLimit = 7 * 60 + 30; // 7:30 AM
    const maxLimit = 21 * 60; // 9:00 PM

    if (startTotal < minLimit || startTotal > maxLimit) {
      throw new Error("Bookings must start between 7:30 AM and 9:00 PM.");
    }
    if (endTotal > maxLimit) {
      throw new Error("Bookings cannot end after 9:00 PM.");
    }

    // 3. Constraint: No past times if date is today
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (startTotal <= currentMinutes) {
        throw new Error("Cannot book a time in the past.");
      }
    }
  };

  /* Handlers */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Validate Time
      validateTime(formData.startTime, formData.endTime, selectedDate);

      // 2. Get User
      const user = await getCurrentUserDetails();
      if (!user) throw new Error("You must be logged in to book a session.");

      // 3. Format Date for DB (YYYY-MM-DD)
      const offset = selectedDate.getTimezoneOffset();
      const dateForDB = new Date(selectedDate.getTime() - offset * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // 4. Insert to Supabase
      const { error: insertError } = await supabase.from("PLCBookings").insert({
        studentId: user.id,
        bookingDate: dateForDB,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subject: formData.subject,
        description: formData.description,
        status: "Pending",
      });

      if (insertError) throw insertError;

      // 5. Reset and Close
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Booking Error:", err);
      let errorMessage = "Failed to submit booking. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String((err as { message: unknown }).message);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && selectedDate && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl overflow-hidden"
            variants={modalVariants}
            // Inherits initial/animate/exit from parent, but uses its own variants
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <motion.h2
                variants={itemVariants}
                className={`${montserrat.className} text-[20px] font-bold text-[#8B0E0E]`}
              >
                Book a Session
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Date Display */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2"
              >
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
              </motion.div>

              {/* Time Inputs Row */}
              <motion.div variants={itemVariants} className="flex gap-4">
                {/* Start Time */}
                <div className="flex-1 flex flex-col gap-2">
                  <label
                    className={`${montserrat.className} text-[14px] font-bold text-black`}
                  >
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#8B0E0E" }}
                    transition={{ duration: 0.2 }}
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20`}
                  />
                </div>

                {/* End Time */}
                <div className="flex-1 flex flex-col gap-2">
                  <label
                    className={`${montserrat.className} text-[14px] font-bold text-black`}
                  >
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#8B0E0E" }}
                    transition={{ duration: 0.2 }}
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20`}
                  />
                </div>
              </motion.div>
              <motion.span
                variants={itemVariants}
                className="text-xs text-gray-500 -mt-3"
              >
                Available from 7:30 AM to 9:00 PM
              </motion.span>

              {/* Subject Input */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2"
              >
                <label
                  className={`${montserrat.className} text-[14px] font-bold text-black`}
                >
                  Subject Title <span className="text-red-500">*</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "#8B0E0E" }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  required
                  placeholder="e.g., Math Review, Thesis Consultation"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20`}
                />
              </motion.div>

              {/* Description Input */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2"
              >
                <label
                  className={`${montserrat.className} text-[14px] font-bold text-black`}
                >
                  Description{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.02, borderColor: "#8B0E0E" }}
                  transition={{ duration: 0.2 }}
                  rows={3}
                  placeholder="Add specific details about what you need help with..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`${ptSans.className} w-full p-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 resize-none`}
                />
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`${montserrat.className} flex-1 py-3 rounded-lg border border-black text-black font-bold hover:bg-gray-50 transition-colors`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#6d0b0b" }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className={`${montserrat.className} flex-1 py-3 rounded-lg bg-[#8B0E0E] text-white font-bold hover:bg-[#6d0b0b] transition-colors flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Confirm Booking"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
