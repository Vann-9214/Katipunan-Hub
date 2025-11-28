"use client";

import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface SignInFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
}

export default function SignInForm({ onClose, onSwitch }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@cit.edu")) {
      alert("Only @cit.edu emails are allowed.");
      return;
    }
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
        return;
      }
      if (!data?.user) {
        alert("Login failed. Please check your credentials.");
        return;
      }
      window.location.href = "/Announcement";
    } catch (err) {
      console.error("Login error:", err);
      alert("An unexpected error occurred. Check console for details.");
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
        // SMOOTH FADE ANIMATION - Matches SignUp
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#800000] via-[#5A0505] to-[#2E0202] p-10 flex flex-col justify-center overflow-hidden text-white">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-20 -bottom-20 w-[350px] h-[350px] opacity-[0.07] pointer-events-none">
            <Image src="/Cit Logo.svg" alt="Watermark" width={350} height={350} />
          </div>

          <div className="relative z-10 space-y-5">
            <h1 className="font-bold leading-tight font-montserrat text-[32px] drop-shadow-md">
              Welcome Back, <br /> <span className="text-[#FFD700]">Teknoy!</span>
            </h1>
            <p className="text-white/80 leading-relaxed font-ptsans text-[15px]">
              Access your student dashboard, announcements, and campus tools in one secure hub.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-8 sm:p-10 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-20 cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="w-full max-w-[380px] flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="transform scale-90 origin-left">
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

            <div className="w-full">
              <ToggleButton
                width="w-full"
                height="h-[42px]"
                textSize="text-[14px]"
                leftLabel="Sign In"
                rightLabel="Sign Up"
                active="left"
                onToggle={(side) => {
                  if (side === "right") onSwitch?.();
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                      className="text-xs font-semibold text-gray-500 hover:text-maroon transition-colors cursor-pointer mt-1"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>

              <Button
                text={loading ? "Logging In..." : "Login"}
                width="w-full"
                height="h-[45px]"
                textSize="text-[16px]"
                type="submit"
                bg="bg-[#8B0E0E] hover:bg-[#6d0b0b]"
                className="rounded-[15px] font-bold shadow-lg shadow-maroon/20 mt-1"
              />

              <div className="text-center text-xs font-ptsans text-gray-500 mt-1">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
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