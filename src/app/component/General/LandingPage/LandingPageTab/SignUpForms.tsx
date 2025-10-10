"use client";

import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import { useState } from "react";
import { motion } from "framer-motion";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";
import { supabase } from "../../../../../../supabase/Lib/supabaseClient"; // keep your existing path

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

    // Basic validation
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

    // ✅ CIT Email Validation
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

    setLoading(true);

    try {
      // Sign up with Supabase (v2)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const userId = (data as any)?.user?.id ?? null;

      if (!userId) {
        alert(
          "Sign-up succeeded — check your email to confirm your account. After confirming, sign in and your profile will be created."
        );
        return;
      }

      // Insert profile row into Accounts table
      const { error: insertError } = await supabase.from("Accounts").insert([
        {
          id: userId,
          fullName: firstName,
          studentID,
          course: selectedCourse,
          year: selectedYear,
          avatarURL: "",
          role: "student",
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        alert(
          "Account created, but saving profile failed. Check RLS policies or DB constraints. (See console for details.)"
        );
        return;
      }

      alert("Account created successfully! You can now sign in.");
      onSwitch?.();
    } catch (err) {
      console.error("Sign up error:", err);
      alert("Unexpected error during sign-up. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center fixed inset-0 z-1 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex w-[90%] max-w-[1200px] h-[min(90vh,770px)] bg-white rounded-[20px] shadow-md relative overflow-hidden"
      >
        {/* Left Side */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[linear-gradient(to_bottom,#FFCB00,#B79308)] w-[530px] max-h-full m-[10px] rounded-[20px] p-10"
        >
          <h1
            className="font-bold text-white select-none"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(18px,4.5vw,32px)",
            }}
          >
            Create Your Account
          </h1>
          <p
            className="text-white select-none mt-3"
            style={{
              fontFamily: "PT sans, sans-serif",
              fontSize: "clamp(12px,4.5vw,20px)",
            }}
          >
            Join the Katipunan Hub and be part of a platform made for every
            Teknoy. Signing up gives you access to announcements, events,
            groups, chats, and tools that make campus life more connected and
            engaging.
          </p>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="ml-8 flex flex-col flex-1 p-8"
        >
          <Logo unclickable={true} />
          <p
            className="text-[30px] select-none mt-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Join the Katipunan Hub!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <ToggleButton
              leftLabel="Sign In"
              rightLabel="Sign Up"
              active="right"
              onToggle={(side) => {
                if (side === "left") onSwitch?.();
              }}
            />
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col justify-between flex-1 gap-3 mt-5 max-w-[540px]"
          >
            <div className="flex flex-col gap-3">
              <TextBox
                type="text"
                placeholder="Full Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                rightImageSrc="/User.svg"
                rightImageAlt="user icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              <TextBox
                type="email"
                placeholder="CIT Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Mail Plus.svg"
                rightImageAlt="Mail Plus icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />

              <Combobox
                items={programs}
                placeholder="Select Course"
                onChange={(val) => setSelectedCourse(val)}
              />

              <div className="flex justify-between">
                <TextBox
                  type="text"
                  placeholder="Student ID"
                  value={studentID}
                  onChange={(e) => setStudentID(e.target.value)}
                  rightImageSrc="/Id Card.svg"
                  rightImageAlt="Id icon"
                  rightImageWidth={30}
                  rightImageHeight={30}
                  width="w-[260px]"
                  height="h-[55px]"
                />
                <Combobox
                  items={year}
                  width="w-[260px]"
                  dropdownHeight="h-[260px]"
                  placeholder="Select Year"
                  onChange={(val) => setSelectedYear(val)}
                />
              </div>

              <div className="flex justify-between">
                <TextBox
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightImageSrc="/Open Eye Icon.svg"
                  rightToggleImageSrc="Eye Off.svg"
                  rightImageAlt="password icon"
                  rightImageWidth={30}
                  rightImageHeight={30}
                  width="w-[260px]"
                  overrideTypeOnToggle={["password", "text"]}
                  height="h-[55px]"
                />
                <TextBox
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightImageSrc="/Open Eye Icon.svg"
                  rightToggleImageSrc="Eye Off.svg"
                  rightImageAlt="password icon"
                  rightImageWidth={30}
                  rightImageHeight={30}
                  width="w-[260px]"
                  overrideTypeOnToggle={["password", "text"]}
                  height="h-[55px]"
                />
              </div>
            </div>

            <div>
              <Button
                text={loading ? "Signing Up..." : "Sign Up"}
                bg="bg-gold"
                width="w-full"
                type="submit"
              />
            </div>
          </motion.form>
        </motion.div>

        <TextButton
          text="X"
          onClick={onClose}
          className="absolute top-3 right-3"
        />
      </motion.div>
    </motion.div>
  );
}
