"use client";

import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import Button from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface ForgotPasswordFormProps {
  onClose?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function ForgotPasswordForm({
  onClose,
  onSwitchToSignIn,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.endsWith("@cit.edu")) {
      setMessage(
        "Please use your valid CIT email address (must end with @cit.edu)."
      );
      return;
    }
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // Supabase password recovery
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // NOTE: Ensure you have an actual Next.js page at '/update-password'
        // to handle the final password reset.
        redirectTo: window.location.origin + "/update-password",
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Password recovery email sent successfully! Please check your CIT email to proceed."
        );
        setEmail("");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-maroon focus:ring-1 focus:ring-maroon/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center items-center fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side (Maroon Gradient - Matches SignIn) */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#800000] via-[#5A0505] to-[#2E0202] p-10 flex flex-col justify-start overflow-hidden text-white pt-20">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-20 -bottom-20 w-[350px] h-[350px] opacity-[0.1] pointer-events-none">
            <Image
              src="/Cit Logo.svg"
              alt="Watermark"
              width={350}
              height={350}
            />
          </div>

          <div className="relative z-10 space-y-5">
            <h1 className="font-bold leading-tight font-montserrat text-[32px] drop-shadow-md">
              Reset Your <br />
              <span className="text-[#FFD700]">Teknoy Access.</span>
            </h1>
            <p className="text-white/80 leading-relaxed font-ptsans text-[15px]">
              Enter your registered CIT email below to receive a secure link to
              reset your password. This ensures your account access remains
              protected.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-8 relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-20 cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="w-full max-w-[420px] flex flex-col gap-8 h-full justify-center py-6">
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="transform scale-90 origin-left">
                <Logo unclickable={true} width={45} height={55} />
              </div>
              <div>
                <h2 className="text-[28px] font-bold font-montserrat text-gray-900">
                  Forgot Password?
                </h2>
                <p className="text-gray-500 font-ptsans text-sm">
                  We&apos;ll send a recovery link to your email.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <TextBox
                autoFocus={true}
                type="email"
                placeholder="CIT Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Email Icon.svg"
                rightImageAlt="email icon"
                width="w-full"
                height="h-[45px]"
                textSize="text-[15px]"
                className={inputClasses}
              />

              {message && (
                <div
                  className={`text-sm p-3 rounded-lg font-ptsans ${
                    message.includes("success")
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                text={
                  loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )
                }
                width="w-full"
                height="h-[45px]"
                textSize="text-[16px]"
                type="submit"
                bg="bg-[#8B0E0E] hover:bg-[#6d0b0b]"
                className="rounded-[15px] font-bold shadow-lg shadow-maroon/20"
                disabled={loading}
              />

              <div className="text-center text-xs font-ptsans text-gray-500 mt-2">
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="font-bold text-maroon hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
