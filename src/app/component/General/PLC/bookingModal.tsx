"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, Clock } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
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
    weekday: "long",
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* --- Outer Wrapper: Gold Gradient Border --- */}
          <motion.div
            className="w-full max-w-[500px] max-h-[90vh] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
            variants={modalVariants}
          >
            {/* --- Inner Wrapper: White Background --- */}
            <div className="bg-white rounded-[22px] overflow-hidden w-full h-full flex flex-col shadow-inner relative">
              {/* --- Header: Dark Red Gradient --- */}
              <div className="relative p-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 shrink-0">
                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center relative z-10"
                >
                  <div>
                    <h2
                      className={`${montserrat.className} text-[22px] font-bold text-white tracking-wide`}
                    >
                      Book a Session
                    </h2>
                    <p
                      className={`${ptSans.className} text-yellow-100/70 text-sm mt-0.5`}
                    >
                      Reserve your slot with the PLC
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1, color: "#EFBF04" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 bg-white/10 cursor-pointer hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md border border-white/10"
                  >
                    <X size={20} />
                  </motion.button>
                </motion.div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
              </div>

              {/* --- Form Content --- */}
              <form
                onSubmit={handleSubmit}
                className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar"
              >
                {/* Date Display (Read Only) */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-1.5"
                >
                  <label
                    className={`${montserrat.className} text-[13px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2`}
                  >
                    <Calendar size={14} className="text-[#8B0E0E]" />
                    Selected Date
                  </label>
                  <div
                    className={`${ptSans.className} w-full p-3 bg-gray-50 rounded-xl text-gray-800 border border-gray-200 font-semibold shadow-sm flex items-center gap-3`}
                  >
                    <div className="h-2 w-2 rounded-full bg-[#EFBF04] shrink-0" />
                    {formattedDate}
                  </div>
                </motion.div>

                {/* Time Inputs Row */}
                <motion.div variants={itemVariants} className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label
                      className={`${montserrat.className} text-[13px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2`}
                    >
                      <Clock size={14} className="text-[#8B0E0E]" />
                      Start <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className={`${ptSans.className} w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#4e0505] focus:ring-1 focus:ring-[#4e0505] outline-none transition-all shadow-sm`}
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <label
                      className={`${montserrat.className} text-[13px] font-bold text-gray-700 uppercase tracking-wider`}
                    >
                      End <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className={`${ptSans.className} w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#4e0505] focus:ring-1 focus:ring-[#4e0505] outline-none transition-all shadow-sm`}
                    />
                  </div>
                </motion.div>

                <motion.span
                  variants={itemVariants}
                  className="text-[11px] text-[#4e0505]/60 font-medium text-center bg-[#4e0505]/5 py-1 rounded-md -mt-1"
                >
                  Operating Hours: 7:30 AM — 9:00 PM
                </motion.span>

                {/* Subject Input */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-1.5"
                >
                  <label
                    className={`${montserrat.className} text-[13px] font-bold text-gray-700 uppercase tracking-wider`}
                  >
                    Subject Title <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    required
                    placeholder="e.g., Math Review, Thesis Consultation"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className={`${ptSans.className} w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#4e0505] focus:ring-1 focus:ring-[#4e0505] outline-none transition-all shadow-sm placeholder:text-gray-400`}
                  />
                </motion.div>

                {/* Description Input */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-1.5"
                >
                  <label
                    className={`${montserrat.className} text-[13px] font-bold text-gray-700 uppercase tracking-wider`}
                  >
                    Description{" "}
                    <span className="text-gray-400 font-normal lowercase tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    rows={3}
                    placeholder="Add details to help us prepare..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`${ptSans.className} w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#4e0505] focus:ring-1 focus:ring-[#4e0505] outline-none transition-all shadow-sm resize-none placeholder:text-gray-400`}
                  />
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex gap-3 pt-4 border-t border-gray-100 mt-2 shrink-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className={`${montserrat.className} cursor-pointer flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:text-gray-800 transition-colors`}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`${montserrat.className} cursor-pointer flex-1 py-3 rounded-xl bg-gradient-to-b from-[#4e0505] to-[#3a0000] text-white font-bold shadow-lg shadow-[#4e0505]/30 flex items-center justify-center gap-2 relative overflow-hidden group`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Confirm Booking"
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
