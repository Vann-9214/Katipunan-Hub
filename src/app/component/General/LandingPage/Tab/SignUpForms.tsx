"use client";

import { useState } from "react";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface SignUpFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
}

export default function SignUpForm({ onClose, onSwitch }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("login", { email, password });
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex w-[90%] max-w-[1200px] h-[min(90vh,770px)] bg-white rounded-[20px] shadow-md relative overflow-hidden">
        {/* Left Side Content */}
        <div className="bg-[linear-gradient(to_bottom,#FFCB00,#B79308)] w-[530px] max-h-full m-[10px] rounded-[20px] p-10">
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
            engaging. Start building your experience today.
          </p>
        </div>
        {/* Right Side Content */}
        <div className="ml-8 flex flex-col flex-1 p-8">
          <div>
            {/* Upper */}
            <Logo unclickable={true} />
            <p
              className="text-[30px] select-none mt-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Join the Katipunan Hub!
            </p>
            {/* Toggle Button */}
            <div className="w-[540px] h-[50px] bg-white rounded-[30px] border mt-2 flex justify-between items-center px-[5px]">
              <TextButton
                text="Sign In"
                className="ml-[75px] text-[#7C7C7C]"
                type="button"
                onClick={() => {
                  console.log("Sign In button in SignUpForm was clicked!");
                  if (onSwitch) {
                    onSwitch();
                  } else {
                    console.error("onSwitch prop is missing!");
                  }
                }}
              />
              <Button
                text="Sign Up"
                textcolor="text-white"
                bg="bg-gold"
                height="h-[40px]"
                width="w-[260px]"
                type="button"
              />
            </div>
          </div>

          {/* Form Text Box */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between flex-1 gap-3 mt-5 w-full max-w-[540px]"
          >
            <div className="flex flex-col gap-3">
              {/* First Name */}
              <TextBox
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                rightImageSrc="/User.svg"
                rightImageAlt="user icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              {/* Email */}
              <TextBox
                type="email"
                placeholder="Cit Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Mail Plus.svg"
                rightImageAlt="Mail Plus icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              {/* Student ID */}
              <TextBox
                type="text"
                placeholder="Student ID"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
                rightImageSrc="/Id Card.svg"
                rightImageAlt="Id icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              {/* Password */}
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
                className="w-full"
                overrideTypeOnToggle={["password", "text"]}
                height="h-[55px]"
              />
              {/* Confirm Password */}
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
                className="w-full"
                overrideTypeOnToggle={["password", "text"]}
                height="h-[55px]"
              />
            </div>
            {/* Login Button */}
            <div className="">
              <Button text="Sign Up" bg="bg-gold" width="w-full" className="" />
            </div>
          </form>
        </div>

        <div>
          <TextButton
            text="X"
            onClick={onClose}
            className="absolute top-3 right-3"
          />
        </div>
      </div>
    </div>
  );
}
