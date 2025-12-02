"use client";

import { useState } from "react";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, X } from "lucide-react";

import Button from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface UpdatePasswordFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdatePasswordForm({
  onClose,
  onSuccess,
}: UpdatePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Success!
        if (onSuccess) onSuccess();
        onClose();
        alert("Password updated successfully! You can now log in.");
        // Redirect to ensure session is fresh
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Update password error:", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04]/40 text-[15px]";

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
        className="flex flex-col md:flex-row w-full max-w-[950px] h-[600px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
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
              Secure Your <br />
              <span className="text-[#FFD700]">Access.</span>
            </h1>
            <p className="text-white/80 leading-relaxed font-ptsans text-[15px]">
              Create a new, strong password to regain access to your Katipunan
              Hub account.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-20 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-[400px] flex flex-col gap-6 h-full justify-center py-6">
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="transform scale-90 origin-left">
                <Logo unclickable={true} width={45} height={55} />
              </div>
              <div>
                <h2 className="text-[26px] font-bold font-montserrat text-gray-900">
                  Reset Password
                </h2>
                <p className="text-gray-500 font-ptsans text-sm">
                  Enter your new password below.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-3">
                <TextBox
                  autoFocus={true}
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightImageSrc="/Open Eye Icon.svg"
                  rightToggleImageSrc="/Eye Off.svg"
                  rightImageAlt="Show Password"
                  width="w-full"
                  height="h-[45px]"
                  textSize="text-[15px]"
                  className={inputClasses}
                  overrideTypeOnToggle={["password", "text"]}
                />

                <TextBox
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightImageSrc="/Open Eye Icon.svg"
                  rightToggleImageSrc="/Eye Off.svg"
                  rightImageAlt="Show Password"
                  width="w-full"
                  height="h-[45px]"
                  textSize="text-[15px]"
                  className={inputClasses}
                  overrideTypeOnToggle={["password", "text"]}
                />
              </div>

              {errorMsg && (
                <div className="text-sm p-3 rounded-lg font-ptsans bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                  <div className="min-w-[4px] h-4 bg-red-500 rounded-full" />
                  {errorMsg}
                </div>
              )}

              <Button
                text={
                  loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Updating...
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
