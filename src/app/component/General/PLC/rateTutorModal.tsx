"use client";

import React, { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

interface RateTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName: string;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

export default function RateTutorModal({
  isOpen,
  onClose,
  tutorName,
  onSubmit,
}: RateTutorModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, review);
      onClose();
    } catch (error) {
      console.error("Failed to submit rating", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          {/* --- OUTER WRAPPER: GOLD GRADIENT BORDER --- */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-[500px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
          >
            {/* --- INNER WHITE CONTENT --- */}
            <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
              {/* --- HEADER: MAROON GRADIENT --- */}
              <div className="relative px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 flex items-center justify-between shrink-0 z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
                <h2
                  className={`${montserrat.className} text-[24px] font-bold text-white`}
                >
                  Rate {tutorName}
                </h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* --- FORM BODY --- */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium text-gray-700">
                    How was your session?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        className="transition-transform focus:outline-none"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(rating)}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          size={32}
                          className={`${
                            star <= (hover || rating)
                              ? "fill-[#EFBF04] text-[#EFBF04]"
                              : "text-gray-300"
                          } transition-colors duration-200`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Review Input */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">
                    Write a review (Optional)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 resize-none h-32 font-ptsans"
                    placeholder="Share your experience..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                    whileTap={{ scale: 0.98 }}
                    className={`${montserrat.className} cursor-pointer px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:text-gray-800 transition-colors shadow-sm`}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`${montserrat.className} cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#8B0E0E] to-[#600a0a] text-white font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Submit Review"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
