"use client";

import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Loader2, Mail, RefreshCcw, X } from "lucide-react";

import Button from "@/app/component/ReusableComponent/Buttons";

interface EmailVerificationMessageProps {
  onClose: () => void;
  email: string;
}

export default function EmailVerificationMessage({
  onClose,
  email,
}: EmailVerificationMessageProps) {
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error" | "cooldown"
  >("idle");
  const [cooldownTime, setCooldownTime] = useState(60); // Start with 60s

  // --- Auto-decrement timer logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleResend = async () => {
    if (cooldownTime > 0) {
      setResendStatus("cooldown");
      return;
    }

    setLoading(true);
    setResendStatus("idle");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setResendStatus("error");
        console.error("Resend error:", error.message);
      } else {
        setResendStatus("success");
        setCooldownTime(60); // Reset cooldown
      }
    } catch (err) {
      setResendStatus("error");
      console.error("Resend unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isResendDisabled = loading || cooldownTime > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      // FIX: Changed z-50 to z-[100] to stay on top of the navbar
      className="flex justify-center items-center fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side (Gold Gradient - Matches SignUp) */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#EFBF04] via-[#B79308] to-[#8A6D00] p-10 flex flex-col justify-start overflow-hidden text-white pt-20">
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-20 -bottom-20 w-[350px] h-[350px] opacity-[0.1] pointer-events-none mix-blend-overlay">
            <Image
              src="/Cit Logo.svg"
              alt="Watermark"
              width={350}
              height={350}
            />
          </div>

          <div className="relative z-10 space-y-5">
            <h1 className="font-bold leading-tight font-montserrat text-[32px] drop-shadow-md">
              One Step <br />
              <span className="text-[#8B0E0E]">Closer to the Hub.</span>
            </h1>
            <p className="text-white/90 leading-relaxed font-ptsans text-[15px]">
              We just sent a **verification link** to your CIT email. Click the
              link in the email to complete your registration and unlock full
              access.
            </p>
          </div>
        </div>

        {/* Right Side (Message) */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-8 relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-20 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-[420px] flex flex-col gap-4 h-full justify-center py-6 text-center">
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-yellow-400/20 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail size={36} />
              </motion.div>
              <h2 className="text-[28px] font-bold font-montserrat text-gray-900">
                Check Your Email!
              </h2>
              <p className="text-gray-600 font-ptsans text-base mt-2">
                A verification link has been sent to:
                <br />
                <span className="font-bold text-maroon">{email}</span>
              </p>

              {/* --- NEW: Added Spam Folder Note --- */}
              <p className="text-gray-400 font-ptsans text-xs mt-3">
                Can&apos;t find the email? Please check your{" "}
                <strong>Spam</strong> or <strong>Junk</strong> folder.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {resendStatus === "success" && (
                <motion.div
                  key="resend-success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm p-3 rounded-lg font-ptsans bg-green-100 text-green-700 border border-green-200 overflow-hidden"
                >
                  Verification link resent successfully!
                </motion.div>
              )}
              {(resendStatus === "error" || resendStatus === "cooldown") && (
                <motion.div
                  key="resend-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm p-3 rounded-lg font-ptsans bg-red-100 text-red-700 border border-red-200 overflow-hidden"
                >
                  {resendStatus === "cooldown"
                    ? `Please wait ${cooldownTime} seconds before trying to resend.`
                    : `Failed to resend. Please try again later.`}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4"
            >
              <Button
                text={
                  isResendDisabled ? (
                    `Resend in ${cooldownTime}s`
                  ) : loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCcw size={20} /> Resend Link
                    </div>
                  )
                }
                width="w-full"
                height="h-[45px]"
                textSize="text-[16px]"
                onClick={handleResend}
                type="button"
                bg={
                  isResendDisabled
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#DAA520] hover:bg-[#B79308] text-white"
                }
                className={`rounded-[15px] font-bold shadow-lg ${
                  isResendDisabled
                    ? "shadow-none cursor-not-allowed"
                    : "shadow-yellow-500/20"
                }`}
                disabled={isResendDisabled}
              />

              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-gray-500 hover:text-maroon transition-colors cursor-pointer mt-1"
              >
                Go back to Login
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
