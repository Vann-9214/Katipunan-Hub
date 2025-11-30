"use client";

import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// 1. Import Icons for the new error UI
import { AlertCircle, ArrowRight } from "lucide-react";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import Button from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface SignInFormProps {
  onClose?: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToForgotPassword?: () => void;
  // 2. Added prop for verification switching
  onSwitchToVerification?: (email: string) => void;
}

export default function SignInForm({
  onClose,
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSwitchToVerification,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. New states for error handling
  const [errorMsg, setErrorMsg] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);

  // 4. Updated Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsUnverified(false);

    if (!email.endsWith("@cit.edu")) {
      setErrorMsg("Only @cit.edu emails are allowed.");
      return;
    }
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for unverified email error
        if (error.message.includes("Email not confirmed")) {
          setIsUnverified(true);
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (!data?.user) {
        setErrorMsg("Login failed. Please check your credentials.");
        return;
      }
      window.location.href = "/Announcement";
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Left Side (Original) */}
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
              Welcome Back, <br />{" "}
              <span className="text-[#FFD700]">Teknoy!</span>
            </h1>
            <p className="text-white/80 leading-relaxed font-ptsans text-[15px]">
              Continue your journey in the{" "}
              <span className="font-semibold">all-in-one platform</span>.
              Seamlessly access announcements, manage your Peer Learning Center
              sessions, and connect with the community in one integrated system.
            </p>
          </div>
        </div>

        {/* Right Side (Original structure with inserted Error UI) */}
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

          <div className="w-full max-w-[420px] flex flex-col gap-4 h-full justify-center py-6">
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="transform scale-90 origin-left mt-1">
                <Logo unclickable={true} width={45} height={55} />
              </div>
              <div>
                <h2 className="text-[28px] font-bold font-montserrat text-gray-900">
                  Sign In
                </h2>
                <p className="text-gray-500 font-ptsans text-sm">
                  Please enter your details to continue.
                </p>
              </div>
            </div>

            <div className="w-full flex-shrink-0">
              <ToggleButton
                width="w-full"
                height="h-[40px]"
                textSize="text-[14px]"
                leftLabel="Sign In"
                rightLabel="Sign Up"
                active="left"
                onToggle={(side) => {
                  if (side === "right") onSwitchToSignUp?.();
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 6. Inserted Error & Verification UI (New Logic) */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm p-3 rounded-lg font-ptsans bg-red-50 text-red-600 border border-red-100 flex items-center gap-2"
                  >
                    <AlertCircle size={16} /> {errorMsg}
                  </motion.div>
                )}
                {isUnverified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2"
                  >
                    <p className="text-sm text-yellow-800 font-medium">
                      Email not verified.
                    </p>
                    <p className="text-xs text-yellow-700">
                      You must verify your email before logging in.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSwitchToVerification?.(email)}
                      className="mt-1 w-full bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      Verify Now <ArrowRight size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Original Inputs */}
              <div className="flex flex-col gap-3">
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
                  className="bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                />

                <div className="flex flex-col gap-1">
                  <TextBox
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightImageSrc="/Open Eye Icon.svg"
                    rightToggleImageSrc="/Eye Off.svg"
                    rightImageAlt="password icon"
                    width="w-full"
                    height="h-[45px]"
                    textSize="text-[15px]"
                    className="bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                    overrideTypeOnToggle={["password", "text"]}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="text-xs font-semibold text-gray-500 hover:text-maroon transition-colors cursor-pointer mt-1"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>

              {/* Original Button with mt-40 preserved */}
              <Button
                text={loading ? "Logging In..." : "Login"}
                width="w-full"
                height="h-[45px]"
                textSize="text-[16px]"
                type="submit"
                bg="bg-[#8B0E0E] hover:bg-[#6d0b0b]"
                className="rounded-[15px] font-bold shadow-lg shadow-maroon/20 mt-40"
              />

              <div className="text-center text-xs font-ptsans text-gray-500 mt-1">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="font-bold text-maroon hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
