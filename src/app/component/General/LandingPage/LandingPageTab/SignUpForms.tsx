"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import { useState } from "react";
import { motion } from "framer-motion";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import Image from "next/image";

interface SignUpFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
}

export default function SignUpForm({ onClose, onSwitch }: SignUpFormProps) {
  const year = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" },
    { value: "5th", label: "5th Year" },
  ];

  const programs = [
    { value: "bs-accountancy", label: "Bachelor of Science in Accountancy" },
    { value: "bsba", label: "Bachelor of Science in Business Administration" },
    { value: "bsoa", label: "Bachelor of Science in Office Administration" },
    { value: "ba-english", label: "Bachelor of Arts in English" },
    {
      value: "ba-political-science",
      label: "Bachelor of Arts in Political Science",
    },
    { value: "bs-psychology", label: "Bachelor of Science in Psychology" },
    { value: "bs-biology", label: "Bachelor of Science in Biology" },
    { value: "bs-mathematics", label: "Bachelor of Science in Mathematics" },
    {
      value: "bs-computer-science",
      label: "Bachelor of Science in Computer Science",
    },
    {
      value: "bs-information-technology",
      label: "Bachelor of Science in Information Technology",
    },
    {
      value: "bs-computer-engineering",
      label: "Bachelor of Science in Computer Engineering",
    },
    { value: "beed", label: "Bachelor of Elementary Education" },
    { value: "bsed", label: "Bachelor of Secondary Education" },
    { value: "bsee", label: "Bachelor of Science in Electrical Engineering" },
    { value: "bsie", label: "Bachelor of Science in Industrial Engineering" },
    { value: "bsce", label: "Bachelor of Science in Civil Engineering" },
    { value: "bsme", label: "Bachelor of Science in Mechanical Engineering" },
    { value: "bsmining", label: "Bachelor of Science in Mining Engineering" },
    {
      value: "bs-chemeng",
      label: "Bachelor of Science in Chemical Engineering",
    },
    { value: "bsece", label: "Bachelor of Science in Electronics Engineering" },
    { value: "bsn", label: "Bachelor of Science in Nursing" },
    { value: "midwifery", label: "Diploma in Midwifery" },
    { value: "bs-architecture", label: "Bachelor of Science in Architecture" },
    {
      value: "bs-hrm",
      label: "Bachelor of Science in Hotel and Restaurant Management",
    },
    { value: "bstm", label: "Bachelor of Science in Tourism Management" },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !firstName.trim() ||
        !email.trim() ||
        !studentID.trim() ||
        !selectedCourse ||
        !selectedYear
      ) {
        alert("Please fill in all required fields.");
        return;
      }

      if (!email.toLowerCase().endsWith("@cit.edu")) {
        alert(
          "Please use your valid CIT email address (must end with @cit.edu)."
        );
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        alert(signUpError.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Sign-up succeeded — please check your CIT email to confirm your account."
        );
        return;
      }

      const { error: insertError } = await supabase.from("Accounts").insert([
        {
          id: user.id,
          fullName: firstName,
          studentID,
          course: selectedCourse,
          year: selectedYear,
          avatarURL: "",
          role: "Student",
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Account created, but saving profile failed.");
        return;
      }

      alert("Account created successfully! You can now sign in.");
      onSwitch?.();
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      alert("Unexpected error during sign-up.");
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
      className="flex justify-center items-center fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        // REMOVED SCALE ANIMATION on EXIT to prevent "closing" look
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col md:flex-row w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#EFBF04] via-[#B79308] to-[#8A6D00] p-10 flex flex-col justify-center overflow-hidden text-white">
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
              Join the Hub, <br />{" "}
              <span className="text-[#8B0E0E]">Teknoy!</span>
            </h1>
            <p className="text-white/90 leading-relaxed font-ptsans text-[15px]">
              Create your account to access announcements, join events, and
              connect with the whole CIT university community.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        {/* HIDE SCROLLBAR UTILITY CLASSES */}
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
                  items={programs}
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
                  textSize="text-[15px]" // Added text size to match input
                />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <TextBox
                      type="text"
                      placeholder="Student ID"
                      value={studentID}
                      onChange={(e) => setStudentID(e.target.value)}
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
                      items={year}
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
                      textSize="text-[15px]" // Added text size to match input
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
