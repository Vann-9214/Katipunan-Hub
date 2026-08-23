"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, BookOpenText, User as UserIcon, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";

// Fonts
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCTutorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// === MAIN COMPONENT ===
const PLCTutorApplicationModal: React.FC<PLCTutorApplicationModalProps> = ({
  isOpen,
  onClose,
}: PLCTutorApplicationModalProps) => {
  // State for logged-in user details
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 1. Application Flow State
  const [step, setStep] = useState<1 | 2>(1);

  // 2. Form Data
  const [formData, setFormData] = useState({
    subject: "",
    isScholar: "unknown",
    gradesProofUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    if (isOpen) {
      setIsUserLoading(true);
      getCurrentUserDetails().then((user) => {
        setCurrentUser(user);
        setIsUserLoading(false);
        if (!user) {
          setError("You must be logged in to submit an application.");
        }
      });
    }
  }, [isOpen]);

  // Reset all states when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({ subject: "", isScholar: "unknown", gradesProofUrl: "" });
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handlers
  const handleScholarSelect = (status: "scholar" | "non-scholar") => {
    if (!currentUser) {
      setError("Please log in before starting the application.");
      return;
    }
    setFormData((prev) => ({ ...prev, isScholar: status }));
    setStep(2);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!currentUser) {
      setError("User authentication failed. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const isScholar = formData.isScholar === "scholar";

    try {
      if (!isScholar && !formData.gradesProofUrl.trim()) {
        setError("Please provide a link to your grades / academic proof.");
        setIsSubmitting(false);
        return;
      }

      const applicationPayload = {
        applicantId: currentUser.studentID,
        fullName: currentUser.fullName,
        email: currentUser.email,
        course: currentUser.course,
        year: currentUser.year,
        subject: formData.subject || "General",
        isScholar: isScholar,
        gradesProofUrl: formData.gradesProofUrl || null,
      };

      const response = await fetch("/api/tutor-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Failed to submit application. Please contact support."
        );
      }

      alert(
        "Application submitted! An admin will review your request shortly."
      );
      onClose();
    } catch (err: unknown) {
      console.error("Application submission failed:", err);

      let errorMessage = "An unexpected error occurred during submission.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col gap-6"
    >
      {isUserLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={32} className="animate-spin text-[#8B0E0E]" />
        </div>
      ) : !currentUser ? (
        <div className="text-red-600 text-center text-sm py-6 bg-red-50 rounded-lg border border-red-100">
          You must be logged in to apply.
        </div>
      ) : (
        <>
          <p
            className={`${ptSans.className} text-gray-700 text-[15px] text-center`}
          >
            Are you currently an officially recognized scholar at CIT-U?
          </p>

          <div className="flex flex-col gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScholarSelect("scholar")}
              className={`${montserrat.className} px-6 py-4 rounded-xl bg-gradient-to-r from-[#EFBF04] to-[#FFD700] text-[#800000] font-bold shadow-md cursor-pointer`}
            >
              Yes, I am a Scholar
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScholarSelect("non-scholar")}
              className={`${montserrat.className} px-6 py-4 rounded-xl border-2 border-[#800000] text-[#800000] font-bold hover:bg-red-50 transition-colors cursor-pointer`}
            >
              No, I am a Non-Scholar
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.form
      key="step2"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col gap-5 pb-8"
    >
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center text-center">
          {error}
        </div>
      )}

      {currentUser && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <UserIcon size={20} className="text-[#8B0E0E]" />
          <div className="text-sm">
            <p className="font-semibold text-gray-800">
              {currentUser.fullName}
            </p>
            <p className="text-gray-500 text-xs">
              {currentUser.course} - {currentUser.year}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700 text-sm">
          Subject Expertise{" "}
          <span className="text-gray-400 font-normal text-xs ml-1">
            (Optional)
          </span>
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-ptsans focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 focus:border-[#8B0E0E]/50 transition-all"
          placeholder="e.g., Calculus, Python, Thermodynamics"
        />
      </div>

      {formData.isScholar === "non-scholar" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 overflow-hidden pt-2 border-t border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-700">
            Proof of Academic Standing (Link) <span className="text-red-500">*</span>
          </p>

          <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            <p className="text-xs font-bold">⚠️ IMPORTANT:</p>
            <p className="text-sm font-medium">
              Your grades must show a **GPA of 4.5 or higher** to qualify.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-gray-400 shrink-0" />
            <input
              type="url"
              name="gradesProofUrl"
              value={formData.gradesProofUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/... or public document link"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-ptsans focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 focus:border-[#8B0E0E]/50 transition-all text-sm"
              required={formData.isScholar === "non-scholar"}
            />
          </div>
        </motion.div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
        <motion.button
          type="button"
          onClick={() => setStep(1)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${montserrat.className} px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer`}
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.98 }}
          className={`${montserrat.className} px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#8B0E0E] to-[#600a0a] text-white font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer`}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Submit Application"
          )}
        </motion.button>
      </div>
    </motion.form>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-[500px] max-h-[85vh] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
          >
            <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
              {/* Header */}
              <div className="relative px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <BookOpenText size={24} className="text-white" />
                  <h2
                    className={`${montserrat.className} text-[22px] font-bold text-white tracking-wide`}
                  >
                    {step === 1 ? "Start Application" : "Tutor Application"}
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={24} />
                </motion.button>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <AnimatePresence mode="wait">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PLCTutorApplicationModal;
