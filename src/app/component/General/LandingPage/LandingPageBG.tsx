"use client";

import LandingPageTab from "./Tab/LandingPageTab";
import Button from "../../ReusableComponent/Buttons";
import SignUpForm from "./Tab/SignUpForms";
import SignInForm from "./Tab/SignInForms";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function LandingPageBG() {
  // controls which modal is open
  const [mode, setMode] = useState<"none" | "signup" | "signin">("none");

  return (
    <div className="bg-gold h-screen w-full relative flex">
      <LandingPageTab />

      {/* Texts */}
      <div
        className="relative z-10 px-24 select-none"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <h1 className="mt-40 leading-[1.1]">
          <span className="text-gold font-bold text-[96px]">STAY </span>
          <span className="text-white font-bold text-[64px]">UPDATED</span>
          <br />
          <span className="text-gold font-bold text-[96px] pl-20">STAY </span>
          <span className="text-white font-bold text-[64px]">CONNECTED</span>
          <br />
        </h1>
        <p
          className="text-[28px] text-gray-200 font-bold mt-10"
          style={{ fontFamily: "PT Sans, sans-serif" }}
        >
          From school events to lost & found, Katipunan Hub keeps
          <br />
          <span className="ml-25">the whole CIT community in one place</span>
        </p>

        {/* Buttons */}
        <Button
          text="JOIN THE HUB"
          bg="bg-gold"
          font="font-bold"
          className="mt-5 ml-20"
          onClick={() => setMode("signup")}
        />
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {mode === "signup" && (
          <SignUpForm
            key="signup"
            onClose={() => setMode("none")}
            onSwitch={() => setMode("signin")}
          />
        )}
        {mode === "signin" && (
          <SignInForm
            key="signin"
            onClose={() => setMode("none")}
            onSwitch={() => setMode("signup")}
          />
        )}
      </AnimatePresence>
      {/* Background circle */}
      <div className="absolute -top-180 -left-80 w-[1400px] h-[1400px] rounded-full bg-maroon z-0" />
    </div>
  );
}
