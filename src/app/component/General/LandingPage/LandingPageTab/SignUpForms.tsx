"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import {
  COURSE_PROGRAMS,
  YEAR_LEVELS,
  EMAIL_DOMAIN,
} from "../../../../../../supabase/Lib/constants";

interface SignUpFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
  onSuccessfulSignUp?: (email: string) => void;
}

export default function SignUpForm({
  onClose,
  onSwitch,
  onSuccessfulSignUp,
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  const handleStudentIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 9) val = val.slice(0, 9);
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
    }
    if (val.length > 6) {
      formatted = `${val.slice(0, 2)}-${val.slice(2, 6)}-${val.slice(6)}`;
    }
    setStudentID(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setShowVerifyPrompt(false);

    // Validation
    if (
      !firstName.trim() ||
      !email.trim() ||
      !studentID.trim() ||
      !selectedCourse ||
      !selectedYear
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const idRegex = /^\d{2}-\d{4}-\d{3}$/;
    if (!idRegex.test(studentID)) {
      setErrorMessage("Student ID must follow the format: ##-####-###");
      return;
    }

    if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
      setErrorMessage(
        `Please use your valid CIT email address (must end with ${EMAIL_DOMAIN}).`
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            fullName: firstName,
            studentID,
            course: selectedCourse,
            year: selectedYear,
            role: "Student",
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("User already exists")
        ) {
          setErrorMessage(
            "This account is already registered. Please sign in."
          );
          setShowVerifyPrompt(true);
          return;
        }
        setErrorMessage(signUpError.message);
        return;
      }

      setSuccessMessage(
        "Sign up successful! Please check your email or sign in."
      );

      setTimeout(() => {
        onSwitch?.();
      }, 2000);
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setErrorMessage("Unexpected error during sign-up.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerifyClick = () => {
    onSuccessfulSignUp?.(email);
  };

  const inputClasses =
    "bg-gray-50 focus:bg-white transition-all border-gray-300 focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04]/40 text-[15px]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} // Faster fade for background
      className="flex justify-center items-center fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }} // Snappier modal transition
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative"
        // REMOVED 'overflow-hidden' to allow dropdowns to potentially escape if not portalled,
        // though z-index fix in Combobox is the real solution.
      >
        {/* Left Side */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#EFBF04] via-[#B79308] to-[#8A6D00] p-10 flex flex-col justify-start overflow-hidden text-white pt-20 rounded-t-[30px] md:rounded-l-[30px] md:rounded-tr-none">
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
              Activate Your <br />{" "}
              <span className="text-[#8B0E0E]">Teknoy Toolkit.</span>
            </h1>
            <p className="text-white/90 leading-relaxed font-ptsans text-[15px]">
              Create your student account to instantly{" "}
              <span className="font-semibold">unify</span> your campus life.
              Gain <span className="font-semibold">integrated access</span> to
              official announcements, PLC scheduling, Lost & Found resources,
              and community feeds.
            </p>
          </div>
        </div>

        {/* Right Side */}
        {/* Added rounded corners to match parent */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-8 relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-b-[30px] md:rounded-r-[30px] md:rounded-bl-none">
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
              <div className="transform scale-90 origin-left">
                <Logo unclickable={true} width={45} height={55} />
              </div>
              <div>
                <h2 className="text-[26px] font-bold font-montserrat text-gray-900">
                  Sign Up
                </h2>
                <p className="text-gray-500 font-ptsans text-sm">
                  Fill in your details to get started.
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
                active="right"
                rightActiveBg="bg-[#EFBF04]"
                onToggle={(side) => {
                  if (side === "left") onSwitch?.();
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <AnimatePresence>
                {/* Success Message UI */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm p-3 rounded-lg font-ptsans bg-green-100 text-green-700 border border-green-200 overflow-hidden flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> {successMessage}
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm p-3 rounded-lg font-ptsans bg-red-100 text-red-700 border border-red-200 overflow-hidden"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {showVerifyPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex flex-col gap-2"
                  >
                    <p className="text-sm text-yellow-800 font-medium">
                      This account is already registered.
                    </p>
                    <p className="text-xs text-yellow-700">
                      If you haven&apos;t verified your email yet, click below.
                      Otherwise, please sign in.
                    </p>
                    <div className="flex gap-3 mt-1">
                      <button
                        type="button"
                        onClick={handleManualVerifyClick}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        Verify Account <ArrowRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={onSwitch}
                        className="flex-1 bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-100 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2.5">
                <TextBox
                  type="text"
                  autoFocus={true}
                  placeholder="Full Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  rightImageSrc="/User.svg"
                  rightImageAlt="user icon"
                  width="w-full"
                  height="h-[45px]"
                  textSize="text-[15px]"
                  className={inputClasses}
                />
                <TextBox
                  type="email"
                  placeholder="CIT Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  rightImageSrc="/Mail Plus.svg"
                  rightImageAlt="mail icon"
                  width="w-full"
                  height="h-[45px]"
                  textSize="text-[15px]"
                  className={inputClasses}
                />
                <Combobox
                  items={COURSE_PROGRAMS}
                  placeholder="Select Course"
                  onChange={(val) => setSelectedCourse(val)}
                  width="w-full"
                  buttonHeight="h-[45px]"
                  rounded="rounded-full"
                  buttonBG="bg-gray-50"
                  textColor="text-gray-400"
                  borderColor="border-gray-300"
                  hoverBG="hover:bg-white"
                  activeHoverBG="data-[state=open]:bg-white"
                  activeHoverTextColor="data-[state=open]:text-black"
                  checkArrowColor="text-[#EFBF04]"
                  dropdownBorderColor="border-[#EFBF04]"
                  className={inputClasses}
                  textSize="text-[15px]"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <TextBox
                      type="text"
                      placeholder="Student ID (##-####-###)"
                      value={studentID}
                      onChange={handleStudentIDChange}
                      rightImageSrc="/Id Card.svg"
                      rightImageAlt="Id icon"
                      width="w-full"
                      height="h-[45px]"
                      textSize="text-[15px]"
                      className={inputClasses}
                    />
                  </div>
                  <div className="w-[130px]">
                    <Combobox
                      items={YEAR_LEVELS}
                      placeholder="Year"
                      onChange={(val) => setSelectedYear(val)}
                      width="w-full"
                      buttonHeight="h-[45px]"
                      dropdownHeight="h-[180px]"
                      rounded="rounded-full"
                      buttonBG="bg-gray-50"
                      borderColor="border-gray-300"
                      hoverBG="hover:bg-white"
                      checkArrowColor="text-[#EFBF04]"
                      dropdownBorderColor="border-[#EFBF04]"
                      className={inputClasses}
                      textSize="text-[15px]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
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
                    className={inputClasses}
                    overrideTypeOnToggle={["password", "text"]}
                  />
                  <TextBox
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    rightImageSrc="/Open Eye Icon.svg"
                    rightToggleImageSrc="/Eye Off.svg"
                    rightImageAlt="password icon"
                    width="w-full"
                    height="h-[45px]"
                    textSize="text-[15px]"
                    className={inputClasses}
                    overrideTypeOnToggle={["password", "text"]}
                  />
                </div>
              </div>

              <Button
                text={loading ? "Creating..." : "Sign Up"}
                width="w-full"
                height="h-[45px]"
                textSize="text-[16px]"
                type="submit"
                bg="bg-[#EFBF04] hover:bg-[#D4AF37]"
                textcolor="text-white"
                className="rounded-full font-bold shadow-lg shadow-yellow-500/20 mt-2"
                disabled={loading}
              />

              <div className="text-center text-xs font-ptsans text-gray-500 mb-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="font-bold text-[#EFBF04] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
