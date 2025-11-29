// src/app/component/General/Announcement/AnnouncementContent/PLCTutorApplication.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, BookOpenText, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat, PT_Sans } from "next/font/google";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../../supabase/Lib/General/user";

// --- START: Upload Button Imports ---
import UploadButton, { UploadButtonHandle } from "../UploadButton/UploadButton";
// --- END: Upload Button Imports ---

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
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Scholar/Non-Scholar, Step 2: Details/Upload

  // 2. Form Data
  const [formData, setFormData] = useState({
    subject: "",
    isScholar: "unknown", // 'scholar' | 'non-scholar' | 'unknown'
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Ref for UploadButton
  const uploadRef = useRef<UploadButtonHandle>(null);

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
      setFormData({ subject: "", isScholar: "unknown" });
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
    setStep(2); // Move to details page
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

    // --- REMOVED SUBJECT VALIDATION HERE TO MAKE IT OPTIONAL ---

    const isScholar = formData.isScholar === "scholar";
    let gradesUrl: string | null = null;

    try {
      // 2. Conditional Grade/File Handling
      if (!isScholar) {
        // Non-Scholar Path: Upload file and get URL.
        if (!uploadRef.current) throw new Error("Upload component not ready.");

        // Use the UploadButton's internal method
        const uploadedUrls = await uploadRef.current.uploadAndGetFinalUrls();

        if (uploadedUrls.length === 0) {
          setError("Non-scholars must upload a Grades Proof picture/PDF.");
          setIsSubmitting(false);
          return;
        }

        // We expect one grades file for proof
        gradesUrl = uploadedUrls[0];
      }

      // 3. Placeholder Logic: Send Application Data
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const applicationPayload = {
        applicantId: currentUser.id,
        fullName: currentUser.fullName,
        course: currentUser.course,
        subject: formData.subject || "General", // Default if empty
        isScholar: isScholar,
        gpaStatus: isScholar ? "Scholar (Mandatory)" : "4.5+ GPA required",
        gradesProofUrl: gradesUrl,
      };

      console.log("Submitting PLC Application:", applicationPayload);

      alert("Application submitted! We will review your request shortly.");
      onClose();
    } catch (err: unknown) {
      // 1. Change 'any' to 'unknown'
      console.error("Application submission failed:", err);

      // In a failure scenario, use the UploadButton handle to clean up storage
      const removedUrls = uploadRef.current?.getRemovedUrls() || [];
      if (removedUrls.length > 0) {
        console.log("Cleanup initiated for partially uploaded files.");
      }

      // 2. Safely extract the error message
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

  // === JSX RENDERING SECTIONS ===

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
            {/* SCHOLAR BUTTON */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScholarSelect("scholar")}
              className={`${montserrat.className} px-6 py-4 rounded-xl bg-gradient-to-r from-[#EFBF04] to-[#FFD700] text-[#800000] font-bold shadow-md`}
            >
              Yes, I am a Scholar
            </motion.button>

            {/* NON-SCHOLAR BUTTON */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScholarSelect("non-scholar")}
              className={`${montserrat.className} px-6 py-4 rounded-xl border-2 border-[#800000] text-[#800000] font-bold hover:bg-red-50 transition-colors`}
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
      // REMOVED rigid overflow/height classes here; parent wrapper handles scrolling now
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
          // REMOVED required attribute
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-ptsans focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/20 focus:border-[#8B0E0E]/50 transition-all"
          placeholder="e.g., Calculus, Python, Thermodynamics"
        />
      </div>

      {/* --- NON-SCHOLAR UPLOAD FIELDS --- */}
      {formData.isScholar === "non-scholar" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 overflow-hidden pt-2 border-t border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-700">
            Proof of Academic Standing <span className="text-red-500">*</span>
          </p>

          {/* GPA REQUIREMENT NOTE */}
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            <p className="text-xs font-bold">⚠️ IMPORTANT:</p>
            <p className="text-sm font-medium">
              Your uploaded grades must show a **GPA of 4.5 or higher** to
              qualify.
            </p>
          </div>

          {/* Upload Button Component Integration */}
          <div className="flex flex-col gap-2">
            <UploadButton ref={uploadRef} predefinedImages={[]} />
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
          className={`${montserrat.className} px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 text-gray-700 transition-colors`}
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.98 }}
          className={`${montserrat.className} px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#8B0E0E] to-[#600a0a] text-white font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all`}
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
            // Added max-h-[85vh] to limit the modal height on screen
            className="relative w-full max-w-[500px] max-h-[85vh] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
          >
            <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
              {/* Header (Fixed) */}
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
              {/* Added flex-1 and overflow-y-auto to create the scrollable body below the fixed header */}
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
