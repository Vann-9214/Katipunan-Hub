"use client";

import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  Mail,
  KeyRound,
  Lock,
  CheckCircle2,
  X,
  ArrowLeft,
} from "lucide-react";

import Button from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface ForgotPasswordFormProps {
  onClose?: () => void;
  onSwitchToSignIn?: () => void;
}

type Step = "email" | "code" | "password";

export default function ForgotPasswordForm({
  onClose,
  onSwitchToSignIn,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // --- STEP 1: SEND CODE ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!email.endsWith("@cit.edu")) {
      setMessage("Please use your valid CIT email address (@cit.edu).");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      // We use signInWithOtp with shouldCreateUser: false to ensure we only target existing users
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // ONLY allow existing users (Forgot Password logic)
        },
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setStep("code"); // Move to next step
        setMessage(null);
      }
    } catch (err) {
      console.error("Send code error:", err);
      setMessage("An unexpected error occurred.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY CODE ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (token.length < 6) {
      setMessage("Please enter the 6-digit code.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setStep("password"); // Move to password reset step
        setMessage(null);
      }
    } catch (err) {
      console.error("Verify code error:", err);
      setMessage("Invalid code. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: UPDATE PASSWORD ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        alert("Password updated successfully! You can now log in.");
        window.location.href = "/"; // Refresh to clear auth state/redirect to home
      }
    } catch (err) {
      console.error("Update password error:", err);
      setMessage("Failed to update password.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-[#8B0E0E] focus:ring-1 focus:ring-[#8B0E0E]/20 text-[15px]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center items-center fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side (Maroon Gradient) */}
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
              Don&apos;t worry, it happens. Follow the steps to verify your
              identity and create a new password.
            </p>
          </div>
        </div>

        {/* Right Side (Dynamic Form) */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-20 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-[420px] flex flex-col gap-8 h-full justify-center py-6">
            {/* Header */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="transform scale-90 origin-left">
                <Logo unclickable={true} width={45} height={55} />
              </div>
              <div>
                <h2 className="text-[28px] font-bold font-montserrat text-gray-900">
                  {step === "email"
                    ? "Forgot Password?"
                    : step === "code"
                    ? "Enter Code"
                    : "New Password"}
                </h2>
                <p className="text-gray-500 font-ptsans text-sm">
                  {step === "email"
                    ? "Enter your email to receive a reset code."
                    : step === "code"
                    ? `We sent a code to ${email}`
                    : "Create a strong password."}
                </p>
              </div>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-sm p-3 rounded-lg font-ptsans flex items-center gap-2 ${
                    isError
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isError ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* === STEP 1: EMAIL === */}
            {step === "email" && (
              <form onSubmit={handleSendCode} className="flex flex-col gap-6">
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

                <Button
                  text={
                    loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />{" "}
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Code"
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
            )}

            {/* === STEP 2: CODE === */}
            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
                <div className="relative">
                  <TextBox
                    autoFocus={true}
                    type="text"
                    placeholder="6-Digit Code"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    // Icon for code
                    rightImageSrc="/Id Card.svg"
                    rightImageAlt="code icon"
                    width="w-full"
                    height="h-[45px]"
                    textSize="text-[15px]"
                    className={`${inputClasses} tracking-widest font-bold`}
                  />
                </div>

                <Button
                  text={
                    loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />{" "}
                        Verifying...
                      </div>
                    ) : (
                      "Verify Code"
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

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-maroon transition-colors"
                >
                  <ArrowLeft size={14} /> Wrong email?
                </button>
              </form>
            )}

            {/* === STEP 3: NEW PASSWORD === */}
            {step === "password" && (
              <form
                onSubmit={handleUpdatePassword}
                className="flex flex-col gap-4"
              >
                <div className="space-y-3">
                  <TextBox
                    autoFocus={true}
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightImageSrc="/Open Eye Icon.svg"
                    rightToggleImageSrc="/Eye Off.svg"
                    rightImageAlt="Show"
                    width="w-full"
                    height="h-[45px]"
                    textSize="text-[15px]"
                    className={inputClasses}
                    overrideTypeOnToggle={["password", "text"]}
                  />
                  <TextBox
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    rightImageSrc="/Open Eye Icon.svg"
                    rightToggleImageSrc="/Eye Off.svg"
                    rightImageAlt="Show"
                    width="w-full"
                    height="h-[45px]"
                    textSize="text-[15px]"
                    className={inputClasses}
                    overrideTypeOnToggle={["password", "text"]}
                  />
                </div>

                <Button
                  text={
                    loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />{" "}
                        Updating...
                      </div>
                    ) : (
                      "Update Password"
                    )
                  }
                  width="w-full"
                  height="h-[45px]"
                  textSize="text-[16px]"
                  type="submit"
                  bg="bg-[#8B0E0E] hover:bg-[#6d0b0b]"
                  className="rounded-[15px] font-bold shadow-lg shadow-maroon/20 mt-2"
                  disabled={loading}
                />
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
